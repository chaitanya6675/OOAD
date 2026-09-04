const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/order/:orderId', InvoiceController.getInvoice);

module.exports = router;
