const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', requireRole('admin'), PaymentController.getAllPayments);
router.get('/order/:orderId', PaymentController.getPaymentByOrderId);

module.exports = router;
