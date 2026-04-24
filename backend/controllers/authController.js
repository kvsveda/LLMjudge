// ============================================================
//  controllers/authController.js
// ============================================================
const jwt = require('jsonwebtoken');
const UserStore = require('../config/users');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');
const { Otp, connectDb } = require('../config/database');

async function getTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  throw new Error('Email sending is not configured. Please set SMTP_USER and SMTP_PASS in .env');
}

// Helper to sign a JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Send OTP ─────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
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

    // Validate that the email domain actually exists and can receive emails
    try {
      const domain = email.split('@')[1];
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ error: 'This email domain cannot receive emails.' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid email domain or domain does not exist.' });
    }

    // Check duplicate
    const existingUser = await UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Connect DB
    await connectDb();

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs for this email to prevent multiple valid OTPs
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await Otp.create({ email: email.toLowerCase(), otp: otpCode });

    // Send email
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"${process.env.YOUR_SITE_NAME || 'LLMJudge'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP is: ${otpCode}. It expires in 10 minutes.`,
      html: `<b>Your OTP is: ${otpCode}</b><br>It expires in 10 minutes.`
    });

    console.log('OTP sent to: %s', email);

    res.status(200).json({
      message: 'OTP sent to email successfully.'
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// ── Verify OTP & Signup ──────────────────────────────────────
exports.verifyOtpAndSignup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'All fields including OTP are required.' });
    }

    await connectDb();

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Check duplicate again just in case
    const existingUser = await UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await UserStore.create({ name: name.trim(), email, password });
    
    // Cleanup OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    const token = signToken(user.id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: UserStore.sanitize(user),
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
};

// ── Login ────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await UserStore.comparePassword(password, user.password);
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
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── Get current user ─────────────────────────────────────────
exports.getMe = (req, res) => {
  res.json({ user: req.user });
};
