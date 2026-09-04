const { db } = require('../config/database');

/**
 * Object-Oriented Invoice Domain Model
 */
class Invoice {
  constructor(data = {}) {
    this.id = data.id || null;
    this.invoiceNumber = data.invoice_number || data.invoiceNumber || '';
    this.orderId = data.order_id || data.orderId;
    this.issueDate = data.issue_date || data.issueDate || null;
    this.dueDate = data.due_date || data.dueDate || null;
    this.totalAmount = typeof data.total_amount === 'number' ? data.total_amount : parseFloat(data.total_amount || 0);
    this.status = data.status || 'Issued';
    this.createdAt = data.created_at || data.createdAt || null;
  }

  // Generate unique invoice number: INV-YYYYMM-XXXX
  static generateInvoiceNumber() {
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${yearMonth}-${rand}`;
  }

  static findByOrderId(orderId) {
    const row = db.prepare('SELECT * FROM invoices WHERE order_id = ?').get(orderId);
    return row ? new Invoice(row) : null;
  }

  static createForOrder(orderId, totalAmount) {
    const existing = Invoice.findByOrderId(orderId);
    if (existing) return existing;

    const invoiceNumber = Invoice.generateInvoiceNumber();
    const stmt = db.prepare(`
      INSERT INTO invoices (invoice_number, order_id, total_amount, status)
      VALUES (?, ?, ?, 'Issued')
    `);
    const info = stmt.run(invoiceNumber, orderId, totalAmount);
    return Invoice.findByOrderId(orderId);
  }

  toJSON() {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber,
      orderId: this.orderId,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      totalAmount: this.totalAmount,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}

module.exports = Invoice;
