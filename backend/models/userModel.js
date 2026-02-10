// models/userModel.js
const db = require('../db');

const User = {
  findByEmail(email, callback) {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  },

  findById(userId, callback) {
    db.get('SELECT * FROM users WHERE userId = ?', [userId], callback);
  },

  create(name, email, passwordHash, role = 'user', callback) {
    const sql =
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, passwordHash, role], function (err) {
      if (err) return callback(err);
      callback(null, { userId: this.lastID });
    });
  },

  updateProfile(userId, name, callback) {
    const sql = 'UPDATE users SET name = ? WHERE userId = ?';
    db.run(sql, [name, userId], function (err) {
      if (err) return callback(err);
      callback(null);
    });
  }
};

module.exports = User;
