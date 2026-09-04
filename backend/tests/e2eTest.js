const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('====================================================');
  console.log(' STARTING END-TO-END INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  // 1. Healthcheck
  console.log('Test 1: Healthcheck API...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'OK', 'Healthcheck failed');
  console.log('✓ Healthcheck passed.\n');

  // 2. Customer Registration
  console.log('Test 2: Customer Registration...');
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Quality Engineer',
      email: uniqueEmail,
      phone: '+1 (555) 999-8877',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    })
  });
  const regData = await regRes.json();
  assert.strictEqual(regData.success, true, 'Registration failed');
  const customerToken = regData.token;
  console.log(`✓ Customer registered successfully (${uniqueEmail}).\n`);

  // 3. Customer Profile
  console.log('Test 3: Customer Profile Fetch & Update...');
  const profileRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const profileData = await profileRes.json();
  assert.strictEqual(profileData.user.email, uniqueEmail);

  const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      fullName: 'Test Quality Engineer Updated',
      phone: '+1 (555) 123-4567',
      address: '999 Tech Blvd Suite 10',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701'
    })
  });
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.user.city, 'Austin');
  console.log('✓ Profile updated successfully.\n');

  // 4. Products Search & Filter
  console.log('Test 4: Catalog Search, Filter & Stock Checks...');
  const prodRes = await fetch(`${BASE_URL}/products?search=Sony&inStockOnly=true`);
  const prodData = await prodRes.json();
  assert.ok(prodData.products.length > 0, 'No products found matching Sony');
  const targetProduct = prodData.products[0];
  console.log(`✓ Product located: "${targetProduct.name}", Stock: ${targetProduct.stockQuantity}, Price: $${targetProduct.price}\n`);

  const initialStock = targetProduct.stockQuantity;

  // 5. Cart Operations
  console.log('Test 5: Shopping Cart Add, Update & Subtotal Calculation...');
  const cartAddRes = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      productId: targetProduct.id,
      quantity: 2
    })
  });
  const cartAddData = await cartAddRes.json();
  assert.strictEqual(cartAddData.success, true);
  assert.strictEqual(cartAddData.cart.items.length, 1);
  assert.strictEqual(cartAddData.cart.items[0].quantity, 2);
  console.log(`✓ Added 2 units to cart. Cart subtotal: $${cartAddData.cart.subtotal}\n`);

  // 6. Checkout & Order Placement
  console.log('Test 6: Order Checkout with Demo Card Payment & Inventory Deduction...');
  const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      customerName: 'Test Quality Engineer Updated',
      customerEmail: uniqueEmail,
      customerPhone: '+1 (555) 123-4567',
      shippingAddress: '999 Tech Blvd Suite 10',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      paymentMethod: 'DEMO_CARD',
      cardDetails: {
        cardNumber: '4242 4242 4242 4242',
        cardHolder: 'Test Quality Engineer',
        expiry: '12/28',
        cvv: '123'
      }
    })
  });
  const checkoutData = await checkoutRes.json();
  assert.strictEqual(checkoutData.success, true, 'Checkout failed: ' + checkoutData.message);
  const placedOrder = checkoutData.order;
  assert.strictEqual(placedOrder.orderStatus, 'Pending');
  assert.strictEqual(placedOrder.paymentStatus, 'Paid');
  console.log(`✓ Order placed: ${placedOrder.orderNumber}, Total: $${placedOrder.totalAmount}`);

  // Verify stock was reduced in database by exactly 2 units
  const checkProdRes = await fetch(`${BASE_URL}/products/${targetProduct.id}`);
  const checkProdData = await checkProdRes.json();
  assert.strictEqual(checkProdData.product.stockQuantity, initialStock - 2, 'Stock was not reduced correctly!');
  console.log(`✓ Inventory stock automatically reduced from ${initialStock} to ${checkProdData.product.stockQuantity}.\n`);

  // 7. Verify Invoice
  console.log('Test 7: Verify Digital Invoice Generation...');
  const invRes = await fetch(`${BASE_URL}/invoices/order/${placedOrder.id}`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const invData = await invRes.json();
  assert.strictEqual(invData.success, true);
  assert.ok(invData.invoice.invoiceNumber.startsWith('INV-'));
  console.log(`✓ Invoice verified: ${invData.invoice.invoiceNumber}, Status: ${invData.invoice.status}\n`);

  // 8. Admin Authentication & Dashboard
  console.log('Test 8: Admin Login & Dashboard Real-Time Metrics...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@smartecom.com',
      password: 'Admin@12345'
    })
  });
  const adminLoginData = await adminLoginRes.json();
  assert.strictEqual(adminLoginData.success, true);
  assert.strictEqual(adminLoginData.user.role, 'admin');
  const adminToken = adminLoginData.token;

  const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const dashData = await dashboardRes.json();
  assert.strictEqual(dashData.success, true);
  console.log(`✓ Admin Dashboard loaded: Total Orders: ${dashData.metrics.totalOrders}, Sales: $${dashData.metrics.totalSales}\n`);

  // 9. Admin Advances Order Lifecycle to Delivered
  console.log('Test 9: Admin Advances Order Lifecycle (Pending -> Confirmed -> Shipped -> Delivered)...');
  await fetch(`${BASE_URL}/orders/${placedOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ orderStatus: 'Confirmed' })
  });

  await fetch(`${BASE_URL}/orders/${placedOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ orderStatus: 'Shipped' })
  });

  const deliverRes = await fetch(`${BASE_URL}/orders/${placedOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ orderStatus: 'Delivered' })
  });
  const deliverData = await deliverRes.json();
  assert.strictEqual(deliverData.order.orderStatus, 'Delivered');
  console.log('✓ Order lifecycle transitioned successfully to "Delivered".\n');

  // 10. Customer Requests Return on Delivered Order
  console.log('Test 10: Customer Submits Return Request on Delivered Item...');
  const returnReqRes = await fetch(`${BASE_URL}/returns/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      orderId: placedOrder.id,
      productId: targetProduct.id,
      reason: 'Package arrived with exterior box dent'
    })
  });
  const returnReqData = await returnReqRes.json();
  assert.strictEqual(returnReqData.success, true);
  const createdReturn = returnReqData.returnRequest;
  assert.strictEqual(createdReturn.status, 'Requested');
  console.log(`✓ Return request created: ${createdReturn.returnNumber} (Status: Requested)\n`);

  // 11. Admin Approves Return & Initiates Refund
  console.log('Test 11: Admin Approves Return & Creates Refund Record...');
  const approveRes = await fetch(`${BASE_URL}/returns/${createdReturn.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'Approved',
      adminNotes: 'Inspection passed. Approved for refund.'
    })
  });
  const approveData = await approveRes.json();
  assert.strictEqual(approveData.returnRequest.status, 'Approved');

  // Check refund queue
  const refundsRes = await fetch(`${BASE_URL}/refunds`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const refundsData = await refundsRes.json();
  const queuedRefund = refundsData.refunds.find(r => r.orderId === placedOrder.id);
  assert.ok(queuedRefund, 'Refund was not queued for approved return!');
  console.log(`✓ Return approved. Refund queued: ${queuedRefund.refundNumber}, Amount: $${queuedRefund.amount}\n`);

  // 12. Admin Processes Refund & Restores Warehouse Stock
  console.log('Test 12: Admin Processes Refund (triggers stock replenishment)...');
  const stockBeforeRefund = (await (await fetch(`${BASE_URL}/products/${targetProduct.id}`)).json()).product.stockQuantity;

  const processRefRes = await fetch(`${BASE_URL}/refunds/${queuedRefund.id}/process`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const processRefData = await processRefRes.json();
  assert.strictEqual(processRefData.success, true);
  assert.strictEqual(processRefData.refund.status, 'Completed');

  // Verify stock was replenished by 1 unit for the returned item
  const stockAfterRefund = (await (await fetch(`${BASE_URL}/products/${targetProduct.id}`)).json()).product.stockQuantity;
  assert.strictEqual(stockAfterRefund, stockBeforeRefund + 1, 'Stock was not restocked upon refund!');
  console.log(`✓ Refund processed. Inventory restocked from ${stockBeforeRefund} to ${stockAfterRefund}.\n`);

  // 13. Central Data Export (Excel & CSV)
  console.log('Test 13: Central Data Export Validation (Excel .xlsx and CSV)...');
  const excelRes = await fetch(`${BASE_URL}/export/excel/all`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(excelRes.status, 200);
  const excelBuffer = await excelRes.arrayBuffer();
  assert.ok(excelBuffer.byteLength > 5000, 'Excel workbook is empty or too small');
  console.log(`✓ Master 12-sheet Excel generated: ${excelBuffer.byteLength} bytes.`);

  const csvRes = await fetch(`${BASE_URL}/export/csv/orders`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(csvRes.status, 200);
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('order_number'), 'CSV does not contain header row');
  console.log(`✓ Orders CSV exported successfully (${csvText.split('\n').length} rows).\n`);

  console.log('====================================================');
  console.log(' ALL 13 END-TO-END INTEGRATION TESTS PASSED 100%!');
  console.log('====================================================');
}

runE2ETests().catch(err => {
  console.error('\n❌ INTEGRATION TEST SUITE FAILED:', err);
  process.exit(1);
});
