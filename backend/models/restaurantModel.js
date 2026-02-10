// models/restaurantModel.js
const db = require('../db');

const Restaurant = {
  getAll(callback) {
    db.all(
      'SELECT restaurantId AS id, name, location FROM restaurants',
      [],
      callback
    );
  },

  findById(id, callback) {
    db.get(
      'SELECT * FROM restaurants WHERE restaurantId = ?',
      [id],
      callback
    );
  },

  create(name, location, description, callback) {
    const sql =
      'INSERT INTO restaurants (name, location, description) VALUES (?, ?, ?)';
    db.run(sql, [name, location, description], function (err) {
      if (err) return callback(err);
      callback(null, { restaurantId: this.lastID });
    });
  }
};

module.exports = Restaurant;
