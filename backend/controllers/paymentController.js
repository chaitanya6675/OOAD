const Payment = require('../models/Payment');

class PaymentController {
  // Get all payments (Admin)
  static async getAllPayments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = Payment.findAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20
      });

      res.json({
        success: true,
        payments: result.payments.map(p => p.toJSON()),
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      next(err);
    }
  }

  // Get payment by order ID
  static async getPaymentByOrderId(req, res, next) {
    try {
      const { orderId } = req.params;
      const payment = Payment.findByOrderId(orderId);

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found for this order.' });
      }

      res.json({
        success: true,
        payment: payment.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
