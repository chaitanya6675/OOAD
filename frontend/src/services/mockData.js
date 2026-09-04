// Initial Seed Data for Self-Contained In-Browser Storage

export const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Flagship and premium smartphones with cutting-edge displays and cameras.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    productCount: 4
  },
  {
    id: 2,
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    description: 'High performance ultrabooks, creator laptops, and powerful workstations.',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    productCount: 4
  },
  {
    id: 3,
    name: 'Audio & Headphones',
    slug: 'audio-headphones',
    description: 'Audiophile headphones, noise-canceling earbuds, and premium sound gear.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productCount: 4
  },
  {
    id: 4,
    name: 'Smart Wearables',
    slug: 'smart-wearables',
    description: 'Smartwatches, GPS sports trackers, and fitness monitors.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    productCount: 4
  },
  {
    id: 5,
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    description: 'Ergonomic mice, mechanical keyboards, docks, and productivity tools.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    productCount: 4
  },
  {
    id: 6,
    name: 'Displays & Gadgets',
    slug: 'displays-gadgets',
    description: '4K monitors, high-capacity power banks, chargers, and studio tools.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    productCount: 5
  }
];

export const INITIAL_PRODUCTS = [
  // 1. Smartphones
  {
    id: 1,
    productCode: 'PHN-IP15PM',
    name: 'Apple iPhone 15 Pro Max 256GB',
    description: 'Titanium design with A17 Pro chip, customizable Action button, and 5x Telephoto optical camera system.',
    categoryId: 1,
    categoryName: 'Smartphones',
    price: 1199.99,
    stockQuantity: 18,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:00:00'
  },
  {
    id: 2,
    productCode: 'PHN-SGS24U',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Galaxy AI with Circle to Search, 200MP camera, titanium frame, built-in S Pen, and Snapdragon 8 Gen 3.',
    categoryId: 1,
    categoryName: 'Smartphones',
    price: 1299.99,
    stockQuantity: 14,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:05:00'
  },
  {
    id: 3,
    productCode: 'PHN-GZP8PR',
    name: 'Google Pixel 8 Pro 128GB',
    description: 'Google Tensor G3, best-in-class computational photography, 6.7-inch Super Actua display, and 7 years of OS updates.',
    categoryId: 1,
    categoryName: 'Smartphones',
    price: 899.99,
    stockQuantity: 12,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:10:00'
  },
  {
    id: 4,
    productCode: 'PHN-OP125G',
    name: 'OnePlus 12 512GB Emerald Green',
    description: 'Snapdragon 8 Gen 3 with 100W SUPERVOOC charging, 4th Gen Hasselblad Camera, and 5400mAh battery.',
    categoryId: 1,
    categoryName: 'Smartphones',
    price: 799.99,
    stockQuantity: 22,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:15:00'
  },

  // 2. Laptops & Computers
  {
    id: 5,
    productCode: 'LAP-MBP16M',
    name: 'Apple MacBook Pro 16" (M3 Max 36GB)',
    description: 'M3 Max chip with 14-core CPU, 30-core GPU, Liquid Retina XDR display, up to 22 hours of battery life.',
    categoryId: 2,
    categoryName: 'Laptops & Computers',
    price: 3499.00,
    stockQuantity: 8,
    stockStatus: 'Low Stock',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:20:00'
  },
  {
    id: 6,
    productCode: 'LAP-DXPS15',
    name: 'Dell XPS 15 9530 OLED Touch',
    description: '13th Gen Intel Core i7, 3.5K OLED touchscreen, NVIDIA GeForce RTX 4060, CNC machined aluminum chassis.',
    categoryId: 2,
    categoryName: 'Laptops & Computers',
    price: 1999.00,
    stockQuantity: 10,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:25:00'
  },
  {
    id: 7,
    productCode: 'LAP-ROZG14',
    name: 'ASUS ROG Zephyrus G14 Gaming Laptop',
    description: 'AMD Ryzen 9 8945HS, OLED 120Hz display, RTX 4070, ultra-portable aluminum chassis weighing only 1.5kg.',
    categoryId: 2,
    categoryName: 'Laptops & Computers',
    price: 1599.99,
    stockQuantity: 6,
    stockStatus: 'Low Stock',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:30:00'
  },
  {
    id: 8,
    productCode: 'LAP-TPX1CB',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    description: 'Intel Evo platform with Core i7, legendary ergonomic keyboard, carbon fiber weave lid, and military-grade durability.',
    categoryId: 2,
    categoryName: 'Laptops & Computers',
    price: 1749.00,
    stockQuantity: 15,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:35:00'
  },

  // 3. Audio & Headphones
  {
    id: 9,
    productCode: 'AUD-SNYXM5',
    name: 'Sony WH-1000XM5 Noise Canceling',
    description: 'Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, 30-hour battery life, and crystal-clear hands-free calling.',
    categoryId: 3,
    categoryName: 'Audio & Headphones',
    price: 399.99,
    stockQuantity: 25,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:40:00'
  },
  {
    id: 10,
    productCode: 'AUD-APPPRO',
    name: 'Apple AirPods Pro (2nd Gen USB-C)',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and MagSafe Charging Case (USB-C).',
    categoryId: 3,
    categoryName: 'Audio & Headphones',
    price: 249.00,
    stockQuantity: 35,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:45:00'
  },
  {
    id: 11,
    productCode: 'AUD-BQCULT',
    name: 'Bose QuietComfort Ultra Headphones',
    description: 'Breakthrough spatialized audio for more immersive listening, world-class noise cancellation, and custom tuned sound.',
    categoryId: 3,
    categoryName: 'Audio & Headphones',
    price: 429.00,
    stockQuantity: 16,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:50:00'
  },
  {
    id: 12,
    productCode: 'AUD-MSHACT',
    name: 'Marshall Acton III Bluetooth Speaker',
    description: 'Iconic vintage rock design with wide room-filling Marshall signature sound, Bluetooth 5.2, and analog brass control knobs.',
    categoryId: 3,
    categoryName: 'Audio & Headphones',
    price: 279.99,
    stockQuantity: 9,
    stockStatus: 'Low Stock',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 10:55:00'
  },

  // 4. Smart Wearables
  {
    id: 13,
    productCode: 'WRB-AWULT2',
    name: 'Apple Watch Ultra 2 GPS + Cellular',
    description: 'Rugged 49mm titanium case, 3000 nit display, S9 SiP with Double Tap gesture, precision dual-frequency GPS, and up to 72 hours battery life.',
    categoryId: 4,
    categoryName: 'Smart Wearables',
    price: 799.00,
    stockQuantity: 11,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:00:00'
  },
  {
    id: 14,
    productCode: 'WRB-SGW6CL',
    name: 'Samsung Galaxy Watch 6 Classic 47mm',
    description: 'Rotating bezel with stainless steel case, advanced sleep coaching, body composition analysis, and Sapphire Crystal glass.',
    categoryId: 4,
    categoryName: 'Smart Wearables',
    price: 399.99,
    stockQuantity: 20,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:05:00'
  },
  {
    id: 15,
    productCode: 'WRB-GFNX7P',
    name: 'Garmin Fenix 7 Pro Sapphire Solar',
    description: 'Multisport GPS smartwatch with built-in LED flashlight, solar charging lens, TopoActive maps, and up to 37 days in smartwatch mode.',
    categoryId: 4,
    categoryName: 'Smart Wearables',
    price: 899.99,
    stockQuantity: 4,
    stockStatus: 'Low Stock',
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:10:00'
  },
  {
    id: 16,
    productCode: 'WRB-FTCHG6',
    name: 'Fitbit Charge 6 Fitness Tracker',
    description: 'Heart rate tracking with Google apps integration, EDA scan for stress tracking, built-in GPS, and 7-day battery life.',
    categoryId: 4,
    categoryName: 'Smart Wearables',
    price: 159.95,
    stockQuantity: 28,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:15:00'
  },

  // 5. Computer Accessories
  {
    id: 17,
    productCode: 'ACC-MXM3SW',
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: '8K DPI any-surface sensor, quiet click switches, MagSpeed electromagnetic scrolling, and USB-C quick charge.',
    categoryId: 5,
    categoryName: 'Computer Accessories',
    price: 99.99,
    stockQuantity: 45,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:20:00'
  },
  {
    id: 18,
    productCode: 'ACC-KYCK2P',
    name: 'Keychron K2 Pro Mechanical Keyboard',
    description: 'Wireless 75% compact mechanical keyboard with QMK/VIA programmable keys, hot-swappable switches, and Mac/Windows support.',
    categoryId: 5,
    categoryName: 'Computer Accessories',
    price: 119.99,
    stockQuantity: 24,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:25:00'
  },
  {
    id: 19,
    productCode: 'ACC-LGSTMC',
    name: 'Logitech StreamCam Full HD 1080p',
    description: '60 FPS streaming camera with smart autofocus and facial tracking, vertical video support, and dual stereo microphones.',
    categoryId: 5,
    categoryName: 'Computer Accessories',
    price: 169.99,
    stockQuantity: 17,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:30:00'
  },
  {
    id: 20,
    productCode: 'ACC-CDTS4D',
    name: 'CalDigit TS4 Thunderbolt 4 Dock 18-in-1',
    description: 'Ultimate workstation dock with 98W Power Delivery, 2.5GbE Ethernet, UHS-II SD card readers, and support for dual 6K displays.',
    categoryId: 5,
    categoryName: 'Computer Accessories',
    price: 399.95,
    stockQuantity: 7,
    stockStatus: 'Low Stock',
    imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:35:00'
  },

  // 6. Displays & Gadgets
  {
    id: 21,
    productCode: 'DSP-LG27UG',
    name: 'LG UltraGear 27" QHD Nano IPS 165Hz',
    description: '2560x1440 Nano IPS 1ms G-SYNC compatible display with HDR400 and ultra-thin bezel for gaming and productivity.',
    categoryId: 6,
    categoryName: 'Displays & Gadgets',
    price: 399.99,
    stockQuantity: 12,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:40:00'
  },
  {
    id: 22,
    productCode: 'DSP-DL32US',
    name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    description: 'IPS Black technology with 2000:1 contrast ratio, 90W USB-C charging, RJ45 Ethernet pass-through, and 98% DCI-P3 color gamut.',
    categoryId: 6,
    categoryName: 'Displays & Gadgets',
    price: 899.00,
    stockQuantity: 5,
    stockStatus: 'Low Stock',
    imageUrl: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:45:00'
  },
  {
    id: 23,
    productCode: 'GDT-ANK737',
    name: 'Anker Prime 27650mAh Power Bank (250W)',
    description: 'Charges up to 3 devices simultaneously at up to 250W total output with smart digital display showing battery health and wattage.',
    categoryId: 6,
    categoryName: 'Displays & Gadgets',
    price: 179.99,
    stockQuantity: 32,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:50:00'
  },
  {
    id: 24,
    productCode: 'GDT-BLK3IN',
    name: 'Belkin BoostCharge Pro 3-in-1 MagSafe',
    description: 'Official 15W fast wireless charging stand for iPhone, Apple Watch Ultra/Series 9, and AirPods simultaneously.',
    categoryId: 6,
    categoryName: 'Displays & Gadgets',
    price: 149.99,
    stockQuantity: 21,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 11:55:00'
  },
  {
    id: 25,
    productCode: 'GDT-ELGSTM',
    name: 'Elgato Stream Deck MK.2 Controller',
    description: '15 customizable LCD keys to control apps, tools, and platforms with tactile one-touch operation for creators.',
    categoryId: 6,
    categoryName: 'Displays & Gadgets',
    price: 149.99,
    stockQuantity: 19,
    stockStatus: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    isAvailable: 1,
    createdAt: '2026-08-01 12:00:00'
  }
];

