const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

/**
 * Object-Oriented User Domain Model
 */
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.passwordHash = data.password_hash || data.passwordHash || '';
    this.fullName = data.full_name || data.fullName || '';
    this.phone = data.phone || '';
    this.role = data.role || 'customer';
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  // Validate raw password against stored hash
  async validatePassword(plainPassword) {
    if (!this.passwordHash || !plainPassword) return false;
    return bcrypt.compare(plainPassword, this.passwordHash);
  }

  // Hash password before saving
  static async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  }

  // Find user by ID
  static findById(id) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? new User(row) : null;
  }

  // Find user by Email
  static findByEmail(email) {
    const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    return row ? new User(row) : null;
  }

  // Create new user
  static async create({ email, password, fullName, phone, role = 'customer' }) {
    const passwordHash = await User.hashPassword(password);
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(email.toLowerCase().trim(), passwordHash, fullName.trim(), phone?.trim() || null, role);
    return User.findById(info.lastInsertRowid);
  }

  // Update profile
  updateProfile({ fullName, phone }) {
    const stmt = db.prepare(`
      UPDATE users SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(fullName.trim(), phone?.trim() || null, this.id);
    this.fullName = fullName;
    this.phone = phone;
  }

  // Safe JSON serialization excluding password hash
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      phone: this.phone,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
