// controllers/restaurantController.js
const Restaurant = require('../models/restaurantModel');
const Table = require('../models/tableModel');

exports.getAll = (req, res) => {
  Restaurant.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errorCode: 'SERVER_ERROR'
      });
    }

    return res.json({
      success: true,
      data: rows
    });
  });
};

// Very simple availability: just returns how many "available" tables exist now.
// You can later improve by using reservations + schedule.
exports.getAvailability = (req, res) => {
  const restaurantId = req.params.id;

  Table.getByRestaurant(restaurantId, (err, tables) => {
    if (err) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errorCode: 'SERVER_ERROR'
      });
    }

    if (!tables || tables.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        errorCode: 'NON_AVAILABILITY'
      });
    }

    return res.json({
      success: true,
      data: {
        restaurantId: Number(restaurantId),
        availableTimeSlots: [
          { time: '18:00', tables: tables.length },
          { time: '20:00', tables: Math.max(0, tables.length - 1) }
        ]
      }
    });
  });
};

exports.getMyReservations = (req, res) => {
  const userId = req.user.userId;

  Reservation.getByUser(userId, (err, rows) => {
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
      data: rows
    });
  });
};
