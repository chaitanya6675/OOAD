const { db } = require('../config/database');

/**
 * Object-Oriented Payment Domain Model
 */
class Payment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.transactionId = data.transaction_id || data.transactionId || '';
    this.orderId = data.order_id || data.orderId;
    this.userId = data.user_id || data.userId;
    this.amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || 0);
    this.paymentMethod = data.payment_method || data.paymentMethod || 'COD';
    this.cardLast4 = data.card_last4 || data.cardLast4 || null;
    this.paymentStatus = data.payment_status || data.paymentStatus || 'Pending';
    this.paymentDate = data.payment_date || data.paymentDate || null;
    this.orderNumber = data.order_number || data.orderNumber || '';
    this.customerName = data.customer_name || data.customerName || '';
  }

  // Generate unique transaction ID: TXN-YYYYMMDD-XXXXXX
  static generateTransactionId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `TXN-${dateStr}-${rand}`;
  }

  // Process Demo Card validation
  static validateDemoCard({ cardNumber, cardHolder, expiry, cvv }) {
    if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 15) {
      return { valid: false, message: 'Invalid Card Number (must be 15-16 digits).' };
    }
    if (!cardHolder || cardHolder.trim().length < 3) {
      return { valid: false, message: 'Cardholder Name is required.' };
    }
    if (!expiry || !expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      return { valid: false, message: 'Expiry date must be in MM/YY format.' };
    }
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      return { valid: false, message: 'CVV must be 3 or 4 digits.' };
    }
    return { valid: true };
  }

  static findByOrderId(orderId) {
    const row = db.prepare(`
      SELECT p.*, o.order_number, o.customer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.order_id = ?
    `).get(orderId);
    return row ? new Payment(row) : null;
  }

  static findAll({ limit = 20, page = 1 } = {}) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const total = db.prepare('SELECT COUNT(*) as count FROM payments').get().count;
    const rows = db.prepare(`
      SELECT p.*, o.order_number, o.customer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      ORDER BY p.payment_date DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit, 10), offset);

    return {
      payments: rows.map(r => new Payment(r)),
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  static create({ orderId, userId, amount, paymentMethod, cardLast4 = null, paymentStatus = 'Pending' }) {
    const transactionId = Payment.generateTransactionId();
    const stmt = db.prepare(`
      INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, card_last4, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      transactionId,
      orderId,
      userId,
      parseFloat(amount),
      paymentMethod,
      cardLast4,
      paymentStatus
    );

    return Payment.findByOrderId(orderId);
  }

  toJSON() {
    return {
      id: this.id,
      transactionId: this.transactionId,
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      userId: this.userId,
      customerName: this.customerName,
      amount: this.amount,
      paymentMethod: this.paymentMethod,
      cardLast4: this.cardLast4,
      paymentStatus: this.paymentStatus,
      paymentDate: this.paymentDate
    };
  }
}

module.exports = Payment;
