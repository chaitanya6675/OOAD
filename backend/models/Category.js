const { db } = require('../config/database');

/**
 * Object-Oriented Category Domain Model
 */
class Category {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.slug = data.slug || '';
    this.description = data.description || '';
    this.imageUrl = data.image_url || data.imageUrl || '';
    this.createdAt = data.created_at || data.createdAt || null;
    this.productCount = data.product_count !== undefined ? data.product_count : 0;
  }

  static findAll() {
    const rows = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name ASC
    `).all();
    return rows.map(r => new Category(r));
  }

  static findById(id) {
    const row = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c 
      WHERE c.id = ?
    `).get(id);
    return row ? new Category(row) : null;
  }

  static findBySlug(slug) {
    const row = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c 
      WHERE LOWER(c.slug) = LOWER(?)
    `).get(slug);
    return row ? new Category(row) : null;
  }

  static create({ name, slug, description, imageUrl }) {
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stmt = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(name.trim(), finalSlug, description?.trim() || '', imageUrl?.trim() || '');
    return Category.findById(info.lastInsertRowid);
  }

  update({ name, slug, description, imageUrl }) {
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stmt = db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, image_url = ?
      WHERE id = ?
    `);
    stmt.run(name.trim(), finalSlug, description?.trim() || '', imageUrl?.trim() || '', this.id);
    this.name = name;
    this.slug = finalSlug;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  static delete(id) {
    // Check if products exist in category
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id).count;
    if (productCount > 0) {
      throw new Error(`Cannot delete category with ${productCount} associated product(s). Move or delete products first.`);
    }
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    return stmt.run(id);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      productCount: this.productCount
    };
  }
}

module.exports = Category;
