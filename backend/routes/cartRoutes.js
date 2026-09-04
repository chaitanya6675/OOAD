const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// All cart routes require customer authentication
router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.put('/items', CartController.updateCartItem);
router.delete('/items/:productId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

module.exports = router;
