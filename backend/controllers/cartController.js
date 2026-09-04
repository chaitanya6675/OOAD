const { Cart } = require('../models/Cart');

class CartController {
  // Get cart for logged in user
  static async getCart(req, res, next) {
    try {
      const cart = Cart.load(req.user.id);
      res.json({
        success: true,
        cart: cart.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Add item to cart
  static async addToCart(req, res, next) {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
      }

      const cart = Cart.addItem(req.user.id, parseInt(productId, 10), parseInt(quantity, 10));
      res.json({
        success: true,
        message: 'Product added to cart.',
        cart: cart.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Update item quantity in cart
  static async updateCartItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;

      if (!productId || quantity === undefined) {
        return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
      }

      const cart = Cart.updateItem(req.user.id, parseInt(productId, 10), parseInt(quantity, 10));
      res.json({
        success: true,
        message: 'Cart updated.',
        cart: cart.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Remove item from cart
  static async removeFromCart(req, res, next) {
    try {
      const { productId } = req.params;
      const cart = Cart.removeItem(req.user.id, parseInt(productId, 10));
      res.json({
        success: true,
        message: 'Item removed from cart.',
        cart: cart.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Clear cart
  static async clearCart(req, res, next) {
    try {
      const cart = Cart.clear(req.user.id);
      res.json({
        success: true,
        message: 'Cart cleared.',
        cart: cart.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CartController;
