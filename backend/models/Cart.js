const { db } = require('../config/database');
const Product = require('./Product');

/**
 * Object-Oriented Cart Item Domain Model
 */
class CartItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.user_id || data.userId;
    this.productId = data.product_id || data.productId;
    this.productName = data.product_name || data.productName || '';
    this.productCode = data.product_code || data.productCode || '';
    this.imageUrl = data.image_url || data.imageUrl || '';
    this.price = typeof data.price === 'number' ? data.price : parseFloat(data.price || 0);
    this.quantity = typeof data.quantity === 'number' ? data.quantity : parseInt(data.quantity || 1, 10);
    this.stockQuantity = typeof data.stock_quantity === 'number' ? data.stock_quantity : parseInt(data.stock_quantity || 0, 10);
    this.isAvailable = data.is_available !== undefined ? Boolean(data.is_available) : true;
    this.subtotal = parseFloat((this.price * this.quantity).toFixed(2));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      productId: this.productId,
      productName: this.productName,
      productCode: this.productCode,
      imageUrl: this.imageUrl,
      price: this.price,
      quantity: this.quantity,
      stockQuantity: this.stockQuantity,
      isAvailable: this.isAvailable,
      subtotal: this.subtotal
    };
  }
}

/**
 * Object-Oriented Cart Aggregate Domain Model
 */
class Cart {
  constructor(userId) {
    this.userId = userId;
    this.items = [];
    this.subtotal = 0;
    this.itemCount = 0;
    this.shippingFee = 0;
    this.totalAmount = 0;
  }

  // Load cart from database
  static load(userId) {
    const cart = new Cart(userId);
    const rows = db.prepare(`
      SELECT 
        ci.id, ci.user_id, ci.product_id, ci.quantity,
        p.name as product_name, p.product_code, p.image_url, p.price, p.stock_quantity, p.is_available
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at ASC
    `).all(userId);

    cart.items = rows.map(r => new CartItem(r));
    cart.recalculate();
    return cart;
  }

  // Recalculate financial totals
  recalculate() {
    this.subtotal = parseFloat(this.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    // Shipping logic: Free shipping over $100, else $10 flat rate
    this.shippingFee = this.subtotal > 100 || this.subtotal === 0 ? 0.0 : 10.0;
    this.totalAmount = parseFloat((this.subtotal + this.shippingFee).toFixed(2));
  }

  // Add product to cart with stock validation
  static addItem(userId, productId, quantity = 1) {
    const product = Product.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }
    if (!product.isAvailable || product.stockQuantity < 1) {
      throw new Error('Product is currently out of stock.');
    }

    // Check existing item in cart
    const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, productId);
    const currentQty = existing ? existing.quantity : 0;
    const requestedTotalQty = currentQty + quantity;

    if (requestedTotalQty > product.stockQuantity) {
      throw new Error(`Cannot add ${quantity} item(s). Only ${product.stockQuantity - currentQty} more available in stock.`);
    }

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(requestedTotalQty, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)')
        .run(userId, productId, quantity);
    }

    return Cart.load(userId);
  }

  // Update quantity with stock validation
  static updateItem(userId, productId, quantity) {
    if (quantity <= 0) {
      return Cart.removeItem(userId, productId);
    }

    const product = Product.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    if (quantity > product.stockQuantity) {
      throw new Error(`Cannot set quantity to ${quantity}. Only ${product.stockQuantity} available in stock.`);
    }

    const stmt = db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?');
    stmt.run(quantity, userId, productId);

    return Cart.load(userId);
  }

  // Remove item from cart
  static removeItem(userId, productId) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    return Cart.load(userId);
  }

  // Clear all items in cart
  static clear(userId) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    return new Cart(userId);
  }

  // Validate that all items in cart are in stock
  validateStock() {
    for (const item of this.items) {
      if (!item.isAvailable || item.stockQuantity < item.quantity) {
        return {
          valid: false,
          error: `Product "${item.productName}" has only ${item.stockQuantity} available (in cart: ${item.quantity}). Please adjust quantity before checkout.`
        };
      }
    }
    return { valid: true };
  }

  toJSON() {
    return {
      userId: this.userId,
      items: this.items.map(i => i.toJSON()),
      itemCount: this.itemCount,
      subtotal: this.subtotal,
      shippingFee: this.shippingFee,
      totalAmount: this.totalAmount
    };
  }
}

module.exports = { Cart, CartItem };
