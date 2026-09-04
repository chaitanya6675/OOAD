const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/dashboard', AdminController.getDashboardMetrics);
router.get('/analytics', AdminController.getAnalytics);
router.get('/reports', AdminController.getSalesReports);
router.get('/customers', AdminController.getAllCustomers);

module.exports = router;
