const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(__dirname, '..', process.env.DATABASE_PATH)
  : path.join(dbDir, 'ecommerce.db');

// Initialize SQLite database instance
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? null : null
});

// Enable WAL mode for high concurrency performance and enforce Foreign Keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initializes all database tables and schema constraints
 */
function initDatabase() {
  const schema = `
    -- 1. USERS
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. CUSTOMERS (Extended user profile for OOAD Customer entity)
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'United States',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. CATEGORIES
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
      image_url TEXT,
      is_available INTEGER NOT NULL DEFAULT 1 CHECK(is_available IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- 5. INVENTORY LOGS (Audit trail for inventory movements)
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      change_type TEXT NOT NULL CHECK(change_type IN ('INITIAL_STOCK', 'RESTOCK', 'ORDER_DEDUCT', 'ORDER_CANCEL_RESTORE', 'RETURN_RESTORE', 'MANUAL_ADJUST')),
      quantity INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT,
      reference_order_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 6. CART ITEMS (Database-backed shopping cart)
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 7. ORDERS
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT DEFAULT 'United States',
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('COD', 'DEMO_CARD')),
      payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
      order_status TEXT NOT NULL DEFAULT 'Pending' CHECK(order_status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
      cancel_reason TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- 8. ORDER ITEMS
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    -- 9. PAYMENTS
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      card_last4 TEXT,
      payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- 10. INVOICES
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      order_id INTEGER UNIQUE NOT NULL,
      issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Issued',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- 11. RETURNS
    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Requested' CHECK(status IN ('Requested', 'Approved', 'Rejected', 'Completed')),
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    -- 12. REFUNDS
    CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      refund_number TEXT UNIQUE NOT NULL,
      order_id INTEGER NOT NULL,
      return_id INTEGER,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Processing', 'Completed', 'Failed')),
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- INDEXES FOR PERFORMANCE
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_avail ON products(is_available);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
    CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
  `;

  db.exec(schema);
}

module.exports = {
  db,
  initDatabase
};
