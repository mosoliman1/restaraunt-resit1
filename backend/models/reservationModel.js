// models/reservationModel.js
const db = require('../db');
const Restaurant = require('./restaurantModel');

const Reservation = {
  // Simpler implementation without using SQL JOINs.
  // 1) Get the user's reservations.
  // 2) For each reservation, fetch its restaurant separately.
  // This keeps the logic easy to read for learning purposes.
  getByUser(userId, callback) {
    const sql = `
      SELECT reservationId, date, time, guests, status, restaurantId
      FROM reservations
      WHERE userId = ?
        AND (status IS NULL OR status != 'cancelled')
      ORDER BY date DESC, time DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) return callback(err);
      if (!rows || rows.length === 0) return callback(null, []);

      const result = [];
      let remaining = rows.length;
      let finished = false;

      rows.forEach((r) => {
        Restaurant.findById(r.restaurantId, (restaurantErr, restaurant) => {
          if (finished) return;
          if (restaurantErr) {
            finished = true;
            return callback(restaurantErr);
          }

          result.push({
            reservationId: r.reservationId,
            date: r.date,
            time: r.time,
            guests: r.guests,
            status: r.status,
            restaurantId: restaurant ? restaurant.restaurantId : r.restaurantId,
            restaurantName: restaurant ? restaurant.name : null,
            restaurantLocation: restaurant ? restaurant.location : null
          });

          remaining -= 1;
          if (remaining === 0 && !finished) {
            finished = true;
            callback(null, result);
          }
        });
      });
    });
  },


  create({ userId, restaurantId, date, time, guests }, callback) {
    const sql = `
      INSERT INTO reservations (userId, restaurantId, date, time, guests)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [userId, restaurantId, date, time, guests], function (err) {
      if (err) return callback(err);
      callback(null, { reservationId: this.lastID });
    });
  },

  update(reservationId, { date, time }, userId, callback) {
    const sql = `
      UPDATE reservations
      SET date = ?, time = ?
      WHERE reservationId = ? AND userId = ?
    `;
    db.run(sql, [date, time, reservationId, userId], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        return callback(new Error('NOT_FOUND'));
      }
      callback(null);
    });
  },

  cancel(reservationId, userId, callback) {
    const sql = `
      UPDATE reservations
      SET status = 'cancelled'
      WHERE reservationId = ? AND userId = ?
    `;
    db.run(sql, [reservationId, userId], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        return callback(new Error('NOT_FOUND'));
      }
      callback(null);
    });
  },

  getAll(callback) {
    db.all('SELECT * FROM reservations', [], callback);
  },

  changeStatus(reservationId, status, callback) {
    const sql = `
      UPDATE reservations
      SET status = ?
      WHERE reservationId = ?
    `;
    db.run(sql, [status, reservationId], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        return callback(new Error('NOT_FOUND'));
      }
      callback(null);
    });
  }
};

module.exports = Reservation;
