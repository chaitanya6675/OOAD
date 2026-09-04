import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  INITIAL_RETURNS,
  INITIAL_REFUNDS,
  INITIAL_INVENTORY_LOGS
} from './mockData.js';

// Helper to get from localStorage or fallback
const getStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

export class DbStore {
  static init() {
    if (!localStorage.getItem('smart_ecom_initialized_v2')) {
      setStorage('smart_ecom_categories', INITIAL_CATEGORIES);
      setStorage('smart_ecom_products', INITIAL_PRODUCTS);
      setStorage('smart_ecom_users', INITIAL_USERS);
      setStorage('smart_ecom_orders', INITIAL_ORDERS);
      setStorage('smart_ecom_payments', INITIAL_PAYMENTS);
      setStorage('smart_ecom_invoices', INITIAL_INVOICES);
      setStorage('smart_ecom_returns', INITIAL_RETURNS);
      setStorage('smart_ecom_refunds', INITIAL_REFUNDS);
      setStorage('smart_ecom_inventory_logs', INITIAL_INVENTORY_LOGS);
      setStorage('smart_ecom_cart', { items: [], itemCount: 0, subtotal: 0, shippingFee: 0, totalAmount: 0 });
      localStorage.setItem('smart_ecom_initialized_v2', 'true');
    }
  }

  // --- AUTH ---
  static getUsers() {
    this.init();
    return getStorage('smart_ecom_users', INITIAL_USERS);
  }

  static login(email, password) {
    this.init();
    const users = this.getUsers();
    const normalizedEmail = (email || '').trim().toLowerCase();
    
    // Check if user exists or matches demo credentials
    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      if (normalizedEmail === 'admin@smartecom.com') {
        user = INITIAL_USERS[0];
      } else if (normalizedEmail === 'customer@smartecom.com') {
        user = INITIAL_USERS[1];
      } else {
        // Auto-register convenience for demo or throw
        throw new Error('Invalid email or password. Use demo credentials or register.');
      }
    }

