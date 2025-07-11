const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('stock.db');

// Enable foreign key support
db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);

  // Create products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      image TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create sales table
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total REAL,
      payment_method TEXT,
      customer_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(
    `
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
`
  )

  // Create admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add items column to sales if missing
  db.get("PRAGMA table_info(sales)", (err, row) => {
    db.all("PRAGMA table_info(sales)", (err, columns) => {
      const hasItems = columns.some(col => col.name === 'items');
      if (!hasItems) {
        db.run("ALTER TABLE sales ADD COLUMN items TEXT");
      }
    });
  });

  // Add cost_price column to products if missing
  db.all("PRAGMA table_info(products)", (err, columns) => {
    const hasCostPrice = columns.some(col => col.name === 'cost_price');
    if (!hasCostPrice) {
      db.run("ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0");
    }
  });

  // Add reorder_threshold column to products if missing
  db.all("PRAGMA table_info(products)", (err, columns) => {
    const hasThreshold = columns.some(col => col.name === 'reorder_threshold');
    if (!hasThreshold) {
      db.run("ALTER TABLE products ADD COLUMN reorder_threshold INTEGER DEFAULT 10");
    }
  });
});

module.exports = db;
