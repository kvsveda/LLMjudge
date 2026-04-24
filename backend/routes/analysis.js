// ============================================================
//  routes/analysis.js — Analysis route
// ============================================================
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const analysisController = require('../controllers/analysisController');

// POST /api/analysis/run  — protected route
router.post('/run', authMiddleware, analysisController.runAnalysis);

// GET /api/analysis/history — protected route
router.get('/history', authMiddleware, analysisController.getHistory);

module.exports = router;
