const { db } = require('../config/database');

/**
 * Object-Oriented Return Domain Model
 */
class Return {
  constructor(data = {}) {
    this.id = data.id || null;
    this.returnNumber = data.return_number || data.returnNumber || '';
    this.orderId = data.order_id || data.orderId;
    this.userId = data.user_id || data.userId;
    this.productId = data.product_id || data.productId;
    this.reason = data.reason || '';
    this.status = data.status || 'Requested';
    this.adminNotes = data.admin_notes || data.adminNotes || '';
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
    this.productName = data.product_name || data.productName || '';
    this.orderNumber = data.order_number || data.orderNumber || '';
    this.customerName = data.customer_name || data.customerName || '';
    this.unitPrice = typeof data.unit_price === 'number' ? data.unit_price : parseFloat(data.unit_price || 0);
  }

  static generateReturnNumber() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `RET-${dateStr}-${rand}`;
  }

  static findById(id) {
    const row = db.prepare(`
      SELECT r.*, p.name as product_name, p.price as unit_price, o.order_number, u.full_name as customer_name
      FROM returns r
      JOIN products p ON r.product_id = p.id
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(id);
    return row ? new Return(row) : null;
  }

  static findByUserId(userId) {
    const rows = db.prepare(`
      SELECT r.*, p.name as product_name, p.price as unit_price, o.order_number, u.full_name as customer_name
      FROM returns r
      JOIN products p ON r.product_id = p.id
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);
    return rows.map(r => new Return(r));
  }

  static findAll({ status = null, page = 1, limit = 20 } = {}) {
    let whereSql = '';
    let params = [];

    if (status && status !== 'ALL') {
      whereSql = 'WHERE r.status = ?';
      params.push(status);
    }

    const count = db.prepare(`SELECT COUNT(*) as count FROM returns r ${whereSql}`).get(...params).count;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const rows = db.prepare(`
      SELECT r.*, p.name as product_name, p.price as unit_price, o.order_number, u.full_name as customer_name
      FROM returns r
      JOIN products p ON r.product_id = p.id
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.user_id = u.id
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit, 10), offset);

    return {
      returns: rows.map(r => new Return(r)),
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  static create({ orderId, userId, productId, reason }) {
    // Validate order exists, belongs to user, and is Delivered
    const order = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ? AND order_status = 'Delivered'").get(orderId, userId);
    if (!order) {
      throw new Error('Order is not eligible for return. Only delivered orders can be returned.');
    }

    // Validate product is in order
    const item = db.prepare('SELECT * FROM order_items WHERE order_id = ? AND product_id = ?').get(orderId, productId);
    if (!item) {
      throw new Error('Selected product was not found in this order.');
    }

    // Check if return already requested
    const existing = db.prepare('SELECT * FROM returns WHERE order_id = ? AND product_id = ?').get(orderId, productId);
    if (existing) {
      throw new Error('A return request already exists for this item.');
    }

    const returnNumber = Return.generateReturnNumber();
    const stmt = db.prepare(`
      INSERT INTO returns (return_number, order_id, user_id, product_id, reason, status)
      VALUES (?, ?, ?, ?, ?, 'Requested')
    `);
    const info = stmt.run(returnNumber, orderId, userId, productId, reason.trim());
    return Return.findById(info.lastInsertRowid);
  }

  updateStatus(newStatus, adminNotes = '') {
    const valid = ['Requested', 'Approved', 'Rejected', 'Completed'];
    if (!valid.includes(newStatus)) {
      throw new Error(`Invalid return status: ${newStatus}`);
    }

    const stmt = db.prepare(`
      UPDATE returns 
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(newStatus, adminNotes, this.id);
    this.status = newStatus;
    this.adminNotes = adminNotes;
  }

  toJSON() {
    return {
      id: this.id,
      returnNumber: this.returnNumber,
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      userId: this.userId,
      customerName: this.customerName,
      productId: this.productId,
      productName: this.productName,
      unitPrice: this.unitPrice,
      reason: this.reason,
      status: this.status,
      adminNotes: this.adminNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Return;
