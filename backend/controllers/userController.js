// controllers/userController.js
const User = require('../models/userModel');

exports.getProfile = (req, res) => {
  const userId = req.user.userId;

  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errorCode: 'SERVER_ERROR'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        errorCode: 'UNAUTHENTICATED'
      });
    }

    return res.json({
      success: true,
      statusCode: 200,
      data: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.user.userId;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      errorCode: 'INVALID_DATA'
    });
  }

  User.updateProfile(userId, name, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errorCode: 'SERVER_ERROR'
      });
    }

    return res.json({
      success: true,
      statusCode: 200,
      data: { id: userId, name }
    });
  });
};
