const { db } = require('../config/database');

/**
 * Object-Oriented Product Domain Model
 */
class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.productCode = data.product_code || data.productCode || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.categoryId = data.category_id !== undefined ? data.category_id : data.categoryId;
    this.categoryName = data.category_name || data.categoryName || '';
    this.price = typeof data.price === 'number' ? data.price : parseFloat(data.price || 0);
    this.stockQuantity = typeof data.stock_quantity === 'number' ? data.stock_quantity : parseInt(data.stock_quantity || 0, 10);
    this.imageUrl = data.image_url || data.imageUrl || '';
    this.isAvailable = data.is_available !== undefined ? Boolean(data.is_available) : true;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  // Check if requested quantity is available in stock
  isStockAvailable(requestedQty = 1) {
    return this.isAvailable && this.stockQuantity >= requestedQty;
  }

  // Stock status label
  getStockStatus() {
    if (!this.isAvailable || this.stockQuantity <= 0) return 'OUT_OF_STOCK';
    if (this.stockQuantity <= 5) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  static findById(id) {
    const row = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);
    return row ? new Product(row) : null;
  }

  static findByProductCode(code) {
    const row = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.product_code = ?
    `).get(code);
    return row ? new Product(row) : null;
  }

  // Dynamic search, filter, sort, pagination
  static findAll({
    search = '',
    categoryId = null,
    minPrice = null,
    maxPrice = null,
    inStockOnly = false,
    sortBy = 'newest',
    page = 1,
    limit = 12
  } = {}) {
    let whereClauses = [];
    let params = [];

    if (search && search.trim()) {
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.product_code LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (categoryId) {
      whereClauses.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      whereClauses.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice !== null && !isNaN(maxPrice)) {
      whereClauses.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (inStockOnly) {
      whereClauses.push('p.is_available = 1 AND p.stock_quantity > 0');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sorting
    let orderSql = 'ORDER BY p.id DESC';
    if (sortBy === 'price_asc') {
      orderSql = 'ORDER BY p.price ASC';
    } else if (sortBy === 'price_desc') {
      orderSql = 'ORDER BY p.price DESC';
    } else if (sortBy === 'name_asc') {
      orderSql = 'ORDER BY p.name ASC';
    } else if (sortBy === 'newest') {
      orderSql = 'ORDER BY p.id DESC';
    }

    // Count total matches
    const countRow = db.prepare(`
      SELECT COUNT(*) as total
      FROM products p
      ${whereSql}
    `).get(...params);
    const total = countRow.total;

    // Pagination
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(query).all(...params, parseInt(limit, 10), offset);

    return {
      products: rows.map(r => new Product(r)),
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Create Product
  static create({ productCode, name, description, categoryId, price, stockQuantity, imageUrl, isAvailable = 1 }) {
    const code = productCode || `PRD-${Date.now().toString(36).toUpperCase()}`;
    const stmt = db.prepare(`
      INSERT INTO products (product_code, name, description, category_id, price, stock_quantity, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      code,
      name.trim(),
      description?.trim() || '',
      categoryId,
      parseFloat(price),
      parseInt(stockQuantity || 0, 10),
      imageUrl?.trim() || '',
      isAvailable ? 1 : 0
    );

    // Record initial inventory log
    db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity, previous_stock, new_stock, reason)
      VALUES (?, 'INITIAL_STOCK', ?, 0, ?, 'Product creation initial stock')
    `).run(info.lastInsertRowid, parseInt(stockQuantity || 0, 10), parseInt(stockQuantity || 0, 10));

    return Product.findById(info.lastInsertRowid);
  }

  // Update Product
  update({ name, description, categoryId, price, imageUrl, isAvailable }) {
    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, description = ?, category_id = ?, price = ?, image_url = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      name.trim(),
      description?.trim() || '',
      categoryId,
      parseFloat(price),
      imageUrl?.trim() || '',
      isAvailable ? 1 : 0,
      this.id
    );

    this.name = name;
    this.description = description;
    this.categoryId = categoryId;
    this.price = parseFloat(price);
    this.imageUrl = imageUrl;
    this.isAvailable = Boolean(isAvailable);
  }

  // Delete product
  static delete(id) {
    // Check if product is in existing orders
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?').get(id).count;
    if (orderCount > 0) {
      throw new Error(`Cannot delete product referenced in ${orderCount} existing order(s). Set availability to false instead.`);
    }
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    return stmt.run(id);
  }

  toJSON() {
    return {
      id: this.id,
      productCode: this.productCode,
      name: this.name,
      description: this.description,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      price: this.price,
      stockQuantity: this.stockQuantity,
      imageUrl: this.imageUrl,
      isAvailable: this.isAvailable,
      stockStatus: this.getStockStatus(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;
