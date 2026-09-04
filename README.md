# Smart E-Commerce: Object-Oriented Sales and Order Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-SQLite%20Relational-orange.svg)](https://www.sqlite.org/)
[![OOAD](https://img.shields.io/badge/Architecture-Object--Oriented-darkblue.svg)]()

A complete, production-ready, full-stack e-commerce web application developed for the **Object-Oriented Analysis and Design (OOAD) Capstone Project**.

The platform is an online sales and order management system with an emphasis on **real database-backed inventory tracking, order status lifecycles, demo payment processing, digital invoice generation, returns & refunds processing, and centralized multi-sheet Excel data exports**.

---

## 🌟 Core Highlights & Architectural Features

- **Genuine Human-Designed Aesthetics**: Clean, distraction-free modern e-commerce UI without AI tropes (no purple glowing cards, no unnecessary glassmorphism, no floating widgets). Styled with a curated high-contrast corporate palette (Navy, Slate, Trust Blue, Emerald, Amber).
- **Strict Object-Oriented Architecture**: Clean domain entity models encapsulating business logic (`User`, `Customer`, `Admin`, `Product`, `Category`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Invoice`, `Inventory`, `Return`, `Refund`, `SalesRecord`).
- **Centralized Relational Storage**: Single database file (`backend/database/ecommerce.db`) with active Foreign Key constraints (`PRAGMA foreign_keys = ON;`), transactions, and indexed tables.
- **Atomic Inventory Control**: Placing an order automatically deducts warehouse stock in a database transaction. Cancelling or refunding an order automatically restores stock with an explicit audit log trail.
- **Order Pipeline & Visual Tracking**: Clean 4-step progress tracker (`Pending` → `Confirmed` → `Shipped` → `Delivered`).
- **Demo Payment Module**: Cash on Delivery and Demo Card validation generating unique transaction IDs (`TXN-YYYYMMDD-XXXXXX`).
- **Tax Invoice Engine**: Printable and downloadable digital tax invoices for every order.
- **Complete Return & Refund Lifecycle**: Customers can request returns on delivered items; Admins can approve or reject; Approved returns queue refunds that, when processed, automatically restock items.
- **Executive Admin Analytics**: Real-time KPI summary widgets and 4 dynamic Recharts graphs (Sales over Time, Orders by Status, Revenue by Category, Top Selling Products).
- **Master Excel & CSV Exporter**: Single-click **"Export Complete Database (Excel .xlsx)"** producing a 12-sheet structured Excel workbook, plus table-by-table CSV exports.

---

## 👥 Demo User Credentials

The platform comes pre-seeded with realistic products, categories, sample historical orders, and pre-configured accounts:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@smartecom.com` | `Admin@12345` | Full administrative control, inventory updates, order status management, refunds, analytics, Excel exports |
| **Demo Customer** | `customer@smartecom.com` | `Customer@12345` | Catalog browsing, persistent cart, checkout, order tracking, order cancellation, return requests, invoice downloads |
| **Customer 2** | `priya.sharma@example.com` | `Customer@12345` | Customer operations |
| **Customer 3** | `alex.miller@example.com` | `Customer@12345` | Customer operations |

> *Note: For immediate testing, both the Customer Sign In page (`/login`) and Admin Portal page (`/admin/login`) provide convenient **1-Click Auto-Fill Demo Credentials** buttons.*

---

## 🧱 Object-Oriented Class Structure (OOAD Entities)

```text
├── User (Base class with password hashing and JWT token verification)
│   ├── Customer (Inherits User; address profile, order history aggregation)
│   └── Admin (Inherits User; executive metrics and administrative control)
├── Product (Catalog entity, price calculations, stock status checks)
├── Category (Taxonomy grouping, slug generation, product aggregation)
├── Cart & CartItem (Persistent database shopping cart, quantity controls, stock checks)
├── Order & OrderItem (Order lifecycle state machine, cancellation rules, return eligibility)
├── Payment (Transaction generation, demo card format validation, status transitions)
├── Invoice (Sequential invoice number generator INV-YYYYMM-XXXX, printable tax layout)
├── Inventory & InventoryLog (Stock deduction, restock triggers, audit movement logging)
├── Return (Customer return requests on delivered orders, review decision workflows)
├── Refund (Refund queue processing, automated inventory replenishment)
└── SalesRecord (Analytics aggregator, date/category filtering, sales report generator)
```

---

## 🗄️ Central Database Relational Schema

All application data is centralized in `backend/database/ecommerce.db`:

1. **`users`**: User identity, role-based access (`customer`, `admin`), bcrypt password hash.
2. **`customers`**: Address book (address, city, state, postal code, country) linked to `users.id`.
3. **`categories`**: Product taxonomy (name, slug, description, image_url).
4. **`products`**: Product specifications, price, stock quantity, availability status, linked to `categories.id`.
5. **`inventory_logs`**: Historical movement audit trail (`INITIAL_STOCK`, `ORDER_DEDUCT`, `ORDER_CANCEL_RESTORE`, `RETURN_RESTORE`, `MANUAL_ADJUST`).
6. **`cart_items`**: Persistent shopping cart rows linked to `users.id` and `products.id`.
7. **`orders`**: Order records (unique order number, shipping details, financial totals, order status, payment status).
8. **`order_items`**: Line items snapshot with unit price, quantity, and subtotal linked to `orders.id` and `products.id`.
9. **`payments`**: Payment transaction logs (unique transaction ID, method, card last 4, status, timestamp).
10. **`invoices`**: Digital tax invoice records (unique invoice number, issue date, due date, total amount).
11. **`returns`**: Customer return tickets (unique return number, reason, status, admin notes).
12. **`refunds`**: Processed refunds linked to `orders.id` and `returns.id`.

---

## 📑 Required Pages & Navigation

### Customer Storefront (14 Pages)
1. **Home (`/`)**: Hero promotion, curated categories grid, featured products, new arrivals, value propositions.
2. **Products Catalog (`/products`)**: Real-time search, category filter, price bounds, in-stock toggle, sorting (Price Low/High, Newest, Name A-Z), pagination.
3. **Product Details (`/products/:id`)**: High-res image display, stock indicator, quantity selector bounded by stock, Add to Cart, Buy Now, product specifications.
4. **Categories (`/categories`)**: Visual taxonomy directory with item counts.
5. **Shopping Cart (`/cart`)**: Database-backed cart, quantity controls, stock limit warnings, order summary.
6. **Checkout (`/checkout`)**: Pre-filled address form, payment selection (COD or Demo Card), order submission.
7. **Order Success (`/order-success/:id`)**: Confirmation screen, order reference, links to tracking and invoice.
8. **My Orders (`/orders`)**: Filterable customer order history (All, Pending, Confirmed, Shipped, Delivered, Cancelled).
9. **Order Details & Live Tracker (`/orders/:id`)**: Visual 4-step progress stepper, line items table, order cancellation (active when Pending), return request (active when Delivered).
10. **Customer Profile (`/profile`)**: Account details and default delivery address manager.
11. **Return Request (`/returns/new/:orderId`)**: Item selection, return reason, notes submission.
12. **Tax Invoice (`/invoices/:orderId`)**: Formal printable tax invoice with store details and itemized totals.
13. **Customer Login (`/login`)**: Secure login with 1-click customer demo auto-fill.
14. **Customer Registration (`/register`)**: Registration with field validation and password confirmation.

### Admin Management Console (12 Pages)
15. **Admin Login (`/admin/login`)**: Role-protected portal login with 1-click admin demo auto-fill.
16. **Admin Dashboard (`/admin/dashboard`)**: 8 Real KPI cards + 4 Real Recharts charts (Revenue trends, Orders by status, Category sales, Top products) + Recent orders table.
17. **Product Management (`/admin/products`)**: Data table, search, category filter, Add Product modal, Edit Product modal, Delete confirmation.
18. **Category Management (`/admin/categories`)**: Taxonomy management, Add/Edit/Delete modals.
19. **Inventory Management (`/admin/inventory`)**: Warehouse stock overview, low-stock threshold highlight, manual stock adjustment with audit reasons, audit log viewer.
20. **Customer Management (`/admin/customers`)**: Directory of registered customers with order counts and lifetime spend.
21. **Order Management (`/admin/orders`)**: Complete order list, status filter, search, order pipeline status updater dropdown (`Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled`), order details modal.
22. **Payment Transactions (`/admin/payments`)**: Financial audit trail with transaction IDs and payment statuses.
23. **Return Management (`/admin/returns`)**: Customer return requests queue with Approve and Reject actions.
24. **Refund Management (`/admin/refunds`)**: Process Refund action which automatically restocks returned inventory.
25. **Sales Reports (`/admin/reports`)**: Date range & category filtered revenue calculator, summary statistics, export to CSV and Excel.
26. **Central Data Export / Database Records (`/admin/export`)**: Live 12-tab database table viewer with search/pagination + Master **"Export Complete Database (Excel .xlsx)"** button and per-table CSV downloads.

---

## 📊 Central Excel Export Engine

The application includes an Excel generator built with `exceljs`. 

In the Admin Portal under **Data Export / Database Records** (`/admin/export`):
- Click **"Export Complete Database (Excel .xlsx)"** to download a single workbook (`SmartECommerce_FullDatabase_YYYY-MM-DD.xlsx`) containing **12 distinct, professionally styled worksheets**:
  1. `Users` *(sensitive password hashes omitted)*
  2. `Customers`
  3. `Products`
  4. `Categories`
  5. `Orders`
  6. `Order Items`
  7. `Payments`
  8. `Invoices`
  9. `Inventory Logs`
  10. `Returns`
  11. `Refunds`
  12. `Sales Records`
- Click **"Export Current Table (CSV)"** to download individual comma-separated files for any selected entity.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Lucide-React (Icons), Recharts (Dynamic Analytics Charts), Vanilla CSS Design System.
- **Backend**: Node.js v20+, Express.js 4, better-sqlite3 / sqlite3 (ACID Relational Engine), bcryptjs, jsonwebtoken, exceljs, morgan, cors.
- **Database**: Central SQLite database (`backend/database/ecommerce.db`) with Foreign Keys, WAL mode, transactions, and indices.

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js v18+ or v20+ installed
- npm v9+ installed

### Step 1: Clone or Navigate to Project
```bash
cd "c:\Users\ascr9\Downloads\OOAD CAPSTONE WEBSITE"
```

### Step 2: Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 3: Run the Application
You can run the unified production server or run both in development mode:

#### Option A: Unified Server (Recommended)
The Express backend builds and serves the frontend SPA directly on a single port:
```bash
# From the root directory:
cd backend
node server.js
```
Open your browser at: **`http://localhost:5000`**

#### Option B: Development Mode with Hot Reloading
Run backend on port 5000 and frontend Vite dev server on port 5173:
```bash
# Terminal 1 (Backend):
cd backend
npm run dev

# Terminal 2 (Frontend):
cd frontend
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## 🧪 Automated Testing

An automated integration test suite verifies the full customer and administrator workflow against real database operations:

```bash
cd backend
node tests/e2eTest.js
```

**Test Suite Coverage:**
1. Healthcheck API response verification
2. Customer Registration and JWT token generation
3. Customer Profile retrieval and address updates
4. Product Catalog search, price filter, and in-stock checks
5. Shopping Cart addition, quantity updates, and subtotal calculation
6. Checkout execution with Demo Card payment & automatic warehouse inventory deduction
7. Digital Tax Invoice generation & verification
8. Administrator authentication & dashboard KPI verification
9. Order status pipeline transitions (`Pending` → `Confirmed` → `Shipped` → `Delivered`)
10. Customer return request submission on delivered items
11. Administrator return approval & automatic refund queuing
12. Administrator refund processing with automatic inventory restock
13. Central 12-sheet Excel master workbook generation and CSV export validation

---

## 🌐 Online Deployment Guide

### Deploying to Render / Railway (Full-Stack Unified)
1. Push this repository to GitHub.
2. In Render / Railway, select **"Web Service"** and connect your GitHub repository.
3. Set the build and start commands:
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && node server.js`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by platform)
   - `JWT_SECRET`: *(A secure random 32-character string)*
5. Deploy service. Once deployed, the provided public URL will serve both the frontend storefront and backend APIs globally!

---

## 📜 License & Academic Integrity
Developed as a Capstone Project for Object-Oriented Analysis and Design (OOAD). Code is structured cleanly for academic presentation and real-world commercial reference.
