const Return = require('../models/Return');
const Refund = require('../models/Refund');

class ReturnController {
  // Customer submits return request
  static async requestReturn(req, res, next) {
    try {
      const { orderId, productId, reason } = req.body;

      if (!orderId || !productId || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, Product ID, and Return Reason are required.'
        });
      }

      const returnRecord = Return.create({
        orderId: parseInt(orderId, 10),
        userId: req.user.id,
        productId: parseInt(productId, 10),
        reason
      });

      res.status(201).json({
        success: true,
        message: 'Return request submitted successfully.',
        returnRequest: returnRecord.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Customer lists their returns
  static async getMyReturns(req, res, next) {
    try {
      const returns = Return.findByUserId(req.user.id);
      res.json({
        success: true,
        returns: returns.map(r => r.toJSON())
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin lists all returns
  static async getAllReturns(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = Return.findAll({
        status,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20
      });

      res.json({
        success: true,
        returns: result.returns.map(r => r.toJSON()),
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin updates return status (Approve / Reject)
  static async updateReturnStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const returnRecord = Return.findById(id);
      if (!returnRecord) {
        return res.status(404).json({ success: false, message: 'Return record not found.' });
      }

      returnRecord.updateStatus(status, adminNotes);

      // If Approved, automatically generate pending Refund record
      if (status === 'Approved') {
        const existingRefund = Refund.findAll().refunds.find(ref => ref.returnId === returnRecord.id);
        if (!existingRefund) {
          Refund.create({
            orderId: returnRecord.orderId,
            returnId: returnRecord.id,
            userId: returnRecord.userId,
            amount: returnRecord.unitPrice,
            reason: `Return Approved: ${returnRecord.reason}`,
            status: 'Pending'
          });
        }
      }

      res.json({
        success: true,
        message: `Return request marked as ${status}.`,
        returnRequest: Return.findById(id).toJSON()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReturnController;
