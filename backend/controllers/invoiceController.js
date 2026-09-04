const Invoice = require('../models/Invoice');
const { Order } = require('../models/Order');

class InvoiceController {
  // Get invoice details by Order ID
  static async getInvoice(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check permission
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      let invoice = Invoice.findByOrderId(orderId);
      if (!invoice) {
        invoice = Invoice.createForOrder(order.id, order.totalAmount);
      }

      res.json({
        success: true,
        invoice: invoice.toJSON(),
        order: order.toJSON(),
        store: {
          name: 'Smart E-Commerce Store',
          tagline: 'Object-Oriented Sales & Order Management Platform',
          address: '100 University Avenue, Tech Park Suite 400',
          city: 'San Francisco, CA 94107',
          email: 'support@smartecom.com',
          phone: '+1 (800) 555-0199',
          taxId: 'US-EIN-987654321'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InvoiceController;
