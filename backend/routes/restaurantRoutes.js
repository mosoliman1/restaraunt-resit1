// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// List restaurants
router.get('/', restaurantController.getAll);

// Table availability for a restaurant
router.get('/:id/table/availability', restaurantController.getAvailability);

module.exports = router;