export const INITIAL_USERS = [
  {
    id: 1,
    email: 'admin@smartecom.com',
    fullName: 'System Administrator',
    phone: '+1 (555) 019-2831',
    role: 'admin',
    createdAt: '2026-08-01 09:00:00'
  },
  {
    id: 2,
    email: 'customer@smartecom.com',
    fullName: 'David Harrison',
    phone: '+1 (555) 234-5678',
    role: 'customer',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
    createdAt: '2026-08-02 11:00:00'
  },
  {
    id: 3,
    email: 'priya.sharma@example.com',
    fullName: 'Priya Sharma',
    phone: '+1 (555) 345-6789',
    role: 'customer',
    address: '120 Broadway Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10006',
    country: 'United States',
    createdAt: '2026-08-03 14:30:00'
  },
  {
    id: 4,
    email: 'alex.miller@example.com',
    fullName: 'Alex Miller',
    phone: '+1 (555) 456-7890',
    role: 'customer',
    address: '452 Fremont Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    createdAt: '2026-08-04 16:20:00'
  },
  {
    id: 5,
    email: 'sarah.chen@example.com',
    fullName: 'Sarah Chen',
    phone: '+1 (555) 567-8901',
    role: 'customer',
    address: '880 North Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60611',
    country: 'United States',
    createdAt: '2026-08-05 09:15:00'
  },
  {
    id: 6,
    email: 'michael.brown@example.com',
    fullName: 'Michael Brown',
    phone: '+1 (555) 678-9012',
    role: 'customer',
    address: '1500 Congress Avenue',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'United States',
    createdAt: '2026-08-06 13:45:00'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 1,
    orderNumber: 'ORD-20260810-1042',
    userId: 2,
    customerName: 'David Harrison',
    customerEmail: 'customer@smartecom.com',
    customerPhone: '+1 (555) 234-5678',
    shippingAddress: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
    subtotal: 499.98,
    shippingFee: 0,
    totalAmount: 499.98,
    paymentMethod: 'DEMO_CARD',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdAt: '2026-08-10 14:20:00',
    updatedAt: '2026-08-13 18:00:00',
    items: [
      { id: 1, orderId: 1, productId: 9, productName: 'Sony WH-1000XM5 Noise Canceling', unitPrice: 399.99, quantity: 1, subtotal: 399.99 },
      { id: 2, orderId: 1, productId: 17, productName: 'Logitech MX Master 3S Wireless Mouse', unitPrice: 99.99, quantity: 1, subtotal: 99.99 }
    ]
  },
  {
    id: 2,
    orderNumber: 'ORD-20260818-2091',
    userId: 3,
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '+1 (555) 345-6789',
    shippingAddress: '120 Broadway Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10006',
    country: 'United States',
    subtotal: 1199.99,
    shippingFee: 0,
    totalAmount: 1199.99,
    paymentMethod: 'DEMO_CARD',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdAt: '2026-08-18 09:15:00',
    updatedAt: '2026-08-21 15:30:00',
    items: [
      { id: 3, orderId: 2, productId: 1, productName: 'Apple iPhone 15 Pro Max 256GB', unitPrice: 1199.99, quantity: 1, subtotal: 1199.99 }
    ]
  },
  {
    id: 3,
    orderNumber: 'ORD-20260825-3412',
    userId: 4,
    customerName: 'Alex Miller',
    customerEmail: 'alex.miller@example.com',
    customerPhone: '+1 (555) 456-7890',
    shippingAddress: '452 Fremont Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    subtotal: 3898.95,
    shippingFee: 0,
    totalAmount: 3898.95,
    paymentMethod: 'DEMO_CARD',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdAt: '2026-08-25 11:30:00',
    updatedAt: '2026-08-29 16:00:00',
    items: [
      { id: 4, orderId: 3, productId: 5, productName: 'Apple MacBook Pro 16" (M3 Max 36GB)', unitPrice: 3499.00, quantity: 1, subtotal: 3499.00 },
      { id: 5, orderId: 3, productId: 20, productName: 'CalDigit TS4 Thunderbolt 4 Dock 18-in-1', unitPrice: 399.95, quantity: 1, subtotal: 399.95 }
    ]
  },
  {
    id: 4,
    orderNumber: 'ORD-20260901-4821',
    userId: 5,
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@example.com',
    customerPhone: '+1 (555) 567-8901',
    shippingAddress: '880 North Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60611',
    country: 'United States',
    subtotal: 948.99,
    shippingFee: 0,
    totalAmount: 948.99,
    paymentMethod: 'DEMO_CARD',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    createdAt: '2026-09-01 16:45:00',
    updatedAt: '2026-09-02 10:20:00',
    items: [
      { id: 6, orderId: 4, productId: 13, productName: 'Apple Watch Ultra 2 GPS + Cellular', unitPrice: 799.00, quantity: 1, subtotal: 799.00 },
      { id: 7, orderId: 4, productId: 24, productName: 'Belkin BoostCharge Pro 3-in-1 MagSafe', unitPrice: 149.99, quantity: 1, subtotal: 149.99 }
    ]
  },
  {
    id: 5,
    orderNumber: 'ORD-20260903-5120',
    userId: 6,
    customerName: 'Michael Brown',
    customerEmail: 'michael.brown@example.com',
    customerPhone: '+1 (555) 678-9012',
    shippingAddress: '1500 Congress Avenue',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'United States',
    subtotal: 1299.99,
    shippingFee: 0,
    totalAmount: 1299.99,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    createdAt: '2026-09-03 10:10:00',
    updatedAt: '2026-09-03 10:30:00',
    items: [
      { id: 8, orderId: 5, productId: 2, productName: 'Samsung Galaxy S24 Ultra 512GB', unitPrice: 1299.99, quantity: 1, subtotal: 1299.99 }
    ]
  },
  {
    id: 6,
    orderNumber: 'ORD-20260904-6301',
    userId: 2,
    customerName: 'David Harrison',
    customerEmail: 'customer@smartecom.com',
    customerPhone: '+1 (555) 234-5678',
    shippingAddress: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
    subtotal: 428.99,
    shippingFee: 0,
    totalAmount: 428.99,
    paymentMethod: 'DEMO_CARD',
    paymentStatus: 'Paid',
    orderStatus: 'Pending',
    createdAt: '2026-09-04 18:30:00',
    updatedAt: '2026-09-04 18:30:00',
    items: [
      { id: 9, orderId: 6, productId: 10, productName: 'Apple AirPods Pro (2nd Gen USB-C)', unitPrice: 249.00, quantity: 1, subtotal: 249.00 },
      { id: 10, orderId: 6, productId: 23, productName: 'Anker Prime 27650mAh Power Bank (250W)', unitPrice: 179.99, quantity: 1, subtotal: 179.99 }
    ]
  }
];

