require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { initDatabase } = require('./config/database');
const seed = require('./seeds/seedData');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const returnRoutes = require('./routes/returnRoutes');
const refundRoutes = require('./routes/refundRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & seed if needed
initDatabase();
seed().catch(err => console.error('[STARTUP SEED ERROR]:', err));

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    project: 'Smart E-Commerce Platform (OOAD Capstone)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve frontend production build if available
const fs = require('fs');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404 handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.originalUrl} not found.`
    });
  });
}

// Central Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` SMART E-COMMERCE BACKEND API SERVER RUNNING`);
  console.log(` Port:    http://localhost:${PORT}`);
  console.log(` Health:  http://localhost:${PORT}/api/health`);
  console.log(` Node:    ${process.version} | Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database: Centralized SQLite (backend/database/ecommerce.db)`);
  console.log(`=======================================================`);
});

module.exports = app;
