const ExcelExportService = require('../services/excelExportService');
const { db } = require('../config/database');

class ExportController {
  // Master Export: Complete multi-sheet Excel file (.xlsx)
  static async exportAllExcel(req, res, next) {
    try {
      await ExcelExportService.exportAllToExcel(res);
    } catch (err) {
      next(err);
    }
  }

  // Export specific table to CSV
  static async exportTableCsv(req, res, next) {
    try {
      const { table } = req.params;
      ExcelExportService.exportTableToCsv(table, res);
    } catch (err) {
      next(err);
    }
  }

  // Get raw table records preview for Admin Data Viewer
  static async getTableRecords(req, res, next) {
    try {
      const { table } = req.params;
      const { page = 1, limit = 20, search = '' } = req.query;

      const queries = {
        users: {
          select: 'id, full_name, email, phone, role, created_at FROM users',
          searchField: 'full_name'
        },
        customers: {
          select: 'id, user_id, address, city, state, postal_code, country, created_at FROM customers',
          searchField: 'city'
        },
        products: {
          select: 'id, product_code, name, category_id, price, stock_quantity, is_available, created_at FROM products',
          searchField: 'name'
        },
        categories: {
          select: 'id, name, slug, description, created_at FROM categories',
          searchField: 'name'
        },
        orders: {
          select: 'id, order_number, user_id, customer_name, customer_email, subtotal, shipping_fee, total_amount, payment_method, payment_status, order_status, created_at FROM orders',
          searchField: 'order_number'
        },
        order_items: {
          select: 'id, order_id, product_id, product_name, unit_price, quantity, subtotal FROM order_items',
          searchField: 'product_name'
        },
        payments: {
          select: 'id, transaction_id, order_id, user_id, amount, payment_method, card_last4, payment_status, payment_date FROM payments',
          searchField: 'transaction_id'
        },
        invoices: {
          select: 'id, invoice_number, order_id, issue_date, total_amount, status, created_at FROM invoices',
          searchField: 'invoice_number'
        },
        inventory: {
          select: 'id, product_id, change_type, quantity, previous_stock, new_stock, reason, created_at FROM inventory_logs',
          searchField: 'change_type'
        },
        returns: {
          select: 'id, return_number, order_id, user_id, product_id, reason, status, admin_notes, created_at FROM returns',
          searchField: 'return_number'
        },
        refunds: {
          select: 'id, refund_number, order_id, return_id, user_id, amount, reason, status, processed_at, created_at FROM refunds',
          searchField: 'refund_number'
        },
        sales: {
          select: `o.order_number, o.created_at, o.customer_name, oi.product_name, oi.unit_price, oi.quantity, oi.subtotal, o.payment_status, o.order_status
                   FROM order_items oi JOIN orders o ON oi.order_id = o.id`,
          searchField: 'o.order_number'
        }
      };

      const tableKey = table.toLowerCase();
      const config = queries[tableKey];
      if (!config) {
        return res.status(400).json({ success: false, message: `Invalid table name "${table}".` });
      }

      let whereSql = '';
      let params = [];

      if (search && search.trim()) {
        whereSql = `WHERE ${config.searchField} LIKE ?`;
        params.push(`%${search.trim()}%`);
      }

      const countSql = tableKey === 'sales'
        ? `SELECT COUNT(*) as count FROM order_items oi JOIN orders o ON oi.order_id = o.id ${whereSql}`
        : `SELECT COUNT(*) as count FROM ${tableKey === 'inventory' ? 'inventory_logs' : tableKey} ${whereSql}`;

      const total = db.prepare(countSql).get(...params).count;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

      const fromClause = tableKey === 'sales' ? config.select : `SELECT ${config.select} ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`;

      const rows = tableKey === 'sales'
        ? db.prepare(`SELECT ${config.select} ${whereSql} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit, 10), offset)
        : db.prepare(`SELECT ${config.select} ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit, 10), offset);

      res.json({
        success: true,
        table: tableKey,
        records: rows,
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ExportController;
