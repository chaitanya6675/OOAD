const { db } = require('../config/database');

/**
 * Object-Oriented Inventory Domain Model
 */
class Inventory {
  // Get live inventory status across all products
  static getLiveStock({ filter = 'ALL', search = '', page = 1, limit = 20 } = {}) {
    let whereClauses = [];
    let params = [];

    if (filter === 'LOW_STOCK') {
      whereClauses.push('p.stock_quantity <= 5 AND p.stock_quantity > 0');
    } else if (filter === 'OUT_OF_STOCK') {
      whereClauses.push('p.stock_quantity = 0 OR p.is_available = 0');
    }

    if (search && search.trim()) {
      whereClauses.push('(p.name LIKE ? OR p.product_code LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const count = db.prepare(`SELECT COUNT(*) as count FROM products p ${whereSql}`).get(...params).count;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const rows = db.prepare(`
      SELECT p.id, p.product_code, p.name, p.price, p.stock_quantity, p.is_available, p.image_url,
             c.name as category_name,
             CASE
               WHEN p.stock_quantity = 0 OR p.is_available = 0 THEN 'OUT_OF_STOCK'
               WHEN p.stock_quantity <= 5 THEN 'LOW_STOCK'
               ELSE 'IN_STOCK'
             END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ORDER BY p.stock_quantity ASC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit, 10), offset);

    return {
      items: rows,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit)
    };
  }

  // Adjust stock manually with audit logging
  static adjustStock({ productId, adjustment, reason, adminId = null }) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const previousStock = product.stock_quantity;
    const newStock = previousStock + parseInt(adjustment, 10);

    if (newStock < 0) {
      throw new Error(`Adjustment would result in negative stock (${newStock}). Operation rejected.`);
    }

    // Run in transaction
    const updateProduct = db.prepare(`
      UPDATE products 
      SET stock_quantity = ?, 
          is_available = CASE WHEN ? > 0 THEN 1 ELSE 0 END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const insertLog = db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity, previous_stock, new_stock, reason)
      VALUES (?, 'MANUAL_ADJUST', ?, ?, ?, ?)
    `);

    const txn = db.transaction(() => {
      updateProduct.run(newStock, newStock, productId);
      insertLog.run(productId, parseInt(adjustment, 10), previousStock, newStock, reason || 'Manual stock update');
    });

    txn();

    return {
      productId,
      previousStock,
      newStock,
      stockQuantity: newStock
    };
  }

  // Deduct inventory when order is placed
  static deductForOrder(orderId, items) {
    const checkProduct = db.prepare('SELECT stock_quantity, name, is_available FROM products WHERE id = ?');
    const updateProduct = db.prepare(`
      UPDATE products 
      SET stock_quantity = stock_quantity - ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const insertLog = db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity, previous_stock, new_stock, reason, reference_order_id)
      VALUES (?, 'ORDER_DEDUCT', ?, ?, ?, ?, ?)
    `);

    const txn = db.transaction(() => {
      for (const item of items) {
        const prod = checkProduct.get(item.productId);
        if (!prod || !prod.is_available) {
          throw new Error(`Product "${prod ? prod.name : item.productId}" is not available.`);
        }
        if (prod.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock_quantity}, Requested: ${item.quantity}.`);
        }

        const prev = prod.stock_quantity;
        const next = prev - item.quantity;

        updateProduct.run(item.quantity, item.productId);
        insertLog.run(item.productId, -item.quantity, prev, next, `Order placed (#${orderId})`, orderId);
      }
    });

    txn();
  }

  // Restore inventory when order is cancelled or refunded
  static restoreForOrder(orderId, reason = 'Order Cancelled') {
    const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(orderId);
    if (!items || items.length === 0) return;

    const checkProduct = db.prepare('SELECT stock_quantity FROM products WHERE id = ?');
    const updateProduct = db.prepare('UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const insertLog = db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity, previous_stock, new_stock, reason, reference_order_id)
      VALUES (?, 'ORDER_CANCEL_RESTORE', ?, ?, ?, ?, ?)
    `);

    const txn = db.transaction(() => {
      for (const item of items) {
        const prod = checkProduct.get(item.product_id);
        if (prod) {
          const prev = prod.stock_quantity;
          const next = prev + item.quantity;
          updateProduct.run(item.quantity, item.product_id);
          insertLog.run(item.product_id, item.quantity, prev, next, reason, orderId);
        }
      }
    });

    txn();
  }

  // Restore stock for a single returned product
  static restoreForReturn(productId, quantity, orderId, returnId) {
    const prod = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(productId);
    if (!prod) return;

    const prev = prod.stock_quantity;
    const next = prev + quantity;

    const txn = db.transaction(() => {
      db.prepare('UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(quantity, productId);

      db.prepare(`
        INSERT INTO inventory_logs (product_id, change_type, quantity, previous_stock, new_stock, reason, reference_order_id)
        VALUES (?, 'RETURN_RESTORE', ?, ?, ?, ?, ?)
      `).run(productId, quantity, prev, next, `Return Approved (Return ID: ${returnId})`, orderId);
    });

    txn();
  }

  // Get inventory change logs
  static getAuditLogs({ productId = null, limit = 30, page = 1 } = {}) {
    let whereSql = '';
    let params = [];

    if (productId) {
      whereSql = 'WHERE il.product_id = ?';
      params.push(productId);
    }

    const count = db.prepare(`SELECT COUNT(*) as count FROM inventory_logs il ${whereSql}`).get(...params).count;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const rows = db.prepare(`
      SELECT il.*, p.name as product_name, p.product_code
      FROM inventory_logs il
      JOIN products p ON il.product_id = p.id
      ${whereSql}
      ORDER BY il.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit, 10), offset);

    return {
      logs: rows,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }
}

module.exports = Inventory;
