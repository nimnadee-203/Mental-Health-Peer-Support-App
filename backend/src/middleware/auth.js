const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mind-mate-development-secret';

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Empty token.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token subject.' });
    }

    // Prefer live role/profile from DB when available. Login lives on `server/`,
    // so a valid JWT is enough to authenticate even if this process cannot
    // resolve the user document (shared-DB lag, partial sync, etc.).
    const user = await User.findById(userId).select('_id role fullName email');
    const roleFromToken =
      payload.role === 'moderator' || payload.role === 'admin' || payload.role === 'user'
        ? payload.role
        : 'user';

    req.user = {
      id: userId,
      role: user?.role || roleFromToken,
      fullName: user?.fullName,
      email: user?.email,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};
