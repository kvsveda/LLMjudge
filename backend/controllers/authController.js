// ============================================================
//  controllers/authController.js
// ============================================================
const jwt      = require('jsonwebtoken');
const UserStore = require('../config/users');
const nodemailer = require('nodemailer');
const { Otp, connectDb } = require('../config/database');

// ── Utility: wrap any promise with a hard timeout ─────────────
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Build SMTP transporter (no verify() — avoid hang) ─────────
function buildTransporter() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      'SMTP not configured. Add SMTP_USER and SMTP_PASS to your .env. ' +
      'For Gmail, generate an App Password at https://myaccount.google.com/apppasswords'
    );
  }

  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',   // false = STARTTLS on 587
    auth:   { user: smtpUser, pass: smtpPass },
    // Socket-level timeouts so nodemailer never hangs forever
    connectionTimeout: 10_000,   // 10 s to establish TCP connection
    greetingTimeout:   10_000,   // 10 s waiting for server greeting
    socketTimeout:     15_000,   // 15 s of inactivity kills the socket
  });
}

// Helper to sign JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Send OTP ─────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Basic field validation (fast, no I/O) ─────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // ── DNS MX check — 5 s hard timeout ──────────────────────
    // (dns.resolveMx can hang indefinitely on some networks)
    try {
      const dns = require('dns').promises;
      const domain = email.split('@')[1];
      const mxRecords = await withTimeout(
        dns.resolveMx(domain),
        5_000,
        'DNS MX lookup'
      );
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ error: 'This email domain cannot receive emails.' });
      }
    } catch (dnsErr) {
      // Timeout or NXDOMAIN — skip the check rather than blocking signup
      // for a real domain like gmail.com this will always succeed quickly
      console.warn('DNS MX check warning:', dnsErr.message);
      // Only hard-block if it's clearly a bad domain (ENOTFOUND etc.)
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
        return res.status(400).json({ error: 'Invalid email domain or domain does not exist.' });
      }
      // For timeouts: continue — gmail.com is definitely valid
    }

    // ── Duplicate account check ───────────────────────────────
    const existingUser = await withTimeout(
      UserStore.findByEmail(email),
      8_000,
      'DB duplicate check'
    );
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // ── Connect DB & store OTP ────────────────────────────────
    await withTimeout(connectDb(), 8_000, 'DB connect');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await withTimeout(
      Otp.deleteMany({ email: email.toLowerCase() }),
      5_000,
      'OTP cleanup'
    );
    await withTimeout(
      Otp.create({ email: email.toLowerCase(), otp: otpCode }),
      5_000,
      'OTP save'
    );

    // ── Build transporter & send email — 20 s hard timeout ───
    let transporter;
    try {
      transporter = buildTransporter();
    } catch (smtpErr) {
      console.error('SMTP config error:', smtpErr.message);
      return res.status(500).json({ error: smtpErr.message });
    }

    try {
      await withTimeout(
        transporter.sendMail({
          from:    `"${process.env.YOUR_SITE_NAME || 'LLMJudge'}" <${process.env.SMTP_USER}>`,
          to:      email,
          subject: 'Your LLMJudge Verification Code',
          text:    `Your OTP is: ${otpCode}\n\nIt expires in 10 minutes. Do not share it.`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;
                        border:1px solid #e5e7eb;border-radius:12px;background:#ffffff">
              <h2 style="color:#4f46e5;margin:0 0 8px">LLMJudge</h2>
              <p style="color:#374151;margin:0 0 4px">Your verification code is:</p>
              <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#111827;
                          margin:20px 0;padding:16px;background:#f3f4f6;
                          border-radius:8px;text-align:center">
                ${otpCode}
              </div>
              <p style="color:#6b7280;font-size:13px;margin:0">
                Expires in <strong>10 minutes</strong>. Do not share this code.
              </p>
            </div>
          `,
        }),
        20_000,   // 20 s — Gmail SMTP can be slow on first connection
        'sendMail'
      );
    } catch (sendErr) {
      console.error('Email send error:', sendErr.message);

      // Surface a specific, actionable error for auth failures
      if (
        sendErr.message.includes('535') ||
        sendErr.message.includes('Invalid login') ||
        sendErr.message.includes('Username and Password')
      ) {
        return res.status(500).json({
          error:
            'Gmail login failed. You must use a Gmail App Password, not your regular password. ' +
            'Generate one at https://myaccount.google.com/apppasswords',
        });
      }

      if (sendErr.message.includes('timed out')) {
        return res.status(500).json({
          error: 'Email server did not respond in time. Check your SMTP settings and try again.',
        });
      }

      return res.status(500).json({
        error: 'Failed to send email: ' + sendErr.message,
      });
    }

    console.log('[OTP] Sent to:', email);
    res.status(200).json({ message: 'OTP sent to email successfully.' });

  } catch (err) {
    console.error('[sendOtp] Unexpected error:', err.message);
    res.status(500).json({ error: 'Unexpected error: ' + err.message });
  }
};

// ── Verify OTP & complete signup ──────────────────────────────
exports.verifyOtpAndSignup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'All fields including OTP are required.' });
    }

    await withTimeout(connectDb(), 8_000, 'DB connect');

    const otpRecord = await withTimeout(
      Otp.findOne({ email: email.toLowerCase(), otp }),
      5_000,
      'OTP lookup'
    );

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new code.' });
    }

    // Race-condition guard
    const existingUser = await withTimeout(
      UserStore.findByEmail(email),
      8_000,
      'Duplicate check'
    );
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await withTimeout(
      UserStore.create({ name: name.trim(), email, password }),
      10_000,
      'User create'
    );

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});

    const token = signToken(user.id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: UserStore.sanitize(user),
    });
  } catch (err) {
    console.error('[verifyOtpAndSignup] Error:', err.message);
    res.status(500).json({ error: 'Failed to create account: ' + err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await withTimeout(
      UserStore.findByEmail(email),
      8_000,
      'User lookup'
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await withTimeout(
      UserStore.comparePassword(password, user.password),
      5_000,
      'Password compare'
    );
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user.id);

    res.json({
      message: 'Logged in successfully!',
      token,
      user: UserStore.sanitize(user),
    });
  } catch (err) {
    console.error('[login] Error:', err.message);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

// ── Get current user ──────────────────────────────────────────
exports.getMe = (req, res) => {
  res.json({ user: req.user });
};
