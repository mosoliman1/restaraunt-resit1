// models/authLogModel.js
const db = require('../db');

const AuthLog = {
  log(event) {
    const {
      userId,
      email,
      event_type,
      ip_address,
      user_agent,
      success,
      failure_reason
    } = event;

    const sql = `
      INSERT INTO auth_logs (userId, email, event_type, ip_address, user_agent, success, failure_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      userId || null,
      email || null,
      event_type,
      ip_address || null,
      user_agent || null,
      success ? 1 : 0,
      failure_reason || null
    ]);
  }
};

module.exports = AuthLog;
