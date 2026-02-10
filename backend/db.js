const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./restaurant.db', (err) => {
  if (err) {
    console.error('Error opening DB', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create one simple admin user the first time (email: mando119@gmail.com, password: 111222)
  const ADMIN_EMAIL = 'mando119@gmail.com';
  const ADMIN_PASSWORD = '111222';
  const SALT_ROUNDS = 10;

  db.get(
    'SELECT COUNT(*) AS count FROM users WHERE email = ?',
    [ADMIN_EMAIL],
    (err, row) => {
      if (err) {
        console.error('Admin seed check error:', err.message);
        return;
      }

      if (!row || row.count > 0) {
        return;
      }

      bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS, (hashErr, hash) => {
        if (hashErr) {
          console.error('Admin seed hash error:', hashErr.message);
          return;
        }

        const sql = `
          INSERT INTO users (name, email, password_hash, role)
          VALUES (?, ?, ?, ?)
        `;

        db.run(sql, ['Admin', ADMIN_EMAIL, hash, 'admin'], (insErr) => {
          if (insErr) {
            console.error('Admin seed insert error:', insErr.message);
          } else {
            console.log('✅ Seeded default admin user (email: mando119, password: 123).');
          }
        });
      });
    }
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      restaurantId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      description TEXT
    )
  `);

  // Seed restaurants ONCE (do not duplicate on every server restart)
db.get("SELECT COUNT(*) AS count FROM restaurants", [], (err, row) => {
  if (err) return console.error("Seed check error:", err.message);

  if (row.count === 0) {
    const restaurants = [
      ["Mando Pizzeria", "Cairo", "Best pizza in town"],
      ["Nile Grill", "Giza", "Egyptian & grilled classics"],
      ["Alex SeaFood House", "Alexandria", "Fresh seafood daily"],
      ["Downtown Burgers", "Cairo", "Smash burgers & fries"],
      ["Sushi Sakura", "New Cairo", "Japanese sushi & ramen"],
      ["Tikka Corner", "Nasr City", "Chicken tikka & wraps"],
      ["Pattini", "Maadi", "Italian pasta & salads"],
      ["Lychee", "Sheikh Zayed", "Healthy bowls & smoothies"]
    ];

    const stmt = db.prepare(
      "INSERT INTO restaurants (name, location, description) VALUES (?, ?, ?)"
    );

    restaurants.forEach((r) => stmt.run(r[0], r[1], r[2]));
    stmt.finalize();

    console.log("✅ Seeded restaurants (first run only).");
  }
});



  db.run(`
    CREATE TABLE IF NOT EXISTS tables (
      tableId INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurantId INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT DEFAULT 'available',
      FOREIGN KEY (restaurantId) REFERENCES restaurants(restaurantId)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      reservationId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      restaurantId INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(userId),
      FOREIGN KEY (restaurantId) REFERENCES restaurants(restaurantId)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS restaurant_schedule (
      scheduleId INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurantId INTEGER NOT NULL,
      closedTime TEXT NOT NULL,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(restaurantId)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auth_logs (
      logId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      email TEXT,
      event_type TEXT,
      ip_address TEXT,
      user_agent TEXT,
      success INTEGER,
      failure_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
