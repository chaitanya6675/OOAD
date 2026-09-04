const { db } = require('../config/database');

/**
 * Object-Oriented SalesRecord Domain Model (Reporting & Analytics)
 */
class SalesRecord {
  // Generate Detailed Sales Report with filters
  static generateReport({
    startDate = null,
    endDate = null,
    categoryId = null,
    orderStatus = null,
    paymentStatus = null,
    limit = 50,
    page = 1
  } = {}) {
    let whereClauses = [];
    let params = [];

    if (startDate) {
      whereClauses.push("date(o.created_at) >= date(?)");
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push("date(o.created_at) <= date(?)");
      params.push(endDate);
    }
    if (categoryId) {
      whereClauses.push("p.category_id = ?");
      params.push(categoryId);
    }
    if (orderStatus && orderStatus !== 'ALL') {
      whereClauses.push("o.order_status = ?");
      params.push(orderStatus);
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      whereClauses.push("o.payment_status = ?");
      params.push(paymentStatus);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Summary aggregates
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity), 0) as total_units_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      ${whereSql}
    `;
    const summary = db.prepare(summaryQuery).get(...params);

    // Detail rows
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const detailQuery = `
      SELECT 
        o.id as order_id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.payment_status,
        o.order_status,
        o.payment_method,
        o.created_at as order_date,
        p.id as product_id,
        p.name as product_name,
        p.product_code,
        c.name as category_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal as item_total,
        o.total_amount as order_grand_total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const records = db.prepare(detailQuery).all(...params, parseInt(limit, 10), offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      ${whereSql}
    `;
    const totalCount = db.prepare(countQuery).get(...params).total;

    return {
      summary: {
        totalOrders: summary.total_orders,
        totalUnitsSold: summary.total_units_sold,
        totalRevenue: parseFloat(summary.total_revenue.toFixed(2)),
        avgOrderValue: parseFloat(summary.avg_order_value.toFixed(2))
      },
      records,
      total: totalCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  // Analytics for Admin Dashboard Charts
  static getAnalytics() {
    // 1. Sales over time (last 7 days / recent months)
    const salesOverTime = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY date ASC
    `).all();

    // 2. Orders by Status
    const ordersByStatus = db.prepare(`
      SELECT 
        order_status as status,
        COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `).all();

    // 3. Sales by Category
    const salesByCategory = db.prepare(`
      SELECT 
        c.name as category,
        COALESCE(SUM(oi.subtotal), 0) as revenue,
        COALESCE(SUM(oi.quantity), 0) as units_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status != 'Failed'
      GROUP BY c.id
      ORDER BY revenue DESC
    `).all();

    // 4. Top Selling Products
    const topProducts = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.product_code,
        p.price,
        p.image_url,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status != 'Failed'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    return {
      salesOverTime,
      ordersByStatus,
      salesByCategory,
      topProducts
    };
  }
}

module.exports = SalesRecord;
