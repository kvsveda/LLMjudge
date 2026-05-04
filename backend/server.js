const { getOpenRouterApiKey } = require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDb } = require('./config/database');

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');

const app = express();
app.set('trust proxy', 1);

// ── Security middleware ──────────────────────────────────────
app.use(helmet());

// ✅ FIXED CORS CONFIG
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ll-mjudge-63hy.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
}));

// ✅ HANDLE PREFLIGHT REQUESTS (VERY IMPORTANT)
app.options("*", cors());

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Analysis endpoint stricter limit
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Analysis limit reached. Please wait before running more analyses.' },
});
app.use('/api/analysis', analysisLimiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  // ✅ IMPORTANT: return proper CORS error instead of crashing
  if (err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 LLM Judge Backend running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
      if (!getOpenRouterApiKey()) {
        console.warn('⚠️ OpenRouter API key missing.');
      }
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