export const INITIAL_PAYMENTS = [
  { id: 1, transactionId: 'TXN-20260810-918234', orderId: 1, userId: 2, amount: 499.98, paymentMethod: 'DEMO_CARD', cardLast4: '4242', paymentStatus: 'Paid', paymentDate: '2026-08-10 14:20:00' },
  { id: 2, transactionId: 'TXN-20260818-472910', orderId: 2, userId: 3, amount: 1199.99, paymentMethod: 'DEMO_CARD', cardLast4: '8888', paymentStatus: 'Paid', paymentDate: '2026-08-18 09:15:00' },
  { id: 3, transactionId: 'TXN-20260825-103948', orderId: 3, userId: 4, amount: 3898.95, paymentMethod: 'DEMO_CARD', cardLast4: '1234', paymentStatus: 'Paid', paymentDate: '2026-08-25 11:30:00' },
  { id: 4, transactionId: 'TXN-20260901-582910', orderId: 4, userId: 5, amount: 948.99, paymentMethod: 'DEMO_CARD', cardLast4: '5555', paymentStatus: 'Paid', paymentDate: '2026-09-01 16:45:00' },
  { id: 5, transactionId: 'TXN-20260903-COD001', orderId: 5, userId: 6, amount: 1299.99, paymentMethod: 'COD', cardLast4: null, paymentStatus: 'Pending', paymentDate: '2026-09-03 10:10:00' },
  { id: 6, transactionId: 'TXN-20260904-772184', orderId: 6, userId: 2, amount: 428.99, paymentMethod: 'DEMO_CARD', cardLast4: '4242', paymentStatus: 'Paid', paymentDate: '2026-09-04 18:30:00' }
];

