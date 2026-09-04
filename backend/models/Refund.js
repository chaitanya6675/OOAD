const { db } = require('../config/database');
const Inventory = require('./Inventory');

/**
 * Object-Oriented Refund Domain Model
 */
class Refund {
  constructor(data = {}) {
    this.id = data.id || null;
    this.refundNumber = data.refund_number || data.refundNumber || '';
    this.orderId = data.order_id || data.orderId;
    this.returnId = data.return_id || data.returnId || null;
    this.userId = data.user_id || data.userId;
    this.amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || 0);
    this.reason = data.reason || '';
    this.status = data.status || 'Pending';
    this.processedAt = data.processed_at || data.processedAt || null;
    this.createdAt = data.created_at || data.createdAt || null;
    this.orderNumber = data.order_number || data.orderNumber || '';
    this.customerName = data.customer_name || data.customerName || '';
    this.customerEmail = data.customer_email || data.customerEmail || '';
  }

  static generateRefundNumber() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REF-${dateStr}-${rand}`;
  }

  static findById(id) {
    const row = db.prepare(`
      SELECT ref.*, o.order_number, u.full_name as customer_name, u.email as customer_email
      FROM refunds ref
      JOIN orders o ON ref.order_id = o.id
      JOIN users u ON ref.user_id = u.id
      WHERE ref.id = ?
    `).get(id);
    return row ? new Refund(row) : null;
  }

  static findAll({ status = null, page = 1, limit = 20 } = {}) {
    let whereSql = '';
    let params = [];

    if (status && status !== 'ALL') {
      whereSql = 'WHERE ref.status = ?';
      params.push(status);
    }

    const count = db.prepare(`SELECT COUNT(*) as count FROM refunds ref ${whereSql}`).get(...params).count;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const rows = db.prepare(`
      SELECT ref.*, o.order_number, u.full_name as customer_name, u.email as customer_email
      FROM refunds ref
      JOIN orders o ON ref.order_id = o.id
      JOIN users u ON ref.user_id = u.id
      ${whereSql}
      ORDER BY ref.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit, 10), offset);

    return {
      refunds: rows.map(r => new Refund(r)),
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  static create({ orderId, returnId = null, userId, amount, reason, status = 'Pending' }) {
    const refundNumber = Refund.generateRefundNumber();
    const stmt = db.prepare(`
      INSERT INTO refunds (refund_number, order_id, return_id, user_id, amount, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(refundNumber, orderId, returnId, userId, parseFloat(amount), reason, status);
    return Refund.findById(info.lastInsertRowid);
  }

  // Process and complete refund
  processRefund() {
    if (this.status === 'Completed') {
      throw new Error('Refund has already been completed.');
    }

    const txn = db.transaction(() => {
      // 1. Mark refund completed
      db.prepare(`
        UPDATE refunds 
        SET status = 'Completed', processed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(this.id);

      // 2. If this refund is tied to a return, mark return Completed and restore stock
      if (this.returnId) {
        db.prepare("UPDATE returns SET status = 'Completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(this.returnId);

        const ret = db.prepare('SELECT * FROM returns WHERE id = ?').get(this.returnId);
        if (ret) {
          Inventory.restoreForReturn(ret.product_id, 1, this.orderId, this.returnId);
        }
      }

      // 3. Update order payment_status to Refunded if full or partial
      db.prepare("UPDATE orders SET payment_status = 'Refunded', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(this.orderId);

      // 4. Update payment record if exists
      db.prepare("UPDATE payments SET payment_status = 'Refunded' WHERE order_id = ?")
        .run(this.orderId);
    });

    txn();

    this.status = 'Completed';
    this.processedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      refundNumber: this.refundNumber,
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      returnId: this.returnId,
      userId: this.userId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      amount: this.amount,
      reason: this.reason,
      status: this.status,
      processedAt: this.processedAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = Refund;
