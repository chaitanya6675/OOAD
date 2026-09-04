const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('../config/database');

async function seed() {
  console.log('[SEED] Initializing database tables...');
  initDatabase();

  // Check if database is already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (existingUsers > 0) {
    console.log(`[SEED] Database already contains ${existingUsers} users. Skipping seeding.`);
    return;
  }

  console.log('[SEED] Seeding new data...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', salt);

  // Run all seed insertions inside a single transaction
  const seedTxn = db.transaction(() => {
    // 1. INSERT USERS
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const adminId = insertUser.run('admin@smartecom.com', adminPasswordHash, 'System Administrator', '+1 (555) 019-2831', 'admin').lastInsertRowid;
    const cust1Id = insertUser.run('customer@smartecom.com', customerPasswordHash, 'David Harrison', '+1 (555) 234-5678', 'customer').lastInsertRowid;
    const cust2Id = insertUser.run('priya.sharma@example.com', customerPasswordHash, 'Priya Sharma', '+1 (555) 345-6789', 'customer').lastInsertRowid;
    const cust3Id = insertUser.run('alex.miller@example.com', customerPasswordHash, 'Alex Miller', '+1 (555) 456-7890', 'customer').lastInsertRowid;
    const cust4Id = insertUser.run('sarah.chen@example.com', customerPasswordHash, 'Sarah Chen', '+1 (555) 567-8901', 'customer').lastInsertRowid;
    const cust5Id = insertUser.run('michael.brown@example.com', customerPasswordHash, 'Michael Brown', '+1 (555) 678-9012', 'customer').lastInsertRowid;

    // 2. INSERT CUSTOMERS PROFILES
    const insertCustomer = db.prepare(`
      INSERT INTO customers (user_id, address, city, state, postal_code, country)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertCustomer.run(cust1Id, '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States');
    insertCustomer.run(cust2Id, '120 Broadway Apt 4B', 'New York', 'NY', '10006', 'United States');
    insertCustomer.run(cust3Id, '452 Fremont Street', 'San Francisco', 'CA', '94105', 'United States');
    insertCustomer.run(cust4Id, '880 North Michigan Ave', 'Chicago', 'IL', '60611', 'United States');
    insertCustomer.run(cust5Id, '1500 Congress Avenue', 'Austin', 'TX', '78701', 'United States');

    // 3. INSERT CATEGORIES
    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `);

    const cat1 = insertCat.run('Smartphones', 'smartphones', 'Flagship and premium smartphones with cutting-edge displays and cameras.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80').lastInsertRowid;
    const cat2 = insertCat.run('Laptops & Computers', 'laptops-computers', 'High performance ultrabooks, creator laptops, and powerful workstations.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80').lastInsertRowid;
    const cat3 = insertCat.run('Audio & Headphones', 'audio-headphones', 'Audiophile headphones, noise-canceling earbuds, and premium sound gear.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80').lastInsertRowid;
    const cat4 = insertCat.run('Smart Wearables', 'smart-wearables', 'Smartwatches, GPS sports trackers, and fitness monitors.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80').lastInsertRowid;
    const cat5 = insertCat.run('Computer Accessories', 'computer-accessories', 'Ergonomic mice, mechanical keyboards, docks, and productivity tools.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80').lastInsertRowid;
    const cat6 = insertCat.run('Displays & Gadgets', 'displays-gadgets', '4K monitors, high-capacity power banks, chargers, and studio tools.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80').lastInsertRowid;

    // 4. INSERT 25 REALISTIC PRODUCTS
    const productsData = [
      // Category 1: Smartphones
      { code: 'PHN-IP15PM', name: 'Apple iPhone 15 Pro Max 256GB', cat: cat1, price: 1199.99, stock: 18, img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', desc: 'Titanium design with A17 Pro chip, customizable Action button, and 5x Telephoto optical camera system.' },
      { code: 'PHN-SGS24U', name: 'Samsung Galaxy S24 Ultra 512GB', cat: cat1, price: 1299.99, stock: 14, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80', desc: 'Galaxy AI with Circle to Search, 200MP camera, titanium frame, built-in S Pen, and Snapdragon 8 Gen 3.' },
      { code: 'PHN-GZP8PR', name: 'Google Pixel 8 Pro 128GB', cat: cat1, price: 899.99, stock: 12, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80', desc: 'Google Tensor G3, best-in-class computational photography, 6.7-inch Super Actua display, and 7 years of OS updates.' },
      { code: 'PHN-OP125G', name: 'OnePlus 12 512GB Emerald Green', cat: cat1, price: 799.99, stock: 22, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80', desc: 'Snapdragon 8 Gen 3 with 100W SUPERVOOC charging, 4th Gen Hasselblad Camera, and 5400mAh battery.' },

      // Category 2: Laptops & Computers
      { code: 'LAP-MBP16M', name: 'Apple MacBook Pro 16" (M3 Max 36GB)', cat: cat2, price: 3499.00, stock: 8, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', desc: 'M3 Max chip with 14-core CPU, 30-core GPU, Liquid Retina XDR display, up to 22 hours of battery life.' },
      { code: 'LAP-DXPS15', name: 'Dell XPS 15 9530 OLED Touch', cat: cat2, price: 1999.00, stock: 10, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80', desc: '13th Gen Intel Core i7, 3.5K OLED touchscreen, NVIDIA GeForce RTX 4060, CNC machined aluminum chassis.' },
      { code: 'LAP-ROZG14', name: 'ASUS ROG Zephyrus G14 Gaming Laptop', cat: cat2, price: 1599.99, stock: 6, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80', desc: 'AMD Ryzen 9 8945HS, OLED 120Hz display, RTX 4070, ultra-portable aluminum chassis weighing only 1.5kg.' },
      { code: 'LAP-TPX1CB', name: 'Lenovo ThinkPad X1 Carbon Gen 11', cat: cat2, price: 1749.00, stock: 15, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80', desc: 'Intel Evo platform with Core i7, legendary ergonomic keyboard, carbon fiber weave lid, and military-grade durability.' },

      // Category 3: Audio & Headphones
      { code: 'AUD-SNYXM5', name: 'Sony WH-1000XM5 Noise Canceling', cat: cat3, price: 399.99, stock: 25, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80', desc: 'Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, 30-hour battery life, and crystal-clear hands-free calling.' },
      { code: 'AUD-APPPRO', name: 'Apple AirPods Pro (2nd Gen USB-C)', cat: cat3, price: 249.00, stock: 35, img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80', desc: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and MagSafe Charging Case (USB-C).' },
      { code: 'AUD-BQCULT', name: 'Bose QuietComfort Ultra Headphones', cat: cat3, price: 429.00, stock: 16, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', desc: 'Breakthrough spatialized audio for more immersive listening, world-class noise cancellation, and custom tuned sound.' },
      { code: 'AUD-MSHACT', name: 'Marshall Acton III Bluetooth Speaker', cat: cat3, price: 279.99, stock: 9, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', desc: 'Iconic vintage rock design with wide room-filling Marshall signature sound, Bluetooth 5.2, and analog brass control knobs.' },

      // Category 4: Smart Wearables
      { code: 'WRB-AWULT2', name: 'Apple Watch Ultra 2 GPS + Cellular', cat: cat4, price: 799.00, stock: 11, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', desc: 'Rugged 49mm titanium case, 3000 nit display, S9 SiP with Double Tap gesture, precision dual-frequency GPS, and up to 72 hours battery life.' },
      { code: 'WRB-SGW6CL', name: 'Samsung Galaxy Watch 6 Classic 47mm', cat: cat4, price: 399.99, stock: 20, img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80', desc: 'Rotating bezel with stainless steel case, advanced sleep coaching, body composition analysis, and Sapphire Crystal glass.' },
      { code: 'WRB-GFNX7P', name: 'Garmin Fenix 7 Pro Sapphire Solar', cat: cat4, price: 899.99, stock: 4, img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80', desc: 'Multisport GPS smartwatch with built-in LED flashlight, solar charging lens, TopoActive maps, and up to 37 days in smartwatch mode.' },
      { code: 'WRB-FTCHG6', name: 'Fitbit Charge 6 Fitness Tracker', cat: cat4, price: 159.95, stock: 28, img: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&auto=format&fit=crop&q=80', desc: 'Heart rate tracking with Google apps integration, EDA scan for stress tracking, built-in GPS, and 7-day battery life.' },

      // Category 5: Computer Accessories
      { code: 'ACC-MXM3SW', name: 'Logitech MX Master 3S Wireless Mouse', cat: cat5, price: 99.99, stock: 45, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', desc: '8K DPI any-surface sensor, quiet click switches, MagSpeed electromagnetic scrolling, and USB-C quick charge.' },
      { code: 'ACC-KYCK2P', name: 'Keychron K2 Pro Mechanical Keyboard', cat: cat5, price: 119.99, stock: 24, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', desc: 'Wireless 75% compact mechanical keyboard with QMK/VIA programmable keys, hot-swappable switches, and Mac/Windows support.' },
      { code: 'ACC-LGSTMC', name: 'Logitech StreamCam Full HD 1080p', cat: cat5, price: 169.99, stock: 17, img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80', desc: '60 FPS streaming camera with smart autofocus and facial tracking, vertical video support, and dual stereo microphones.' },
      { code: 'ACC-CDTS4D', name: 'CalDigit TS4 Thunderbolt 4 Dock 18-in-1', cat: cat5, price: 399.95, stock: 7, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80', desc: 'Ultimate workstation dock with 98W Power Delivery, 2.5GbE Ethernet, UHS-II SD card readers, and support for dual 6K displays.' },

      // Category 6: Displays & Gadgets
      { code: 'DSP-LG27UG', name: 'LG UltraGear 27" QHD Nano IPS 165Hz', cat: cat6, price: 399.99, stock: 12, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', desc: '2560x1440 Nano IPS 1ms G-SYNC compatible display with HDR400 and ultra-thin bezel for gaming and productivity.' },
      { code: 'DSP-DL32US', name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor', cat: cat6, price: 899.00, stock: 5, img: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600&auto=format&fit=crop&q=80', desc: 'IPS Black technology with 2000:1 contrast ratio, 90W USB-C charging, RJ45 Ethernet pass-through, and 98% DCI-P3 color gamut.' },
      { code: 'GDT-ANK737', name: 'Anker Prime 27650mAh Power Bank (250W)', cat: cat6, price: 179.99, stock: 32, img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80', desc: 'Charges up to 3 devices simultaneously at up to 250W total output with smart digital display showing battery health and wattage.' },
      { code: 'GDT-BLK3IN', name: 'Belkin BoostCharge Pro 3-in-1 MagSafe', cat: cat6, price: 149.99, stock: 21, img: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop&q=80', desc: 'Official 15W fast wireless charging stand for iPhone, Apple Watch Ultra/Series 9, and AirPods simultaneously.' },
      { code: 'GDT-ELGSTM', name: 'Elgato Stream Deck MK.2 Controller', cat: cat6, price: 149.99, stock: 19, img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', desc: '15 customizable LCD keys to control apps, tools, and platforms with tactile one-touch operation for creators.' }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (product_code, name, description, category_id, price, stock_quantity, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertInvLog = db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity, previous_stock, new_stock, reason)
      VALUES (?, 'INITIAL_STOCK', ?, 0, ?, 'Initial inventory seed')
    `);

    const createdProductIds = [];
    for (const p of productsData) {
      const prodInfo = insertProd.run(p.code, p.name, p.desc, p.cat, p.price, p.stock, p.img);
      insertInvLog.run(prodInfo.lastInsertRowid, p.stock, p.stock);
      createdProductIds.push({ id: prodInfo.lastInsertRowid, ...p });
    }

    // 5. INSERT REALISTIC HISTORICAL ORDERS
    const sampleOrders = [
      {
        orderNum: 'ORD-20260810-1042',
        user: cust1Id,
        name: 'David Harrison',
        email: 'customer@smartecom.com',
        phone: '+1 (555) 234-5678',
        addr: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zip: '97477',
        items: [
          { prodId: createdProductIds[8].id, name: createdProductIds[8].name, price: 399.99, qty: 1 }, // Sony XM5
          { prodId: createdProductIds[16].id, name: createdProductIds[16].name, price: 99.99, qty: 1 } // MX Master 3S
        ],
        shipping: 0,
        payMethod: 'DEMO_CARD',
        payStatus: 'Paid',
        orderStatus: 'Delivered',
        date: '2026-08-10 14:20:00'
      },
      {
        orderNum: 'ORD-20260818-2091',
        user: cust2Id,
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+1 (555) 345-6789',
        addr: '120 Broadway Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10006',
        items: [
          { prodId: createdProductIds[0].id, name: createdProductIds[0].name, price: 1199.99, qty: 1 } // iPhone 15 Pro Max
        ],
        shipping: 0,
        payMethod: 'DEMO_CARD',
        payStatus: 'Paid',
        orderStatus: 'Delivered',
        date: '2026-08-18 09:15:00'
      },
      {
        orderNum: 'ORD-20260825-3412',
        user: cust3Id,
        name: 'Alex Miller',
        email: 'alex.miller@example.com',
        phone: '+1 (555) 456-7890',
        addr: '452 Fremont Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        items: [
          { prodId: createdProductIds[4].id, name: createdProductIds[4].name, price: 3499.00, qty: 1 }, // MacBook Pro 16"
          { prodId: createdProductIds[19].id, name: createdProductIds[19].name, price: 399.95, qty: 1 }  // CalDigit TS4
        ],
        shipping: 0,
        payMethod: 'DEMO_CARD',
        payStatus: 'Paid',
        orderStatus: 'Delivered',
        date: '2026-08-25 11:30:00'
      },
      {
        orderNum: 'ORD-20260901-4821',
        user: cust4Id,
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        phone: '+1 (555) 567-8901',
        addr: '880 North Michigan Ave',
        city: 'Chicago',
        state: 'IL',
        zip: '60611',
        items: [
          { prodId: createdProductIds[12].id, name: createdProductIds[12].name, price: 799.00, qty: 1 }, // Apple Watch Ultra 2
          { prodId: createdProductIds[23].id, name: createdProductIds[23].name, price: 149.99, qty: 1 }  // Belkin 3-in-1
        ],
        shipping: 0,
        payMethod: 'DEMO_CARD',
        payStatus: 'Paid',
        orderStatus: 'Shipped',
        date: '2026-09-01 16:45:00'
      },
      {
        orderNum: 'ORD-20260903-5120',
        user: cust5Id,
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+1 (555) 678-9012',
        addr: '1500 Congress Avenue',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        items: [
          { prodId: createdProductIds[1].id, name: createdProductIds[1].name, price: 1299.99, qty: 1 } // Galaxy S24 Ultra
        ],
        shipping: 0,
        payMethod: 'COD',
        payStatus: 'Pending',
        orderStatus: 'Confirmed',
        date: '2026-09-03 10:10:00'
      },
      {
        orderNum: 'ORD-20260904-6301',
        user: cust1Id,
        name: 'David Harrison',
        email: 'customer@smartecom.com',
        phone: '+1 (555) 234-5678',
        addr: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zip: '97477',
        items: [
          { prodId: createdProductIds[9].id, name: createdProductIds[9].name, price: 249.00, qty: 1 },  // AirPods Pro
          { prodId: createdProductIds[22].id, name: createdProductIds[22].name, price: 179.99, qty: 1 } // Anker Power Bank
        ],
        shipping: 0,
        payMethod: 'DEMO_CARD',
        payStatus: 'Paid',
        orderStatus: 'Pending',
        date: '2026-09-04 18:30:00'
      }
    ];

    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, state, postal_code, country,
        subtotal, shipping_fee, total_amount,
        payment_method, payment_status, order_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'United States', ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOrderItemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertPaymentStmt = db.prepare(`
      INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, card_last4, payment_status, payment_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertInvoiceStmt = db.prepare(`
      INSERT INTO invoices (invoice_number, order_id, issue_date, due_date, total_amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'Issued', ?)
    `);

    const createdOrders = [];

    for (let i = 0; i < sampleOrders.length; i++) {
      const so = sampleOrders[i];
      const subtotal = so.items.reduce((sum, it) => sum + (it.price * it.qty), 0);
      const total = subtotal + so.shipping;

      const orderInfo = insertOrderStmt.run(
        so.orderNum,
        so.user,
        so.name,
        so.email,
        so.phone,
        so.addr,
        so.city,
        so.state,
        so.zip,
        subtotal,
        so.shipping,
        total,
        so.payMethod,
        so.payStatus,
        so.orderStatus,
        so.date,
        so.date
      );
      const orderId = orderInfo.lastInsertRowid;
      createdOrders.push({ id: orderId, ...so, subtotal, total });

      for (const it of so.items) {
        insertOrderItemStmt.run(orderId, it.prodId, it.name, it.price, it.qty, it.price * it.qty);
      }

      // Add payment
      const txnId = `TXN-20260${i + 8}-${100000 + i * 4532}`;
      insertPaymentStmt.run(
        txnId,
        orderId,
        so.user,
        total,
        so.payMethod,
        so.payMethod === 'DEMO_CARD' ? '4242' : null,
        so.payStatus,
        so.date
      );

      // Add invoice
      const invNum = `INV-20260${i + 8}-${2000 + i * 111}`;
      insertInvoiceStmt.run(invNum, orderId, so.date, so.date, total, so.date);
    }

    // 6. INSERT 1 RETURN REQUEST & 1 COMPLETED REFUND
    // Order 1 has delivered Sony headphones (item prodId 8)
    const order1 = createdOrders[0];
    const retStmt = db.prepare(`
      INSERT INTO returns (return_number, order_id, user_id, product_id, reason, status, admin_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Return 1: Completed with refund
    const ret1Info = retStmt.run(
      'RET-20260814-1001',
      order1.id,
      order1.user,
      order1.items[0].prodId,
      'Comfort fit did not suit head shape',
      'Completed',
      'Return approved and item checked in warehouse.',
      '2026-08-14 11:00:00',
      '2026-08-15 16:00:00'
    );

    const refStmt = db.prepare(`
      INSERT INTO refunds (refund_number, order_id, return_id, user_id, amount, reason, status, processed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    refStmt.run(
      'REF-20260815-5001',
      order1.id,
      ret1Info.lastInsertRowid,
      order1.user,
      order1.items[0].price,
      'Return Approved: Comfort fit did not suit head shape',
      'Completed',
      '2026-08-15 16:00:00',
      '2026-08-15 15:30:00'
    );

    // Return 2: Requested (pending review) on Order 2
    const order2 = createdOrders[1];
    retStmt.run(
      'RET-20260822-2002',
      order2.id,
      order2.user,
      order2.items[0].prodId,
      'Outer package slightly dented in transit',
      'Requested',
      '',
      '2026-08-22 14:15:00',
      '2026-08-22 14:15:00'
    );
  });

  seedTxn();
  console.log('[SEED] Database successfully populated with realistic seed data!');
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('[SEED] Script complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('[SEED ERROR]:', err);
      process.exit(1);
    });
}

module.exports = seed;
