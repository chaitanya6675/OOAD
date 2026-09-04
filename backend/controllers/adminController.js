const { db } = require('../config/database');
const Admin = require('../models/Admin');
const SalesRecord = require('../models/SalesRecord');

class AdminController {
  // Get dashboard KPI summary
  static async getDashboardMetrics(req, res, next) {
    try {
      const admin = new Admin(req.user);
      const metrics = admin.getDashboardMetrics();
      res.json({
        success: true,
        metrics
      });
    } catch (err) {
      next(err);
    }
  }

  // Get analytics charts data
  static async getAnalytics(req, res, next) {
    try {
      const analytics = SalesRecord.getAnalytics();
      res.json({
        success: true,
        analytics
      });
    } catch (err) {
      next(err);
    }
  }

  // Get sales reports with filters
  static async getSalesReports(req, res, next) {
    try {
      const {
        startDate,
        endDate,
        categoryId,
        orderStatus,
        paymentStatus,
        page,
        limit
      } = req.query;

      const report = SalesRecord.generateReport({
        startDate,
        endDate,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        orderStatus,
        paymentStatus,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50
      });

      res.json({
        success: true,
        ...report
      });
    } catch (err) {
      next(err);
    }
  }

  // Get all customers overview with purchase statistics
  static async getAllCustomers(req, res, next) {
    try {
      const { search, page = 1, limit = 20 } = req.query;
      let whereSql = "WHERE u.role = 'customer'";
      let params = [];

      if (search && search.trim()) {
        whereSql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      const count = db.prepare(`SELECT COUNT(*) as count FROM users u ${whereSql}`).get(...params).count;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

      const rows = db.prepare(`
        SELECT 
          u.id, u.full_name, u.email, u.phone, u.created_at,
          c.address, c.city, c.state, c.postal_code, c.country,
          (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as total_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders o WHERE o.user_id = u.id AND o.payment_status = 'Paid') as total_spend
        FROM users u
        LEFT JOIN customers c ON c.user_id = u.id
        ${whereSql}
        ORDER BY total_orders DESC, u.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, parseInt(limit, 10), offset);

      res.json({
        success: true,
        customers: rows,
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit)
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
