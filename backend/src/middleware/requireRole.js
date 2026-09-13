module.exports = roles => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden. Your role cannot perform this action.' });
  }
  return next();
};