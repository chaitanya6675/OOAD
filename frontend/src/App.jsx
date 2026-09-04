import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AdminLayout } from './components/admin/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ProductsPage } from './pages/customer/ProductsPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { ReturnRequestPage } from './pages/customer/ReturnRequestPage';
import { InvoicePage } from './pages/customer/InvoicePage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReturnsPage } from './pages/admin/AdminReturnsPage';
import { AdminRefundsPage } from './pages/admin/AdminRefundsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminDataExportPage } from './pages/admin/AdminDataExportPage';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const getNormalizedPath = () => {
  let p = window.location.pathname;
  if (BASE && p.startsWith(BASE)) {
    p = p.slice(BASE.length);
  }
  if (!p.startsWith('/')) {
    p = '/' + p;
  }
  return p + window.location.search;
};

function Router() {
  const [currentPath, setCurrentPath] = useState(getNormalizedPath());
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    const target = to.startsWith('/') ? to : '/' + to;
    const fullUrl = (BASE || '') + target;
    window.history.pushState({}, '', fullUrl);
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse path and query params
  const [pathname, searchStr] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchStr || '');
  const queryParams = Object.fromEntries(searchParams.entries());

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Initializing Smart E-Commerce Platform...
      </div>
    );
  }

  // --- ADMIN ROUTING ---
  if (pathname.startsWith('/admin')) {
    // Admin login is accessible without authentication
    if (pathname === '/admin/login') {
      if (isAuthenticated && isAdmin) {
        navigate('/admin/dashboard');
        return null;
      }
      return <AdminLoginPage onNavigate={navigate} />;
    }

    // Role Guard: Require Admin
    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
          <h2>Administrator Access Required</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
            Please sign in with administrator credentials to view this section.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/login')}>
            Go to Admin Login
          </button>
        </div>
      );
    }

    // Render Admin Pages inside AdminLayout
    const renderAdminContent = () => {
      if (pathname === '/admin/dashboard' || pathname === '/admin') {
        return <AdminDashboardPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/products') {
        return <AdminProductsPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/categories') {
        return <AdminCategoriesPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/inventory') {
        return <AdminInventoryPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/customers') {
        return <AdminCustomersPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/orders') {
        return <AdminOrdersPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/payments') {
        return <AdminPaymentsPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/returns') {
        return <AdminReturnsPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/refunds') {
        return <AdminRefundsPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/reports') {
        return <AdminReportsPage onNavigate={navigate} />;
      }
      if (pathname === '/admin/export') {
        return <AdminDataExportPage onNavigate={navigate} />;
      }
      return <AdminDashboardPage onNavigate={navigate} />;
    };

    return (
      <AdminLayout currentPath={pathname} onNavigate={navigate}>
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // --- CUSTOMER ROUTING ---
  const renderCustomerContent = () => {
    // 1. Home
    if (pathname === '/' || pathname === '') {
      return <HomePage onNavigate={navigate} />;
    }

    // 2. Products Catalog
    if (pathname === '/products') {
      return <ProductsPage onNavigate={navigate} queryParams={queryParams} />;
    }

    // 3. Product Details
    const productMatch = pathname.match(/^\/products\/(\d+)$/);
    if (productMatch) {
      return <ProductDetailPage productId={productMatch[1]} onNavigate={navigate} />;
    }

    // 4. Categories
    if (pathname === '/categories') {
      return <CategoriesPage onNavigate={navigate} />;
    }

    // 5. Cart
    if (pathname === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    // 6. Checkout
    if (pathname === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    // 7. Order Success
    const successMatch = pathname.match(/^\/order-success\/(\d+)$/);
    if (successMatch) {
      return <OrderSuccessPage orderId={successMatch[1]} onNavigate={navigate} />;
    }

    // 8. My Orders
    if (pathname === '/orders') {
      return <MyOrdersPage onNavigate={navigate} />;
    }

    // 9. Order Details
    const orderDetailMatch = pathname.match(/^\/orders\/(\d+)$/);
    if (orderDetailMatch) {
      return <OrderDetailPage orderId={orderDetailMatch[1]} onNavigate={navigate} />;
    }

    // 10. Profile
    if (pathname === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    // 11. Return Request
    const returnMatch = pathname.match(/^\/returns\/new\/(\d+)$/);
    if (returnMatch) {
      return <ReturnRequestPage orderId={returnMatch[1]} onNavigate={navigate} />;
    }

    // 12. Printable Tax Invoice
    const invoiceMatch = pathname.match(/^\/invoices\/(\d+)$/);
    if (invoiceMatch) {
      return <InvoicePage orderId={invoiceMatch[1]} onNavigate={navigate} />;
    }

    // 13. Login
    if (pathname === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    // 14. Register
    if (pathname === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }

    // Fallback 404
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)' }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          The requested route "{pathname}" does not exist.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Return to Storefront
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar onNavigate={navigate} currentPath={pathname} />
      <div className="main-content">
        {renderCustomerContent()}
      </div>
      <Footer onNavigate={navigate} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router />
      </CartProvider>
    </AuthProvider>
  );
}
