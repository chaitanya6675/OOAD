const ExcelJS = require('exceljs');
const { db } = require('../config/database');

/**
 * Excel & CSV Data Export Service
 * Produces structured spreadsheets with professional formatting
 */
class ExcelExportService {
  /**
   * Helper to style worksheet headers
   */
  static styleHeaderRow(worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Slate 800
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;
  }

  /**
   * Export all 12 system entities into a single multi-sheet Excel Workbook (.xlsx)
   */
  static async exportAllToExcel(res) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Smart E-Commerce Platform';
    workbook.created = new Date();

    // 1. Users Sheet (Excluding sensitive password hashes)
    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
      { header: 'User ID', key: 'id', width: 10 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email Address', key: 'email', width: 30 },
      { header: 'Phone Number', key: 'phone', width: 18 },
      { header: 'Role', key: 'role', width: 14 },
      { header: 'Created Date', key: 'created_at', width: 22 }
    ];
    this.styleHeaderRow(usersSheet);
    const users = db.prepare('SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id ASC').all();
    users.forEach(u => usersSheet.addRow(u));

    // 2. Customers Sheet
    const customersSheet = workbook.addWorksheet('Customers');
    customersSheet.columns = [
      { header: 'Customer ID', key: 'id', width: 14 },
      { header: 'User ID', key: 'user_id', width: 12 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'City', key: 'city', width: 18 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Postal Code', key: 'postal_code', width: 15 },
      { header: 'Country', key: 'country', width: 18 }
    ];
    this.styleHeaderRow(customersSheet);
    const customers = db.prepare(`
      SELECT c.id, c.user_id, u.full_name, u.email, c.address, c.city, c.state, c.postal_code, c.country
      FROM customers c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.id ASC
    `).all();
    customers.forEach(c => customersSheet.addRow(c));

    // 3. Products Sheet
    const productsSheet = workbook.addWorksheet('Products');
    productsSheet.columns = [
      { header: 'Product ID', key: 'id', width: 12 },
      { header: 'Product Code', key: 'product_code', width: 18 },
      { header: 'Product Name', key: 'name', width: 35 },
      { header: 'Category', key: 'category_name', width: 22 },
      { header: 'Price ($)', key: 'price', width: 14 },
      { header: 'Stock Qty', key: 'stock_quantity', width: 14 },
      { header: 'Available', key: 'is_available', width: 12 },
      { header: 'Created Date', key: 'created_at', width: 22 }
    ];
    this.styleHeaderRow(productsSheet);
    const products = db.prepare(`
      SELECT p.id, p.product_code, p.name, c.name as category_name, p.price, p.stock_quantity,
             CASE WHEN p.is_available = 1 THEN 'Yes' ELSE 'No' END as is_available,
             p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `).all();
    products.forEach(p => productsSheet.addRow(p));

    // 4. Categories Sheet
    const categoriesSheet = workbook.addWorksheet('Categories');
    categoriesSheet.columns = [
      { header: 'Category ID', key: 'id', width: 14 },
      { header: 'Category Name', key: 'name', width: 25 },
      { header: 'Slug', key: 'slug', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Products Count', key: 'product_count', width: 16 }
    ];
    this.styleHeaderRow(categoriesSheet);
    const categories = db.prepare(`
      SELECT c.id, c.name, c.slug, c.description,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.id ASC
    `).all();
    categories.forEach(c => categoriesSheet.addRow(c));

    // 5. Orders Sheet
    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Order ID', key: 'id', width: 10 },
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Email', key: 'customer_email', width: 28 },
      { header: 'Subtotal ($)', key: 'subtotal', width: 14 },
      { header: 'Shipping ($)', key: 'shipping_fee', width: 14 },
      { header: 'Total ($)', key: 'total_amount', width: 14 },
      { header: 'Payment Method', key: 'payment_method', width: 16 },
      { header: 'Payment Status', key: 'payment_status', width: 16 },
      { header: 'Order Status', key: 'order_status', width: 16 },
      { header: 'Order Date', key: 'created_at', width: 22 }
    ];
    this.styleHeaderRow(ordersSheet);
    const orders = db.prepare('SELECT * FROM orders ORDER BY id ASC').all();
    orders.forEach(o => ordersSheet.addRow(o));

    // 6. Order Items Sheet
    const orderItemsSheet = workbook.addWorksheet('Order Items');
    orderItemsSheet.columns = [
      { header: 'Item ID', key: 'id', width: 10 },
      { header: 'Order ID', key: 'order_id', width: 10 },
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Product ID', key: 'product_id', width: 12 },
      { header: 'Product Name', key: 'product_name', width: 35 },
      { header: 'Unit Price ($)', key: 'unit_price', width: 14 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Subtotal ($)', key: 'subtotal', width: 14 }
    ];
    this.styleHeaderRow(orderItemsSheet);
    const orderItems = db.prepare(`
      SELECT oi.id, oi.order_id, o.order_number, oi.product_id, oi.product_name, oi.unit_price, oi.quantity, oi.subtotal
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      ORDER BY oi.id ASC
    `).all();
    orderItems.forEach(oi => orderItemsSheet.addRow(oi));

    // 7. Payments Sheet
    const paymentsSheet = workbook.addWorksheet('Payments');
    paymentsSheet.columns = [
      { header: 'Payment ID', key: 'id', width: 12 },
      { header: 'Transaction ID', key: 'transaction_id', width: 24 },
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Amount ($)', key: 'amount', width: 14 },
      { header: 'Method', key: 'payment_method', width: 16 },
      { header: 'Card Last 4', key: 'card_last4', width: 14 },
      { header: 'Payment Status', key: 'payment_status', width: 16 },
      { header: 'Payment Date', key: 'payment_date', width: 22 }
    ];
    this.styleHeaderRow(paymentsSheet);
    const payments = db.prepare(`
      SELECT p.id, p.transaction_id, o.order_number, p.amount, p.payment_method, p.card_last4, p.payment_status, p.payment_date
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      ORDER BY p.id ASC
    `).all();
    payments.forEach(p => paymentsSheet.addRow(p));

    // 8. Invoices Sheet
    const invoicesSheet = workbook.addWorksheet('Invoices');
    invoicesSheet.columns = [
      { header: 'Invoice ID', key: 'id', width: 12 },
      { header: 'Invoice Number', key: 'invoice_number', width: 22 },
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Total Amount ($)', key: 'total_amount', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Issue Date', key: 'issue_date', width: 22 }
    ];
    this.styleHeaderRow(invoicesSheet);
    const invoices = db.prepare(`
      SELECT inv.id, inv.invoice_number, o.order_number, o.customer_name, inv.total_amount, inv.status, inv.issue_date
      FROM invoices inv
      JOIN orders o ON inv.order_id = o.id
      ORDER BY inv.id ASC
    `).all();
    invoices.forEach(inv => invoicesSheet.addRow(inv));

    // 9. Inventory Sheet (Logs)
    const inventorySheet = workbook.addWorksheet('Inventory Logs');
    inventorySheet.columns = [
      { header: 'Log ID', key: 'id', width: 10 },
      { header: 'Product Name', key: 'product_name', width: 30 },
      { header: 'Change Type', key: 'change_type', width: 22 },
      { header: 'Quantity Change', key: 'quantity', width: 16 },
      { header: 'Previous Stock', key: 'previous_stock', width: 16 },
      { header: 'New Stock', key: 'new_stock', width: 14 },
      { header: 'Reason', key: 'reason', width: 35 },
      { header: 'Timestamp', key: 'created_at', width: 22 }
    ];
    this.styleHeaderRow(inventorySheet);
    const inventoryLogs = db.prepare(`
      SELECT il.id, p.name as product_name, il.change_type, il.quantity, il.previous_stock, il.new_stock, il.reason, il.created_at
      FROM inventory_logs il
      JOIN products p ON il.product_id = p.id
      ORDER BY il.id DESC
    `).all();
    inventoryLogs.forEach(il => inventorySheet.addRow(il));

    // 10. Returns Sheet
    const returnsSheet = workbook.addWorksheet('Returns');
    returnsSheet.columns = [
      { header: 'Return ID', key: 'id', width: 12 },
      { header: 'Return Number', key: 'return_number', width: 22 },
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Customer', key: 'customer_name', width: 25 },
      { header: 'Product', key: 'product_name', width: 30 },
      { header: 'Reason', key: 'reason', width: 35 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Admin Notes', key: 'admin_notes', width: 30 },
      { header: 'Date', key: 'created_at', width: 22 }
    ];
    this.styleHeaderRow(returnsSheet);
    const returns = db.prepare(`
      SELECT r.id, r.return_number, o.order_number, u.full_name as customer_name, p.name as product_name, r.reason, r.status, r.admin_notes, r.created_at
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      ORDER BY r.id ASC
    `).all();
    returns.forEach(r => returnsSheet.addRow(r));

    // 11. Refunds Sheet
    const refundsSheet = workbook.addWorksheet('Refunds');
    refundsSheet.columns = [
      { header: 'Refund ID', key: 'id', width: 12 },
      { header: 'Refund Number', key: 'refund_number', width: 22 },
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Customer', key: 'customer_name', width: 25 },
      { header: 'Amount ($)', key: 'amount', width: 14 },
      { header: 'Reason', key: 'reason', width: 35 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Processed Date', key: 'processed_at', width: 22 }
    ];
    this.styleHeaderRow(refundsSheet);
    const refunds = db.prepare(`
      SELECT ref.id, ref.refund_number, o.order_number, u.full_name as customer_name, ref.amount, ref.reason, ref.status, ref.processed_at
      FROM refunds ref
      JOIN orders o ON ref.order_id = o.id
      JOIN users u ON ref.user_id = u.id
      ORDER BY ref.id ASC
    `).all();
    refunds.forEach(ref => refundsSheet.addRow(ref));

    // 12. Sales Records Sheet (Aggregated)
    const salesSheet = workbook.addWorksheet('Sales Records');
    salesSheet.columns = [
      { header: 'Order Number', key: 'order_number', width: 22 },
      { header: 'Order Date', key: 'created_at', width: 22 },
      { header: 'Customer', key: 'customer_name', width: 25 },
      { header: 'Product Code', key: 'product_code', width: 18 },
      { header: 'Product Name', key: 'product_name', width: 35 },
      { header: 'Unit Price ($)', key: 'unit_price', width: 14 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Item Total ($)', key: 'subtotal', width: 14 },
      { header: 'Payment Status', key: 'payment_status', width: 16 },
      { header: 'Order Status', key: 'order_status', width: 16 }
    ];
    this.styleHeaderRow(salesSheet);
    const salesRecords = db.prepare(`
      SELECT o.order_number, o.created_at, o.customer_name, p.product_code, oi.product_name, oi.unit_price, oi.quantity, oi.subtotal, o.payment_status, o.order_status
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC
    `).all();
    salesRecords.forEach(s => salesSheet.addRow(s));

    // Response headers for browser download
    const filename = `SmartECommerce_FullDatabase_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export individual table to CSV
   */
  static exportTableToCsv(tableName, res) {
    const validTables = {
      users: 'SELECT id, full_name, email, phone, role, created_at FROM users',
      customers: 'SELECT id, user_id, address, city, state, postal_code, country, created_at FROM customers',
      products: 'SELECT id, product_code, name, category_id, price, stock_quantity, is_available, created_at FROM products',
      categories: 'SELECT id, name, slug, description, created_at FROM categories',
      orders: 'SELECT id, order_number, user_id, customer_name, customer_email, subtotal, shipping_fee, total_amount, payment_method, payment_status, order_status, created_at FROM orders',
      order_items: 'SELECT id, order_id, product_id, product_name, unit_price, quantity, subtotal FROM order_items',
      payments: 'SELECT id, transaction_id, order_id, user_id, amount, payment_method, card_last4, payment_status, payment_date FROM payments',
      invoices: 'SELECT id, invoice_number, order_id, issue_date, total_amount, status, created_at FROM invoices',
      inventory: 'SELECT id, product_id, change_type, quantity, previous_stock, new_stock, reason, created_at FROM inventory_logs',
      returns: 'SELECT id, return_number, order_id, user_id, product_id, reason, status, admin_notes, created_at FROM returns',
      refunds: 'SELECT id, refund_number, order_id, return_id, user_id, amount, reason, status, processed_at, created_at FROM refunds',
      sales: `SELECT o.order_number, o.created_at, o.customer_name, oi.product_name, oi.unit_price, oi.quantity, oi.subtotal, o.payment_status, o.order_status
              FROM order_items oi JOIN orders o ON oi.order_id = o.id`
    };

    const sql = validTables[tableName.toLowerCase()];
    if (!sql) {
      throw new Error(`Invalid table name for export: ${tableName}`);
    }

    const rows = db.prepare(sql).all();
    if (rows.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`);
      return res.send('');
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      const line = headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
      csvLines.push(line);
    }

    const csvContent = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  }
}

module.exports = ExcelExportService;
