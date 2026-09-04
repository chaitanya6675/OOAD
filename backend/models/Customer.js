const User = require('./User');
const { db } = require('../config/database');

/**
 * Object-Oriented Customer Domain Model (Inherits from User)
 */
class Customer extends User {
  constructor(userData = {}, customerData = {}) {
    super(userData);
    this.customerId = customerData.id || null;
    this.address = customerData.address || '';
    this.city = customerData.city || '';
    this.state = customerData.state || '';
    this.postalCode = customerData.postal_code || customerData.postalCode || '';
    this.country = customerData.country || 'United States';
  }

  // Find customer by user_id
  static findByUserId(userId) {
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!userRow) return null;

    let custRow = db.prepare('SELECT * FROM customers WHERE user_id = ?').get(userId);
    if (!custRow) {
      // Auto create customer record if not exists
      const stmt = db.prepare('INSERT INTO customers (user_id) VALUES (?)');
      const info = stmt.run(userId);
      custRow = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
    }

    return new Customer(userRow, custRow);
  }

  // Update customer address details
  updateAddress({ address, city, state, postalCode, country = 'United States' }) {
    const stmt = db.prepare(`
      UPDATE customers 
      SET address = ?, city = ?, state = ?, postal_code = ?, country = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    stmt.run(address || '', city || '', state || '', postalCode || '', country, this.id);
    this.address = address;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country;
  }

  // Fetch all orders for this customer
  getOrders() {
    return db.prepare(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `).all(this.id);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      customerId: this.customerId,
      address: this.address,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country
    };
  }
}

module.exports = Customer;