export const INITIAL_INVOICES = [
  { id: 1, invoiceNumber: 'INV-202608-1001', orderId: 1, issueDate: '2026-08-10', dueDate: '2026-08-10', totalAmount: 499.98, status: 'Issued' },
  { id: 2, invoiceNumber: 'INV-202608-1002', orderId: 2, issueDate: '2026-08-18', dueDate: '2026-08-18', totalAmount: 1199.99, status: 'Issued' },
  { id: 3, invoiceNumber: 'INV-202608-1003', orderId: 3, issueDate: '2026-08-25', dueDate: '2026-08-25', totalAmount: 3898.95, status: 'Issued' },
  { id: 4, invoiceNumber: 'INV-202609-1004', orderId: 4, issueDate: '2026-09-01', dueDate: '2026-09-01', totalAmount: 948.99, status: 'Issued' },
  { id: 5, invoiceNumber: 'INV-202609-1005', orderId: 5, issueDate: '2026-09-03', dueDate: '2026-09-03', totalAmount: 1299.99, status: 'Issued' },
  { id: 6, invoiceNumber: 'INV-202609-1006', orderId: 6, issueDate: '2026-09-04', dueDate: '2026-09-04', totalAmount: 428.99, status: 'Issued' }
];

export const INITIAL_RETURNS = [
  {
    id: 1,
    returnNumber: 'RET-20260812-4011',
    orderId: 1,
    userId: 2,
    productId: 17,
    productName: 'Logitech MX Master 3S Wireless Mouse',
    reason: 'Ergonomic shape did not fit my palm',
    status: 'Approved',
    adminNotes: 'Return verified and accepted. Issued store refund.',
    createdAt: '2026-08-12 11:20:00'
  }
];

