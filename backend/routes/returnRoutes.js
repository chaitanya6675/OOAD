const express = require('express');
const router = express.Router();
const ReturnController = require('../controllers/returnController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// Customer endpoints
router.post('/request', ReturnController.requestReturn);
router.get('/my-returns', ReturnController.getMyReturns);

// Admin endpoints
router.get('/', requireRole('admin'), ReturnController.getAllReturns);
router.put('/:id/status', requireRole('admin'), ReturnController.updateReturnStatus);

module.exports = router;
