const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', InventoryController.getLiveStock);
router.post('/adjust', InventoryController.adjustStock);
router.get('/logs', InventoryController.getAuditLogs);

module.exports = router;
