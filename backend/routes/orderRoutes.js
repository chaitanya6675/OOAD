const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticate);

// Customer endpoints
router.post('/checkout', OrderController.createOrder);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', OrderController.cancelOrder);

// Admin endpoints
router.get('/', requireRole('admin'), OrderController.getAllOrders);
router.put('/:id/status', requireRole('admin'), OrderController.updateOrderStatus);

module.exports = router;
