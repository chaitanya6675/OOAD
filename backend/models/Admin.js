const User = require('./User');
const { db } = require('../config/database');

/**
 * Object-Oriented Admin Domain Model (Inherits from User)
 */
class Admin extends User {
  constructor(userData = {}) {
    super(userData);
  }

  static findByUserId(userId) {
    const userRow = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'admin'").get(userId);
    return userRow ? new Admin(userRow) : null;
  }

  // Dashboard Overview Metrics
  getDashboardMetrics() {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
    const totalSales = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'Paid'").get().total;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Pending'").get().count;
    const deliveredOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'").get().count;
    const lowStockProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 5").get().count;
    const cancelledOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Cancelled'").get().count;
    const returnedOrders = db.prepare("SELECT COUNT(*) as count FROM returns").get().count;
    const totalRefunds = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM refunds WHERE status = 'Completed'").get().total;

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales: parseFloat(totalSales.toFixed(2)),
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
      cancelledOrders,
      returnedOrders,
      totalRefunds: parseFloat(totalRefunds.toFixed(2))
    };
  }
}

module.exports = Admin;
