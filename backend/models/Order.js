const { db } = require('../config/database');

/**
 * Object-Oriented Order Item Domain Model
 */
class OrderItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.orderId = data.order_id || data.orderId;
    this.productId = data.product_id || data.productId;
    this.productName = data.product_name || data.productName || '';
    this.unitPrice = typeof data.unit_price === 'number' ? data.unit_price : parseFloat(data.unit_price || 0);
    this.quantity = typeof data.quantity === 'number' ? data.quantity : parseInt(data.quantity || 1, 10);
    this.subtotal = typeof data.subtotal === 'number' ? data.subtotal : parseFloat(data.subtotal || 0);
    this.productImage = data.image_url || data.productImage || '';
    this.productCode = data.product_code || data.productCode || '';
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      productName: this.productName,
      productCode: this.productCode,
      productImage: this.productImage,
      unitPrice: this.unitPrice,
      quantity: this.quantity,
      subtotal: this.subtotal
    };
  }
}

/**
 * Object-Oriented Order Domain Model
 */
class Order {
  constructor(data = {}, items = []) {
    this.id = data.id || null;
    this.orderNumber = data.order_number || data.orderNumber || '';
    this.userId = data.user_id || data.userId;
    this.customerName = data.customer_name || data.customerName || '';
    this.customerEmail = data.customer_email || data.customerEmail || '';
    this.customerPhone = data.customer_phone || data.customerPhone || '';
    this.shippingAddress = data.shipping_address || data.shippingAddress || '';
    this.city = data.city || '';
    this.state = data.state || '';
    this.postalCode = data.postal_code || data.postalCode || '';
    this.country = data.country || 'United States';
    this.subtotal = typeof data.subtotal === 'number' ? data.subtotal : parseFloat(data.subtotal || 0);
    this.shippingFee = typeof data.shipping_fee === 'number' ? data.shipping_fee : parseFloat(data.shipping_fee || 0);
    this.totalAmount = typeof data.total_amount === 'number' ? data.total_amount : parseFloat(data.total_amount || 0);
    this.paymentMethod = data.payment_method || data.paymentMethod || 'COD';
    this.paymentStatus = data.payment_status || data.paymentStatus || 'Pending';
    this.orderStatus = data.order_status || data.orderStatus || 'Pending';
    this.cancelReason = data.cancel_reason || data.cancelReason || null;
    this.notes = data.notes || '';
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
    this.items = items;
  }

  // Generate unique order number: ORD-YYYYMMDD-XXXX
  static generateOrderNumber() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${randomSuffix}`;
  }

  // Can this order be cancelled by the customer?
  canCancel() {
    return this.orderStatus === 'Pending';
  }

  // Can this order be returned by the customer?
  canReturn() {
    return this.orderStatus === 'Delivered';
  }

  static findById(id) {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!row) return null;

    const itemRows = db.prepare(`
      SELECT oi.*, p.image_url, p.product_code
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(id);

    const items = itemRows.map(r => new OrderItem(r));
    return new Order(row, items);
  }

  static findByOrderNumber(orderNumber) {
    const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
    if (!row) return null;
    return Order.findById(row.id);
  }

  static findByUserId(userId) {
    const rows = db.prepare(`
      SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(userId);

    return rows.map(r => {
      const items = db.prepare(`
        SELECT oi.*, p.image_url, p.product_code
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(r.id).map(ir => new OrderItem(ir));
      return new Order(r, items);
    });
  }

  static findAll({ status = null, search = '', page = 1, limit = 15 } = {}) {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'ALL') {
      whereClauses.push('o.order_status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM orders o ${whereSql}`).get(...params);
    const total = countRow.total;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(query).all(...params, parseInt(limit, 10), offset);
    const orders = rows.map(r => {
      const items = db.prepare(`
        SELECT oi.*, p.image_url, p.product_code
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(r.id).map(ir => new OrderItem(ir));
      return new Order(r, items);
    });

    return {
      orders,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Update order status with validation
  updateStatus(newStatus) {
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`);
    }

    const stmt = db.prepare('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(newStatus, this.id);
    this.orderStatus = newStatus;
  }

  // Update payment status
  updatePaymentStatus(newStatus) {
    const validStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid payment status "${newStatus}".`);
    }

    const stmt = db.prepare('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(newStatus, this.id);
    this.paymentStatus = newStatus;
  }

  toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      userId: this.userId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      shippingAddress: this.shippingAddress,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      subtotal: this.subtotal,
      shippingFee: this.shippingFee,
      totalAmount: this.totalAmount,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      orderStatus: this.orderStatus,
      cancelReason: this.cancelReason,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      canCancel: this.canCancel(),
      canReturn: this.canReturn(),
      items: this.items.map(i => i.toJSON())
    };
  }
}

module.exports = { Order, OrderItem };