export const INITIAL_REFUNDS = [
  {
    id: 1,
    refundNumber: 'REF-20260813-9022',
    orderId: 1,
    returnId: 1,
    userId: 2,
    amount: 99.99,
    reason: 'Approved customer return',
    status: 'Completed',
    processedAt: '2026-08-13 14:00:00',
    createdAt: '2026-08-12 16:30:00'
  }
];

export const INITIAL_INVENTORY_LOGS = [
  { id: 1, productId: 9, productName: 'Sony WH-1000XM5 Noise Canceling', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 26, newStock: 25, reason: 'Deducted for Order ORD-20260810-1042', createdAt: '2026-08-10 14:20:00' },
  { id: 2, productId: 17, productName: 'Logitech MX Master 3S Wireless Mouse', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 45, newStock: 44, reason: 'Deducted for Order ORD-20260810-1042', createdAt: '2026-08-10 14:20:00' },
  { id: 3, productId: 17, productName: 'Logitech MX Master 3S Wireless Mouse', changeType: 'RETURN_RESTORE', quantity: 1, previousStock: 44, newStock: 45, reason: 'Restocked from processed refund REF-20260813-9022', createdAt: '2026-08-13 14:00:00' },
  { id: 4, productId: 1, productName: 'Apple iPhone 15 Pro Max 256GB', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 19, newStock: 18, reason: 'Deducted for Order ORD-20260818-2091', createdAt: '2026-08-18 09:15:00' },
  { id: 5, productId: 5, productName: 'Apple MacBook Pro 16" (M3 Max 36GB)', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 9, newStock: 8, reason: 'Deducted for Order ORD-20260825-3412', createdAt: '2026-08-25 11:30:00' },
  { id: 6, productId: 20, productName: 'CalDigit TS4 Thunderbolt 4 Dock 18-in-1', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 8, newStock: 7, reason: 'Deducted for Order ORD-20260825-3412', createdAt: '2026-08-25 11:30:00' },
  { id: 7, productId: 13, productName: 'Apple Watch Ultra 2 GPS + Cellular', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 12, newStock: 11, reason: 'Deducted for Order ORD-20260901-4821', createdAt: '2026-09-01 16:45:00' },
  { id: 8, productId: 24, productName: 'Belkin BoostCharge Pro 3-in-1 MagSafe', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 22, newStock: 21, reason: 'Deducted for Order ORD-20260901-4821', createdAt: '2026-09-01 16:45:00' },
  { id: 9, productId: 2, productName: 'Samsung Galaxy S24 Ultra 512GB', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 15, newStock: 14, reason: 'Deducted for Order ORD-20260903-5120', createdAt: '2026-09-03 10:10:00' },
  { id: 10, productId: 10, productName: 'Apple AirPods Pro (2nd Gen USB-C)', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 36, newStock: 35, reason: 'Deducted for Order ORD-20260904-6301', createdAt: '2026-09-04 18:30:00' },
  { id: 11, productId: 23, productName: 'Anker Prime 27650mAh Power Bank (250W)', changeType: 'ORDER_DEDUCT', quantity: 1, previousStock: 33, newStock: 32, reason: 'Deducted for Order ORD-20260904-6301', createdAt: '2026-09-04 18:30:00' }
];
