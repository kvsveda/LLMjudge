// ============================================================
//  config/database.js — MongoDB connection via Mongoose
// ============================================================
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let isConnected = false;

async function connectDb() {
  if (isConnected) return;

  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/llmjudge';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    isConnected = true;
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.log('⚠️ Local MongoDB not found. Starting in-memory MongoDB...');
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✅ In-memory MongoDB connected.');
  }
}

// ── User Schema ───────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true },
});

// ── History Schema ────────────────────────────────────────────
const historySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  modelsData: { type: mongoose.Schema.Types.Mixed, required: true },
  judgeData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: String, required: true },
});

historySchema.index({ userId: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const History = mongoose.models.History || mongoose.model('History', historySchema);
const Otp = mongoose.models.Otp || mongoose.model('Otp', new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }
}));

module.exports = { connectDb, User, History, Otp };
