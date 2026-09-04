const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public catalog routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Admin-only management routes
router.post('/', authenticate, requireRole('admin'), ProductController.createProduct);
router.put('/:id', authenticate, requireRole('admin'), ProductController.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), ProductController.deleteProduct);

module.exports = router;
