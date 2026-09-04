/**
 * Self-Contained In-Browser API Client
 * Emulates the full backend REST API using client-side DbStore (localStorage + initial seeds)
 * Completely eliminates backend dependency on GitHub Pages with 0 network errors.
 */

import { DbStore } from './dbStore.js';

// Ensure storage is initialized on load
DbStore.init();

class ApiClient {
  static getToken() {
    return localStorage.getItem('smart_ecom_token');
  }

  // --- CSV / EXCEL DOWNLOAD HELPERS ---
  static downloadTableCsv(tableKey) {
    DbStore.exportTableToCsv(tableKey);
  }

  static downloadMasterExcel() {
    DbStore.exportMasterExcel();
  }

  // --- GET ROUTER ---
  static async get(endpoint, params = {}) {
    // Artificial micro-delay for realistic UI feedback
    await new Promise(r => setTimeout(r, 40));

    try {
      const cleanEndpoint = endpoint.split('?')[0];

      // 1. Auth: /auth/me
      if (cleanEndpoint === '/auth/me') {
        const user = DbStore.getCurrentUser();
        if (user) {
          return { success: true, user };
        }
        return { success: false, message: 'Not authenticated' };
      }

      // 2. Categories: /categories
      if (cleanEndpoint === '/categories') {
        const categories = DbStore.getCategories();
        return { success: true, categories };
      }

      // 3. Single Product: /products/:id
      const prodMatch = cleanEndpoint.match(/^\/products\/(\d+)$/);
      if (prodMatch) {
        const product = DbStore.getProductById(prodMatch[1]);
        if (!product) throw new Error('Product not found');
        return { success: true, product };
      }

      // 4. Products List: /products
      if (cleanEndpoint === '/products') {
        const res = DbStore.getProducts(params);
        return { success: true, ...res };
      }

      // 5. Shopping Cart: /cart
      if (cleanEndpoint === '/cart') {
        const cart = DbStore.getCart();
        return { success: true, cart };
      }

      // 6. My Orders: /orders/my-orders
      if (cleanEndpoint === '/orders/my-orders') {
        const user = DbStore.getCurrentUser();
        const orders = DbStore.getOrders({ userId: user?.id });
        return { success: true, orders };
      }

      // 7. Single Order: /orders/:id
      const orderMatch = cleanEndpoint.match(/^\/orders\/([^/]+)$/);
      if (orderMatch && cleanEndpoint !== '/orders/my-orders') {
        const data = DbStore.getOrderById(orderMatch[1]);
        if (!data || !data.order) throw new Error('Order not found');
        return { success: true, ...data };
      }

      // 8. Admin Orders List: /orders
      if (cleanEndpoint === '/orders') {
        const orders = DbStore.getOrders(params);
        const limit = Number(params.limit) || orders.length;
        return { success: true, orders: orders.slice(0, limit), total: orders.length };
      }

      // 9. Invoice: /invoices/order/:orderId
      const invMatch = cleanEndpoint.match(/^\/invoices\/order\/([^/]+)$/);
      if (invMatch) {
        const invData = DbStore.getInvoiceByOrderId(invMatch[1]);
        return { success: true, ...invData };
      }

      // 10. Returns: /returns
      if (cleanEndpoint === '/returns') {
        const returns = DbStore.getReturns(params.status);
        return { success: true, returns, total: returns.length };
      }

      // 11. Refunds: /refunds
      if (cleanEndpoint === '/refunds') {
        const refunds = DbStore.getRefunds(params.status);
        return { success: true, refunds, total: refunds.length };
      }

      // 12. Inventory overview & logs
      if (cleanEndpoint === '/inventory') {
        const products = DbStore.getProductsRaw();
        return { success: true, inventory: products, total: products.length };
      }
      if (cleanEndpoint === '/inventory/logs') {
        const logs = DbStore.getInventoryLogs(params.limit || 25);
        return { success: true, logs, total: logs.length };
      }

      // 13. Admin Dashboard & Analytics
      if (cleanEndpoint === '/admin/dashboard') {
        const dash = DbStore.getDashboardData();
        return { success: true, ...dash };
      }
      if (cleanEndpoint === '/admin/analytics') {
        const analytics = DbStore.getAnalyticsData();
        return { success: true, analytics };
      }
      if (cleanEndpoint === '/admin/reports') {
        const rep = DbStore.getReports(params);
        return { success: true, ...rep };
      }
      if (cleanEndpoint === '/admin/customers') {
        const customers = DbStore.getCustomers(params);
        return { success: true, customers, total: customers.length };
      }

      // 14. Payments
      if (cleanEndpoint === '/payments') {
        const pay = DbStore.getPayments(params);
        return { success: true, ...pay };
      }

      // 15. Export table records: /export/records/:table
      const exportMatch = cleanEndpoint.match(/^\/export\/records\/([^/]+)$/);
      if (exportMatch) {
        const tableData = DbStore.getTableRecords(exportMatch[1], params);
        return { success: true, ...tableData };
      }

      return { success: true };
    } catch (err) {
      console.warn(`[In-Browser API GET ${endpoint} Error]:`, err.message);
      throw err;
    }
  }

