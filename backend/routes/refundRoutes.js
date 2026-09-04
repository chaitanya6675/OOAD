const express = require('express');
const router = express.Router();
const RefundController = require('../controllers/refundController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', RefundController.getAllRefunds);
router.post('/:id/process', RefundController.processRefund);

module.exports = router;
