// models/tableModel.js
const db = require('../db');

const Table = {
  getByRestaurant(restaurantId, callback) {
    db.all(
      'SELECT * FROM tables WHERE restaurantId = ? AND status = "available"',
      [restaurantId],
      callback
    );
  }
};

module.exports = Table;