    const token = 'demo_jwt_token_' + user.id + '_' + Date.now();
    localStorage.setItem('smart_ecom_token', token);
    localStorage.setItem('smart_ecom_current_user', JSON.stringify(user));
    return { token, user };
  }

  static register(formData) {
    this.init();
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: Date.now(),
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone || '',
      role: 'customer',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      postalCode: formData.postalCode || '',
      country: formData.country || 'United States',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    users.push(newUser);
    setStorage('smart_ecom_users', users);

    const token = 'demo_jwt_token_' + newUser.id + '_' + Date.now();
    localStorage.setItem('smart_ecom_token', token);
    localStorage.setItem('smart_ecom_current_user', JSON.stringify(newUser));
    return { token, user: newUser };
  }

  static getCurrentUser() {
    this.init();
    const raw = localStorage.getItem('smart_ecom_current_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static updateProfile(profileData) {
    this.init();
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    const updated = { ...currentUser, ...profileData, updatedAt: new Date().toISOString() };
    
    if (idx !== -1) {
      users[idx] = updated;
      setStorage('smart_ecom_users', users);
    }
    localStorage.setItem('smart_ecom_current_user', JSON.stringify(updated));
    return updated;
  }

  // --- CATEGORIES ---
  static getCategories() {
    this.init();
    const categories = getStorage('smart_ecom_categories', INITIAL_CATEGORIES);
    const products = this.getProductsRaw();
    return categories.map(cat => ({
      ...cat,
      productCount: products.filter(p => p.categoryId === cat.id).length
    }));
  }

  static saveCategory(catData) {
    this.init();
    const categories = getStorage('smart_ecom_categories', INITIAL_CATEGORIES);
    if (catData.id) {
      const idx = categories.findIndex(c => c.id === Number(catData.id));
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...catData };
        setStorage('smart_ecom_categories', categories);
        return categories[idx];
      }
    }
    const newCat = {
      id: Date.now(),
      name: catData.name,
      slug: catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catData.description || '',
      imageUrl: catData.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'
    };
    categories.push(newCat);
    setStorage('smart_ecom_categories', categories);
    return newCat;
  }

  static deleteCategory(id) {
    this.init();
    let categories = getStorage('smart_ecom_categories', INITIAL_CATEGORIES);
    categories = categories.filter(c => c.id !== Number(id));
    setStorage('smart_ecom_categories', categories);
    return true;
  }

  // --- PRODUCTS ---
  static getProductsRaw() {
    this.init();
    return getStorage('smart_ecom_products', INITIAL_PRODUCTS);
  }

  static getProducts(params = {}) {
    this.init();
    let products = this.getProductsRaw();
    const categories = this.getCategories();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    // Attach category name and stock status
    products = products.map(p => ({
      ...p,
      categoryName: catMap[p.categoryId] || 'Electronics',
      stockStatus: p.stockQuantity <= 0 ? 'Out of Stock' : (p.stockQuantity <= 10 ? 'Low Stock' : 'In Stock')
    }));

    // Filter: Category
    if (params.category && params.category !== '') {
      products = products.filter(p => p.categoryId === Number(params.category));
    }

    // Filter: Search keyword
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.productCode.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Filter: Price
    if (params.minPrice !== undefined && params.minPrice !== null && params.minPrice !== '') {
      products = products.filter(p => p.price >= Number(params.minPrice));
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null && params.maxPrice !== '') {
      products = products.filter(p => p.price <= Number(params.maxPrice));
    }

    // Filter: In Stock Only
    if (params.inStock === true || params.inStock === 'true' || params.inStockOnly === true || params.inStockOnly === 'true') {
      products = products.filter(p => p.stockQuantity > 0 && p.isAvailable);
    }

    // Sort
    const sortBy = params.sortBy || 'newest';
    if (sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-az') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      products.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    const total = products.length;
    const limit = Number(params.limit) || (params.limit === null ? total : 12);
    const page = Number(params.page) || 1;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = products.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      totalPages,
      page,
      limit,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  static getProductById(id) {
    this.init();
    const products = this.getProductsRaw();
    const product = products.find(p => p.id === Number(id));
    if (!product) return null;
    const categories = this.getCategories();
    const cat = categories.find(c => c.id === product.categoryId);
    return {
      ...product,
      categoryName: cat ? cat.name : 'Electronics',
      stockStatus: product.stockQuantity <= 0 ? 'Out of Stock' : (product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock')
    };
  }

  static saveProduct(prodData) {
    this.init();
    const products = this.getProductsRaw();
    if (prodData.id) {
      const idx = products.findIndex(p => p.id === Number(prodData.id));
      if (idx !== -1) {
        const oldStock = products[idx].stockQuantity;
        const newStock = Number(prodData.stockQuantity);
        products[idx] = {
          ...products[idx],
          ...prodData,
          price: Number(prodData.price),
          stockQuantity: newStock,
          categoryId: Number(prodData.categoryId)
        };
        setStorage('smart_ecom_products', products);

        if (oldStock !== newStock) {
          this.logInventoryMovement(
            products[idx].id,
            products[idx].name,
            'MANUAL_ADJUST',
            Math.abs(newStock - oldStock),
            oldStock,
            newStock,
            'Manual adjustment in Admin Product Management'
          );
        }
        return products[idx];
      }
    }

    const newProd = {
      id: Date.now(),
      productCode: prodData.productCode || `PRD-${Date.now().toString().slice(-6)}`,
      name: prodData.name,
      description: prodData.description || '',
      categoryId: Number(prodData.categoryId),
      price: Number(prodData.price),
      stockQuantity: Number(prodData.stockQuantity) || 0,
      imageUrl: prodData.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
      isAvailable: 1,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    products.push(newProd);
    setStorage('smart_ecom_products', products);

    this.logInventoryMovement(
      newProd.id,
      newProd.name,
      'INITIAL_STOCK',
      newProd.stockQuantity,
      0,
      newProd.stockQuantity,
      'Initial stock creation'
    );
    return newProd;
  }

  static deleteProduct(id) {
    this.init();
    let products = this.getProductsRaw();
    products = products.filter(p => p.id !== Number(id));
    setStorage('smart_ecom_products', products);
    return true;
  }

  // --- SHOPPING CART ---
  static getCart() {
    this.init();
    const cart = getStorage('smart_ecom_cart', { items: [], itemCount: 0, subtotal: 0, shippingFee: 0, totalAmount: 0 });
    const products = this.getProductsRaw();
    const prodMap = Object.fromEntries(products.map(p => [p.id, p]));
    let modified = false;

    if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
      cart.items = cart.items.map(item => {
        const prod = prodMap[item.productId];
        const stockQuantity = prod ? prod.stockQuantity : (typeof item.stockQuantity === 'number' ? item.stockQuantity : 99);
        const isAvailable = prod ? (prod.isAvailable !== 0 && prod.isAvailable !== false ? 1 : 0) : (item.isAvailable === 0 || item.isAvailable === false ? 0 : 1);
        const productName = prod ? prod.name : (item.productName || item.name || 'Product');

        if (item.isAvailable !== isAvailable || item.stockQuantity !== stockQuantity || item.productName !== productName) {
          modified = true;
        }

        return {
          ...item,
          name: productName,
          productName,
          stockQuantity,
          isAvailable
        };
      });

      if (modified) {
        setStorage('smart_ecom_cart', cart);
      }
    }
    return cart;
  }

  static recalculateCart(cart) {
    const products = this.getProductsRaw();
    const prodMap = Object.fromEntries(products.map(p => [p.id, p]));

    // Validate and update item attributes against catalog
    cart.items = (cart.items || []).map(item => {
      const prod = prodMap[item.productId];
      const maxStock = prod ? prod.stockQuantity : (typeof item.stockQuantity === 'number' ? item.stockQuantity : 99);
      const isAvailable = prod ? (prod.isAvailable !== 0 && prod.isAvailable !== false ? 1 : 0) : (item.isAvailable === 0 || item.isAvailable === false ? 0 : 1);
      const productName = prod ? prod.name : (item.productName || item.name || 'Product');
      const validQty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = prod ? prod.price : item.price;

      return {
        ...item,
        name: productName,
        productName,
        price: unitPrice,
        imageUrl: prod ? prod.imageUrl : item.imageUrl,
        stockQuantity: maxStock,
        isAvailable,
        quantity: validQty,
        subtotal: Number((unitPrice * validQty).toFixed(2))
      };
    });

    const itemCount = cart.items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = Number(cart.items.reduce((sum, it) => sum + (it.price * it.quantity), 0).toFixed(2));
    const shippingFee = (subtotal === 0 || subtotal >= 100) ? 0 : 15.00;
    const totalAmount = Number((subtotal + shippingFee).toFixed(2));

    const updated = { items: cart.items, itemCount, subtotal, shippingFee, totalAmount };
    setStorage('smart_ecom_cart', updated);
    return updated;
  }

  static addToCart(productId, quantity = 1) {
    this.init();
    const cart = this.getCart();
    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stockQuantity <= 0) throw new Error('Product is out of stock');

    const existingIndex = cart.items.findIndex(it => it.productId === product.id);
    if (existingIndex !== -1) {
      const desired = cart.items[existingIndex].quantity + quantity;
      if (desired > product.stockQuantity) {
        throw new Error(`Cannot add more. Only ${product.stockQuantity} items in stock.`);
      }
      cart.items[existingIndex].quantity = desired;
    } else {
      if (quantity > product.stockQuantity) {
        throw new Error(`Cannot add ${quantity}. Only ${product.stockQuantity} items in stock.`);
      }
      cart.items.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        productName: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable !== 0 && product.isAvailable !== false ? 1 : 0,
        quantity: quantity,
        subtotal: Number((product.price * quantity).toFixed(2))
      });
    }

    return this.recalculateCart(cart);
  }

  static updateCartItem(productId, quantity) {
    this.init();
    const cart = this.getCart();
    if (quantity <= 0) {
      cart.items = cart.items.filter(it => it.productId !== Number(productId));
    } else {
      const item = cart.items.find(it => it.productId === Number(productId));
      if (item) {
        const product = this.getProductById(productId);
        const maxStock = product ? product.stockQuantity : item.stockQuantity;
        if (quantity > maxStock) {
          throw new Error(`Only ${maxStock} items available in stock.`);
        }
        item.quantity = quantity;
      }
    }
    return this.recalculateCart(cart);
  }

  static removeCartItem(productId) {
    this.init();
    const cart = this.getCart();
    cart.items = cart.items.filter(it => it.productId !== Number(productId));
    return this.recalculateCart(cart);
  }

  static clearCart() {
    this.init();
    const empty = { items: [], itemCount: 0, subtotal: 0, shippingFee: 0, totalAmount: 0 };
    setStorage('smart_ecom_cart', empty);
    return empty;
  }

  // --- CHECKOUT & ORDERS ---
  static checkout(payload) {
    this.init();
    const cart = this.getCart();
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const user = this.getCurrentUser() || INITIAL_USERS[1];
    const products = this.getProductsRaw();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randSuffix}`;
    const invoiceNumber = `INV-${dateStr.slice(0, 6)}-${randSuffix}`;
    const txnId = `TXN-${dateStr}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1. Atomic Stock Deduction
    for (const item of cart.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const prev = prod.stockQuantity;
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        this.logInventoryMovement(
          prod.id,
          prod.name,
          'ORDER_DEDUCT',
          item.quantity,
          prev,
          prod.stockQuantity,
          `Deducted for Order ${orderNumber}`,
          orderNumber
        );
      }
    }
    setStorage('smart_ecom_products', products);

    // 2. Create Order
    const newOrder = {
      id: Date.now(),
      orderNumber,
      userId: user.id,
      customerName: payload.customerName || user.fullName,
      customerEmail: payload.customerEmail || user.email,
      customerPhone: payload.customerPhone || user.phone || '+1 (555) 234-5678',
      shippingAddress: payload.shippingAddress,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country || 'United States',
      subtotal: cart.subtotal,
      shippingFee: cart.shippingFee,
      totalAmount: cart.totalAmount,
      paymentMethod: payload.paymentMethod || 'DEMO_CARD',
      paymentStatus: payload.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      createdAt: now.toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: now.toISOString().replace('T', ' ').substring(0, 19),
      items: cart.items.map((it, idx) => ({
        id: Date.now() + idx,
        orderId: orderNumber,
        productId: it.productId,
        productName: it.name,
        unitPrice: it.price,
        quantity: it.quantity,
        subtotal: it.subtotal
      }))
    };

    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    orders.unshift(newOrder);
    setStorage('smart_ecom_orders', orders);

    // 3. Create Payment record
    const payments = getStorage('smart_ecom_payments', INITIAL_PAYMENTS);
    const newPayment = {
      id: Date.now(),
      transactionId: txnId,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      userId: user.id,
      amount: newOrder.totalAmount,
      paymentMethod: newOrder.paymentMethod,
      cardLast4: payload.paymentMethod === 'DEMO_CARD' ? (payload.cardDetails?.cardNumber?.slice(-4) || '4242') : null,
      paymentStatus: newOrder.paymentStatus,
      paymentDate: newOrder.createdAt
    };
    payments.unshift(newPayment);
    setStorage('smart_ecom_payments', payments);

    // 4. Create Invoice record
    const invoices = getStorage('smart_ecom_invoices', INITIAL_INVOICES);
    const newInvoice = {
      id: Date.now(),
      invoiceNumber,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      issueDate: now.toISOString().slice(0, 10),
      dueDate: now.toISOString().slice(0, 10),
      totalAmount: newOrder.totalAmount,
      status: 'Issued'
    };
    invoices.unshift(newInvoice);
    setStorage('smart_ecom_invoices', invoices);

    // 5. Clear Cart
    this.clearCart();

    return {
      order: newOrder,
      invoice: newInvoice,
      payment: newPayment
    };
  }

  static getOrders(params = {}) {
    this.init();
    let orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    if (params.userId) {
      orders = orders.filter(o => o.userId === Number(params.userId));
    }
    if (params.status && params.status !== 'ALL') {
      orders = orders.filter(o => o.orderStatus.toLowerCase() === params.status.toLowerCase());
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      orders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return orders;
  }

  static getOrderById(id) {
    this.init();
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    const order = orders.find(o => String(o.id) === String(id) || o.orderNumber === id);
    if (!order) return null;

    const payments = getStorage('smart_ecom_payments', INITIAL_PAYMENTS);
    const payment = payments.find(p => p.orderId === order.id || p.orderNumber === order.orderNumber) || {
      transactionId: `TXN-${order.orderNumber}`,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentDate: order.createdAt
    };

    return { order, payment };
  }

  static cancelOrder(orderId, reason) {
    this.init();
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    const order = orders.find(o => String(o.id) === String(orderId) || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
      throw new Error(`Cannot cancel order in "${order.orderStatus}" status.`);
    }

    order.orderStatus = 'Cancelled';
    order.paymentStatus = 'Refunded';
    order.cancelReason = reason || 'Customer requested cancellation';
    order.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStorage('smart_ecom_orders', orders);

    // Restore stock
    const products = this.getProductsRaw();
    if (order.items) {
      for (const item of order.items) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const prev = prod.stockQuantity;
          prod.stockQuantity += item.quantity;
          this.logInventoryMovement(
            prod.id,
            prod.name,
            'ORDER_CANCEL_RESTORE',
            item.quantity,
            prev,
            prod.stockQuantity,
            `Restored from cancelled Order ${order.orderNumber}`
          );
        }
      }
      setStorage('smart_ecom_products', products);
    }

    return order;
  }

  static updateOrderStatus(orderId, newStatus, newPayStatus) {
    this.init();
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    const order = orders.find(o => String(o.id) === String(orderId) || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    if (newStatus) order.orderStatus = newStatus;
    if (newPayStatus) order.paymentStatus = newPayStatus;
    order.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStorage('smart_ecom_orders', orders);
    return order;
  }

  // --- INVOICE ---
  static getInvoiceByOrderId(orderId) {
    this.init();
    const orderData = this.getOrderById(orderId);
    if (!orderData || !orderData.order) throw new Error('Order not found');

    const invoices = getStorage('smart_ecom_invoices', INITIAL_INVOICES);
    let invoice = invoices.find(inv => inv.orderId === orderData.order.id || inv.orderNumber === orderData.order.orderNumber);
    if (!invoice) {
      invoice = {
        invoiceNumber: `INV-${orderData.order.orderNumber}`,
        orderId: orderData.order.id,
        issueDate: orderData.order.createdAt.slice(0, 10),
        dueDate: orderData.order.createdAt.slice(0, 10),
        totalAmount: orderData.order.totalAmount,
        status: 'Issued'
      };
    }

    return {
      order: orderData.order,
      invoice,
      store: {
        name: 'Smart E-Commerce Platform',
        address: '100 University Ave, Tech Park',
        city: 'San Francisco, CA 94107',
        email: 'support@smartecom.com',
        phone: '+1 (800) 555-0199',
        taxId: 'US-EIN-987654321'
      }
    };
  }

  // --- RETURNS & REFUNDS ---
  static requestReturn({ orderId, productId, reason, notes }) {
    this.init();
    const orderData = this.getOrderById(orderId);
    if (!orderData || !orderData.order) throw new Error('Order not found');
    const order = orderData.order;

    const user = this.getCurrentUser() || INITIAL_USERS[1];
    const product = this.getProductById(productId) || { name: 'Item' };

    const returnNumber = `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReturn = {
      id: Date.now(),
      returnNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: user.id,
      productId: Number(productId),
      productName: product.name,
      reason,
      notes: notes || '',
      status: 'Requested',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    const returns = getStorage('smart_ecom_returns', INITIAL_RETURNS);
    returns.unshift(newReturn);
    setStorage('smart_ecom_returns', returns);
    return newReturn;
  }

  static getReturns(statusFilter) {
    this.init();
    let returns = getStorage('smart_ecom_returns', INITIAL_RETURNS);
    if (statusFilter && statusFilter !== 'ALL') {
      returns = returns.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return returns;
  }

  static updateReturnStatus(returnId, status, adminNotes) {
    this.init();
    const returns = getStorage('smart_ecom_returns', INITIAL_RETURNS);
    const ret = returns.find(r => r.id === Number(returnId));
    if (!ret) throw new Error('Return request not found');

    ret.status = status;
    if (adminNotes) ret.adminNotes = adminNotes;
    ret.updatedAt = new Date().toISOString();
    setStorage('smart_ecom_returns', returns);

    // If approved, automatically queue refund
    if (status === 'Approved') {
      const refunds = getStorage('smart_ecom_refunds', INITIAL_REFUNDS);
      const exists = refunds.find(rf => rf.returnId === ret.id);
      if (!exists) {
        const orderData = this.getOrderById(ret.orderId);
        const order = orderData ? orderData.order : null;
        const item = order && order.items ? order.items.find(it => it.productId === ret.productId) : null;
        const refundAmount = item ? item.subtotal : 99.99;

        const newRefund = {
          id: Date.now(),
          refundNumber: `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          orderId: ret.orderId,
          orderNumber: ret.orderNumber || (order ? order.orderNumber : `ORD-${ret.orderId}`),
          returnId: ret.id,
          userId: ret.userId,
          amount: refundAmount,
          reason: ret.reason,
          status: 'Pending',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        refunds.unshift(newRefund);
        setStorage('smart_ecom_refunds', refunds);
      }
    }

    return ret;
  }

  static getRefunds(statusFilter) {
    this.init();
    let refunds = getStorage('smart_ecom_refunds', INITIAL_REFUNDS);
    if (statusFilter && statusFilter !== 'ALL') {
      refunds = refunds.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return refunds;
  }

  static processRefund(refundId) {
    this.init();
    const refunds = getStorage('smart_ecom_refunds', INITIAL_REFUNDS);
    const ref = refunds.find(r => r.id === Number(refundId));
    if (!ref) throw new Error('Refund record not found');

    ref.status = 'Completed';
    ref.processedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStorage('smart_ecom_refunds', refunds);

    // Restock product
    const returns = getStorage('smart_ecom_returns', INITIAL_RETURNS);
    const ret = returns.find(r => r.id === ref.returnId);
    if (ret) {
      const products = this.getProductsRaw();
      const prod = products.find(p => p.id === ret.productId);
      if (prod) {
        const prev = prod.stockQuantity;
        prod.stockQuantity += 1;
        setStorage('smart_ecom_products', products);
        this.logInventoryMovement(
          prod.id,
          prod.name,
          'RETURN_RESTORE',
          1,
          prev,
          prod.stockQuantity,
          `Restocked from processed refund ${ref.refundNumber}`
        );
      }
    }

    return ref;
  }

  // --- INVENTORY AUDIT LOGS ---
  static logInventoryMovement(productId, productName, changeType, quantity, previousStock, newStock, reason, refOrder) {
    const logs = getStorage('smart_ecom_inventory_logs', INITIAL_INVENTORY_LOGS);
    const newLog = {
      id: Date.now() + Math.floor(Math.random() * 100),
      productId,
      productName,
      changeType,
      quantity,
      previousStock,
      newStock,
      reason,
      referenceOrderId: refOrder || null,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newLog);
    setStorage('smart_ecom_inventory_logs', logs.slice(0, 200)); // Cap at 200 entries
  }

  static getInventoryLogs(limit = 25) {
    this.init();
    const logs = getStorage('smart_ecom_inventory_logs', INITIAL_INVENTORY_LOGS);
    return logs.slice(0, limit);
  }

  static adjustInventory(productId, quantity, changeType, reason) {
    this.init();
    const products = this.getProductsRaw();
    const prod = products.find(p => p.id === Number(productId));
    if (!prod) throw new Error('Product not found');

    const prev = prod.stockQuantity;
    let next = prev;
    const qty = Number(quantity);

    if (changeType === 'RESTOCK') {
      next = prev + qty;
    } else if (changeType === 'MANUAL_ADJUST') {
      next = qty;
    } else {
      next = Math.max(0, prev - qty);
    }

    prod.stockQuantity = next;
    setStorage('smart_ecom_products', products);

    this.logInventoryMovement(prod.id, prod.name, changeType, Math.abs(next - prev), prev, next, reason || 'Manual adjustment');
    return prod;
  }

  // --- ADMIN DASHBOARD & ANALYTICS ---
  static getDashboardData() {
    this.init();
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    const products = this.getProductsRaw();
    const users = this.getUsers().filter(u => u.role === 'customer');
    const refunds = getStorage('smart_ecom_refunds', INITIAL_REFUNDS);

    const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
    const totalSales = Number(validOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2));
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const lowStockProducts = products.filter(p => p.stockQuantity <= 10).length;
    const totalRefunds = Number(refunds.reduce((sum, r) => sum + r.amount, 0).toFixed(2));

    return {
      metrics: {
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
        lowStockProducts,
        totalRefunds
      },
      recentOrders: orders.slice(0, 5)
    };
  }

  static getAnalyticsData() {
    this.init();
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    const products = this.getProductsRaw();
    const categories = this.getCategories();

    // 1. Sales over time
    const dateMap = {};
    for (const o of orders) {
      if (o.orderStatus !== 'Cancelled') {
        const d = (o.createdAt || '2026-09-01').slice(0, 10);
        dateMap[d] = (dateMap[d] || 0) + o.totalAmount;
      }
    }
    const salesOverTime = Object.keys(dateMap).sort().map(d => ({
      date: d,
      revenue: Number(dateMap[d].toFixed(2))
    }));

    // 2. Orders by status
    const statusCounts = {};
    for (const o of orders) {
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
    }
    const ordersByStatus = Object.keys(statusCounts).map(s => ({
      status: s,
      count: statusCounts[s]
    }));

    // 3. Revenue by category
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const catRev = {};
    for (const o of orders) {
      if (o.orderStatus !== 'Cancelled' && o.items) {
        for (const it of o.items) {
          const prod = products.find(p => p.id === it.productId);
          const cName = prod ? (catMap[prod.categoryId] || 'Other') : 'Other';
          catRev[cName] = (catRev[cName] || 0) + it.subtotal;
        }
      }
    }
    const revenueByCategory = Object.keys(catRev).map(c => ({
      category: c,
      revenue: Number(catRev[c].toFixed(2))
    }));

    // 4. Top selling products
    const prodSales = {};
    for (const o of orders) {
      if (o.orderStatus !== 'Cancelled' && o.items) {
        for (const it of o.items) {
          if (!prodSales[it.productName]) {
            prodSales[it.productName] = { name: it.productName, unitsSold: 0, revenue: 0 };
          }
          prodSales[it.productName].unitsSold += it.quantity;
          prodSales[it.productName].revenue += it.subtotal;
        }
      }
    }
    const topSellingProducts = Object.values(prodSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map(p => ({
        ...p,
        revenue: Number(p.revenue.toFixed(2))
      }));

    return {
      salesOverTime,
      ordersByStatus,
      revenueByCategory,
      topSellingProducts
    };
  }

  // --- SALES REPORTS ---
  static getReports(params = {}) {
    this.init();
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);
    let records = [];

    for (const o of orders) {
      if (o.items) {
        for (const it of o.items) {
          records.push({
            order_id: o.id,
            order_number: o.orderNumber,
            order_date: o.createdAt,
            customer_name: o.customerName,
            customer_email: o.customerEmail,
            product_id: it.productId,
            product_name: it.productName,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            subtotal: it.subtotal,
            payment_method: o.paymentMethod,
            payment_status: o.paymentStatus,
            order_status: o.orderStatus
          });
        }
      }
    }

    // Apply filters
    if (params.orderStatus) {
      records = records.filter(r => r.order_status.toLowerCase() === params.orderStatus.toLowerCase());
    }
    if (params.paymentStatus) {
      records = records.filter(r => r.payment_status.toLowerCase() === params.paymentStatus.toLowerCase());
    }
    if (params.startDate) {
      records = records.filter(r => r.order_date.slice(0, 10) >= params.startDate);
    }
    if (params.endDate) {
      records = records.filter(r => r.order_date.slice(0, 10) <= params.endDate);
    }

    const totalRevenue = Number(records.reduce((sum, r) => sum + r.subtotal, 0).toFixed(2));
    const totalOrders = new Set(records.map(r => r.order_number)).size;
    const totalUnitsSold = records.reduce((sum, r) => sum + r.quantity, 0);
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 15;
    const startIndex = (page - 1) * limit;
    const paginated = records.slice(startIndex, startIndex + limit);

    return {
      summary: {
        totalRevenue,
        totalOrders,
        totalUnitsSold,
        avgOrderValue
      },
      records: paginated,
      pagination: {
        total: records.length,
        page,
        limit,
        totalPages: Math.ceil(records.length / limit) || 1
      }
    };
  }

  // --- CUSTOMERS & PAYMENTS ---
  static getCustomers(params = {}) {
    this.init();
    let customers = this.getUsers().filter(u => u.role === 'customer');
    const orders = getStorage('smart_ecom_orders', INITIAL_ORDERS);

    customers = customers.map(c => {
      const userOrders = orders.filter(o => o.userId === c.id);
      const totalSpend = Number(userOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2));
      return {
        ...c,
        ordersCount: userOrders.length,
        totalSpend
      };
    });

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      customers = customers.filter(c => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }

    return customers;
  }

  static getPayments(params = {}) {
    this.init();
    const payments = getStorage('smart_ecom_payments', INITIAL_PAYMENTS);
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 15;
    const startIndex = (page - 1) * limit;
    return {
      payments: payments.slice(startIndex, startIndex + limit),
      pagination: {
        total: payments.length,
        page,
        limit,
        totalPages: Math.ceil(payments.length / limit) || 1
      }
    };
  }

  // --- MASTER EXPORT DATA ---
  static getTableRecords(tableKey, params = {}) {
    this.init();
    let data = [];
    switch (tableKey) {
      case 'users':
        data = this.getUsers().map(u => ({ id: u.id, email: u.email, fullName: u.fullName, phone: u.phone, role: u.role, createdAt: u.createdAt }));
        break;
      case 'customers':
        data = this.getCustomers();
        break;
      case 'products':
        data = this.getProductsRaw();
        break;
      case 'categories':
        data = this.getCategories();
        break;
      case 'orders':
        data = getStorage('smart_ecom_orders', INITIAL_ORDERS).map(o => ({
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          subtotal: o.subtotal,
          shippingFee: o.shippingFee,
          totalAmount: o.totalAmount,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          createdAt: o.createdAt
        }));
        break;
      case 'order_items':
        data = getStorage('smart_ecom_orders', INITIAL_ORDERS).flatMap(o => (o.items || []).map(it => ({ ...it, orderNumber: o.orderNumber })));
        break;
      case 'payments':
        data = getStorage('smart_ecom_payments', INITIAL_PAYMENTS);
        break;
      case 'invoices':
        data = getStorage('smart_ecom_invoices', INITIAL_INVOICES);
        break;
      case 'inventory':
        data = getStorage('smart_ecom_inventory_logs', INITIAL_INVENTORY_LOGS);
        break;
      case 'returns':
        data = getStorage('smart_ecom_returns', INITIAL_RETURNS);
        break;
      case 'refunds':
        data = getStorage('smart_ecom_refunds', INITIAL_REFUNDS);
        break;
      case 'sales':
        data = this.getReports().records;
        break;
      default:
        data = [];
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 15;
    const startIndex = (page - 1) * limit;

    return {
      records: data.slice(startIndex, startIndex + limit),
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit) || 1
    };
  }

  // --- CLIENT-SIDE FILE DOWNLOAD EXPORTS ---
  static exportTableToCsv(tableKey) {
    const { records, total } = this.getTableRecords(tableKey, { limit: 1000 });
    if (!records || records.length === 0) {
      alert('No records available to export.');
      return;
    }
    const headers = Object.keys(records[0]);
    const csvContent = [
      headers.join(','),
      ...records.map(row => headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartECommerce_${tableKey}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportMasterExcel() {
    // Generate a clean, multi-table CSV master workbook
    const tables = ['products', 'categories', 'orders', 'order_items', 'payments', 'invoices', 'inventory', 'returns', 'refunds', 'sales', 'customers'];
    let fullContent = `SMART E-COMMERCE MASTER DATABASE EXPORT\r\nGenerated: ${new Date().toISOString()}\r\n\r\n`;

    for (const table of tables) {
      const { records } = this.getTableRecords(table, { limit: 1000 });
      if (records && records.length > 0) {
        fullContent += `=== TABLE: ${table.toUpperCase()} (${records.length} Records) ===\r\n`;
        const headers = Object.keys(records[0]);
        fullContent += headers.join(',') + '\r\n';
        for (const row of records) {
          const line = headers.map(h => {
            const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
          }).join(',');
          fullContent += line + '\r\n';
        }
        fullContent += '\r\n\r\n';
      }
    }

    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartECommerce_FullDatabase_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
