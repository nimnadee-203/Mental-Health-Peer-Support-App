const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Empty token.' });
  }

  let userId = '';

  // If token looks like a JWT (contains three base64 parts separated by dots)
  if (token.includes('.') && token.split('.').length === 3) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(
        Buffer.from(payloadBase64, 'base64').toString('utf-8')
      );
      userId = decodedPayload.id || decodedPayload.userId || decodedPayload.sub;
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized. Malformed JWT token.' });
    }
  } else {
    // Otherwise treat the token directly as the userId (which should be a valid ObjectId)
    userId = token;
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ error: 'Unauthorized. Invalid user ID.' });
  }

  // Attach authenticated user information to request
  req.user = { id: userId };
  next();
};
