const Refund = require('../models/Refund');

class RefundController {
  // Get all refunds (Admin)
  static async getAllRefunds(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = Refund.findAll({
        status,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20
      });

      res.json({
        success: true,
        refunds: result.refunds.map(r => r.toJSON()),
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      next(err);
    }
  }

  // Process refund (Admin)
  static async processRefund(req, res, next) {
    try {
      const { id } = req.params;
      const refund = Refund.findById(id);

      if (!refund) {
        return res.status(404).json({ success: false, message: 'Refund record not found.' });
      }

      refund.processRefund();

      res.json({
        success: true,
        message: 'Refund processed successfully. Associated inventory has been replenished and order status updated.',
        refund: Refund.findById(id).toJSON()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RefundController;
