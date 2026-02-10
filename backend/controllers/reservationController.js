// controllers/reservationController.js
const Reservation = require('../models/reservationModel');

exports.createReservation = (req, res) => {
  const userId = req.user.userId;
  const { restaurantId, date, time, guests } = req.body;

  if (!restaurantId || !date || !time || !guests) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      errorCode: 'INVALID_DATA'
    });
  }

  Reservation.create(
    { userId, restaurantId, date, time, guests },
    (err, result) => {
      if (err) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errorCode: 'NO_TABLES',
          errorDetails: 'No tables available'
        });
      }

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Reservation created',
        data: {
          reservationId: result.reservationId
        }
      });
    }
  );
};

exports.modifyReservation = (req, res) => {
  const userId = req.user.userId;
  const reservationId = req.params.id;
  const { date, time } = req.body;

  Reservation.update(reservationId, { date, time }, userId, (err) => {
    if (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errorCode: 'RESERVATION_NOT_FOUND'
        });
      }
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errorCode: 'SERVER_ERROR'
      });
    }

    return res.json({
      success: true,
      statusCode: 200,
      message: 'Updated'
    });
  });
};

exports.cancelReservation = (req, res) => {
  const userId = req.user.userId;
  const reservationId = req.params.id;

  Reservation.cancel(reservationId, userId, (err) => {
    if (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errorCode: 'NOT_FOUND'
        });
      }
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errorCode: 'SERVER_ERROR'
      });
    }

    return res.json({
      success: true,
      statusCode: 200,
      message: 'Cancelled'
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
