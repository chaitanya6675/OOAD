const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/exportController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin'));

// Master multi-sheet Excel file (.xlsx) containing all 12 database tables
router.get('/excel/all', ExportController.exportAllExcel);

// Export single table to CSV
router.get('/csv/:table', ExportController.exportTableCsv);

// Live data inspection preview for admin table viewer
router.get('/records/:table', ExportController.getTableRecords);

module.exports = router;
