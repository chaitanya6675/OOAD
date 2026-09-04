const Inventory = require('../models/Inventory');

class InventoryController {
  // Get live inventory overview
  static async getLiveStock(req, res, next) {
    try {
      const { filter, search, page, limit } = req.query;
      const result = Inventory.getLiveStock({
        filter,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20
      });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // Adjust stock manually
  static async adjustStock(req, res, next) {
    try {
      const { productId, adjustment, reason } = req.body;

      if (!productId || adjustment === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and stock adjustment amount are required.'
        });
      }

      const result = Inventory.adjustStock({
        productId: parseInt(productId, 10),
        adjustment: parseInt(adjustment, 10),
        reason: reason || 'Manual stock adjustment by admin',
        adminId: req.user.id
      });

      res.json({
        success: true,
        message: 'Stock adjusted successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // Get inventory audit logs
  static async getAuditLogs(req, res, next) {
    try {
      const { productId, page, limit } = req.query;
      const result = Inventory.getAuditLogs({
        productId: productId ? parseInt(productId, 10) : null,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 30
      });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InventoryController;
