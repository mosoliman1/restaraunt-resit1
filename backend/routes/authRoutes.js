// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Signup
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
