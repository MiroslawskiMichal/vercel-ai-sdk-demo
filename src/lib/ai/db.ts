import Database from 'better-sqlite3';

type GlobalDb = {
  ordersDb?: Database.Database;
};

const globalForDb = globalThis as typeof globalThis & GlobalDb;

export const db =
  globalForDb.ordersDb ??
  new Database('local.db', {
    fileMustExist: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.ordersDb = db;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const count = db
  .prepare('SELECT COUNT(*) AS count FROM orders')
  .get() as { count: number };

if (count.count === 0) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, user_email, total, status)
    VALUES (?, ?, ?, ?)
  `);

  insertOrder.run('ORD-1', 'jan@example.com', 120, 'shipped');
  insertOrder.run('ORD-2', 'jan@example.com', 80, 'processing');
  insertOrder.run('ORD-3', 'anna@example.com', 200, 'delivered');
}
