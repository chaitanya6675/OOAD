const { db } = require('../config/database');
const { Order } = require('../models/Order');
const { Cart } = require('../models/Cart');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');

class OrderController {
  // Checkout & Place Order
  static async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        state,
        postalCode,
        country = 'United States',
        paymentMethod = 'COD',
        cardDetails = null,
        notes = ''
      } = req.body;

      // Validation
      if (!customerName || !shippingAddress || !city || !state || !postalCode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide complete delivery details (Name, Address, City, State, Postal Code).'
        });
      }

      if (!['COD', 'DEMO_CARD'].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method. Supported: Cash on Delivery (COD) or Demo Card Payment.'
        });
      }

      // Demo card payment validation
      let cardLast4 = null;
      let paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';

      if (paymentMethod === 'DEMO_CARD') {
        if (!cardDetails) {
          return res.status(400).json({ success: false, message: 'Card details are required for demo card payment.' });
        }
        const cardValidation = Payment.validateDemoCard(cardDetails);
        if (!cardValidation.valid) {
          return res.status(400).json({ success: false, message: cardValidation.message });
        }
        const cleanedCard = cardDetails.cardNumber.replace(/\s+/g, '');
        cardLast4 = cleanedCard.slice(-4);
      }

      // Load user cart
      const cart = Cart.load(userId);
      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your shopping cart is empty. Add products before placing an order.'
        });
      }

      // Validate stock availability
      const stockCheck = cart.validateStock();
      if (!stockCheck.valid) {
        return res.status(400).json({ success: false, message: stockCheck.error });
      }

      const orderNumber = Order.generateOrderNumber();
      let createdOrderId = null;

      // Execute order placement inside an atomic transaction
      const placeOrderTxn = db.transaction(() => {
        // 1. Deduct inventory for all items
        Inventory.deductForOrder(orderNumber, cart.items);

        // 2. Insert order
        const orderStmt = db.prepare(`
          INSERT INTO orders (
            order_number, user_id, customer_name, customer_email, customer_phone,
            shipping_address, city, state, postal_code, country,
            subtotal, shipping_fee, total_amount,
            payment_method, payment_status, order_status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
        `);

        const orderInfo = orderStmt.run(
          orderNumber,
          userId,
          customerName.trim(),
          customerEmail || req.user.email,
          customerPhone || req.user.phone,
          shippingAddress.trim(),
          city.trim(),
          state.trim(),
          postalCode.trim(),
          country,
          cart.subtotal,
          cart.shippingFee,
          cart.totalAmount,
          paymentMethod,
          paymentStatus,
          notes || ''
        );
        createdOrderId = orderInfo.lastInsertRowid;

        // 3. Insert order items
        const itemStmt = db.prepare(`
          INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const item of cart.items) {
          itemStmt.run(
            createdOrderId,
            item.productId,
            item.productName,
            item.price,
            item.quantity,
            item.subtotal
          );
        }

        // 4. Record payment
        Payment.create({
          orderId: createdOrderId,
          userId,
          amount: cart.totalAmount,
          paymentMethod,
          cardLast4,
          paymentStatus
        });

        // 5. Generate Invoice
        Invoice.createForOrder(createdOrderId, cart.totalAmount);

        // 6. Clear user cart
        Cart.clear(userId);
      });

      placeOrderTxn();

      const createdOrder = Order.findById(createdOrderId);
      const invoice = Invoice.findByOrderId(createdOrderId);
      const payment = Payment.findByOrderId(createdOrderId);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: createdOrder.toJSON(),
        invoice: invoice ? invoice.toJSON() : null,
        payment: payment ? payment.toJSON() : null
      });
    } catch (err) {
      next(err);
    }
  }

  // Get My Orders (Customer)
  static async getMyOrders(req, res, next) {
    try {
      const orders = Order.findByUserId(req.user.id);
      res.json({
        success: true,
        orders: orders.map(o => o.toJSON())
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Order By ID (Customer or Admin)
  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = Order.findById(id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check permission: customer can only view own orders; admin can view all
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied to this order.' });
      }

      const invoice = Invoice.findByOrderId(order.id);
      const payment = Payment.findByOrderId(order.id);

      res.json({
        success: true,
        order: order.toJSON(),
        invoice: invoice ? invoice.toJSON() : null,
        payment: payment ? payment.toJSON() : null
      });
    } catch (err) {
      next(err);
    }
  }

  // Cancel Order (Customer)
  static async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason = 'Cancelled by customer' } = req.body;
      const order = Order.findById(id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check ownership
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      if (!order.canCancel()) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status "${order.orderStatus}". Orders can only be cancelled while in "Pending" status.`
        });
      }

      // Atomic cancellation & stock restore
      const cancelTxn = db.transaction(() => {
        order.updateStatus('Cancelled');

        db.prepare('UPDATE orders SET cancel_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(reason, order.id);

        // If paid with card, mark payment refunded
        if (order.paymentStatus === 'Paid') {
          order.updatePaymentStatus('Refunded');
          db.prepare("UPDATE payments SET payment_status = 'Refunded' WHERE order_id = ?").run(order.id);
        }

        // Restore inventory
        Inventory.restoreForOrder(order.id, `Order Cancelled: ${reason}`);
      });

      cancelTxn();

      res.json({
        success: true,
        message: 'Order cancelled successfully and inventory has been restored.',
        order: Order.findById(id).toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Get All Orders (Admin)
  static async getAllOrders(req, res, next) {
    try {
      const { status, search, page, limit } = req.query;
      const result = Order.findAll({
        status,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 15
      });

      res.json({
        success: true,
        orders: result.orders.map(o => o.toJSON()),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (err) {
      next(err);
    }
  }

  // Update Order Status (Admin)
  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus } = req.body;
      const order = Order.findById(id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const updateTxn = db.transaction(() => {
        if (orderStatus && orderStatus !== order.orderStatus) {
          // If admin cancels an order that was not already cancelled, restore inventory
          if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
            Inventory.restoreForOrder(order.id, 'Admin order cancellation');
          }
          order.updateStatus(orderStatus);
        }

        if (paymentStatus && paymentStatus !== order.paymentStatus) {
          order.updatePaymentStatus(paymentStatus);
          db.prepare('UPDATE payments SET payment_status = ? WHERE order_id = ?').run(paymentStatus, order.id);
        }
      });

      updateTxn();

      res.json({
        success: true,
        message: 'Order updated successfully.',
        order: Order.findById(id).toJSON()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
