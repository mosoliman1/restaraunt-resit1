// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/reservations', authMiddleware, adminMiddleware, adminController.viewAllReservations);

router.post(
  '/reservations/:id/decision',
  authMiddleware,
  adminMiddleware,
  adminController.decisionReservation
);

router.put('/tables', authMiddleware, adminMiddleware, adminController.updateTables);

router.put('/schedule', authMiddleware, adminMiddleware, adminController.updateSchedule);

// Add a new restaurant (admin only)
router.post('/restaurants', authMiddleware, adminMiddleware, adminController.createRestaurant);

module.exports = router;
