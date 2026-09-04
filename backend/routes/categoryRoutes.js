const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public category routes
router.get('/', CategoryController.getCategories);
router.get('/:idOrSlug', CategoryController.getCategory);

// Admin-only category routes
router.post('/', authenticate, requireRole('admin'), CategoryController.createCategory);
router.put('/:id', authenticate, requireRole('admin'), CategoryController.updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), CategoryController.deleteCategory);

module.exports = router;