  // --- POST ROUTER ---
  static async post(endpoint, body = {}) {
    await new Promise(r => setTimeout(r, 60));

    try {
      const cleanEndpoint = endpoint.split('?')[0];

      // 1. Auth: Login
      if (cleanEndpoint === '/auth/login') {
        const res = DbStore.login(body.email, body.password);
        return { success: true, ...res };
      }

      // 2. Auth: Register
      if (cleanEndpoint === '/auth/register') {
        const res = DbStore.register(body);
        return { success: true, ...res };
      }

      // 3. Cart: Add Item
      if (cleanEndpoint === '/cart/items') {
        const cart = DbStore.addToCart(body.productId, body.quantity || 1);
        return { success: true, cart };
      }

      // 4. Orders: Checkout
      if (cleanEndpoint === '/orders/checkout') {
        const res = DbStore.checkout(body);
        return { success: true, ...res };
      }

      // 5. Orders: Cancel Order
      const cancelMatch = cleanEndpoint.match(/^\/orders\/([^/]+)\/cancel$/);
      if (cancelMatch) {
        const order = DbStore.cancelOrder(cancelMatch[1], body.reason);
        return { success: true, order };
      }

      // 6. Returns: Submit Request
      if (cleanEndpoint === '/returns/request') {
        const returnRecord = DbStore.requestReturn(body);
        return { success: true, returnRecord };
      }

      // 7. Refunds: Process Refund
      const processRefMatch = cleanEndpoint.match(/^\/refunds\/([^/]+)\/process$/);
      if (processRefMatch) {
        const refund = DbStore.processRefund(processRefMatch[1]);
        return { success: true, refund };
      }

      // 8. Inventory: Adjust Stock
      if (cleanEndpoint === '/inventory/adjust') {
        const product = DbStore.adjustInventory(body.productId, body.quantity, body.changeType, body.reason);
        return { success: true, product };
      }

      // 9. Admin: Add Product
      if (cleanEndpoint === '/products') {
        const product = DbStore.saveProduct(body);
        return { success: true, product };
      }

      // 10. Admin: Add Category
      if (cleanEndpoint === '/categories') {
        const category = DbStore.saveCategory(body);
        return { success: true, category };
      }

      return { success: true };
    } catch (err) {
      console.warn(`[In-Browser API POST ${endpoint} Error]:`, err.message);
      throw err;
    }
  }

  // --- PUT ROUTER ---
  static async put(endpoint, body = {}) {
    await new Promise(r => setTimeout(r, 50));

    try {
      const cleanEndpoint = endpoint.split('?')[0];

      // 1. Auth: Profile
      if (cleanEndpoint === '/auth/profile') {
        const user = DbStore.updateProfile(body);
        return { success: true, user };
      }

      // 2. Cart: Update Item
      if (cleanEndpoint === '/cart/items') {
        const cart = DbStore.updateCartItem(body.productId, body.quantity);
        return { success: true, cart };
      }

      // 3. Admin: Update Order Status
      const orderStatusMatch = cleanEndpoint.match(/^\/orders\/([^/]+)\/status$/);
      if (orderStatusMatch) {
        const order = DbStore.updateOrderStatus(orderStatusMatch[1], body.orderStatus, body.paymentStatus);
        return { success: true, order };
      }

      // 4. Admin: Update Return Status
      const returnStatusMatch = cleanEndpoint.match(/^\/returns\/([^/]+)\/status$/);
      if (returnStatusMatch) {
        const returnRecord = DbStore.updateReturnStatus(returnStatusMatch[1], body.status, body.adminNotes);
        return { success: true, returnRecord };
      }

      // 5. Admin: Edit Product
      const prodEditMatch = cleanEndpoint.match(/^\/products\/([^/]+)$/);
      if (prodEditMatch) {
        const product = DbStore.saveProduct({ ...body, id: prodEditMatch[1] });
        return { success: true, product };
      }

      // 6. Admin: Edit Category
      const catEditMatch = cleanEndpoint.match(/^\/categories\/([^/]+)$/);
      if (catEditMatch) {
        const category = DbStore.saveCategory({ ...body, id: catEditMatch[1] });
        return { success: true, category };
      }

      return { success: true };
    } catch (err) {
      console.warn(`[In-Browser API PUT ${endpoint} Error]:`, err.message);
      throw err;
    }
  }

  // --- DELETE ROUTER ---
  static async delete(endpoint) {
    await new Promise(r => setTimeout(r, 40));

    try {
      const cleanEndpoint = endpoint.split('?')[0];

      // 1. Cart: Remove Item
      const cartItemMatch = cleanEndpoint.match(/^\/cart\/items\/([^/]+)$/);
      if (cartItemMatch) {
        const cart = DbStore.removeCartItem(cartItemMatch[1]);
        return { success: true, cart };
      }

      // 2. Cart: Clear
      if (cleanEndpoint === '/cart') {
        const cart = DbStore.clearCart();
        return { success: true, cart };
      }

      // 3. Admin: Delete Product
      const prodDelMatch = cleanEndpoint.match(/^\/products\/([^/]+)$/);
      if (prodDelMatch) {
        DbStore.deleteProduct(prodDelMatch[1]);
        return { success: true, message: 'Product deleted successfully' };
      }

      // 4. Admin: Delete Category
      const catDelMatch = cleanEndpoint.match(/^\/categories\/([^/]+)$/);
      if (catDelMatch) {
        DbStore.deleteCategory(catDelMatch[1]);
        return { success: true, message: 'Category deleted successfully' };
      }

      return { success: true };
    } catch (err) {
      console.warn(`[In-Browser API DELETE ${endpoint} Error]:`, err.message);
      throw err;
    }
  }
}

export default ApiClient;
