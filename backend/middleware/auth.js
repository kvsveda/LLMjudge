// ============================================================
//  middleware/auth.js — JWT verification middleware
// ============================================================
const jwt = require('jsonwebtoken');
const UserStore = require('../config/users');

const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS === 'true';
const DEV_BYPASS_USER = {
  id: 'dev-bypass-user',
  name: 'Dev Guest',
  email: 'dev-guest@local.test',
  createdAt: new Date(0).toISOString(),
};

const authMiddleware = async (req, res, next) => {
  if (AUTH_BYPASS_ENABLED) {
    req.user = DEV_BYPASS_USER;
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserStore.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = UserStore.sanitize(user);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
