// models/scheduleModel.js
const db = require('../db');

const Schedule = {
  updateSchedule(restaurantId, closedTimes, callback) {
    db.serialize(() => {
      db.run(
        'DELETE FROM restaurant_schedule WHERE restaurantId = ?',
        [restaurantId],
        (err) => {
          if (err) return callback(err);

          const stmt = db.prepare(
            'INSERT INTO restaurant_schedule (restaurantId, closedTime) VALUES (?, ?)'
          );
          closedTimes.forEach((time) => {
            stmt.run([restaurantId, time]);
          });
          stmt.finalize(callback);
        }
      );
    });
  }
};

module.exports = Schedule;
