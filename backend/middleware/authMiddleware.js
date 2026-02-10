// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      errorCode: 'UNAUTHENTICATED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      errorCode: 'UNAUTHENTICATED'
    });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      errorCode: 'NOT_ADMIN'
    });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
