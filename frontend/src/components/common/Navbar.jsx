import React, { useState } from 'react';
import { ShoppingCart, User, Search, ShieldCheck, LogOut, Package, Grid, Home, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar = ({ onNavigate, currentPath = '/' }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <a 
          href="/" 
          className="navbar-logo"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
        >
          <ShoppingCart size={24} color="#2563eb" />
          <span>Smart</span>E-Com
        </a>

        {/* Global Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search phones, laptops, audio, accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Navigation Links */}
        <nav className="navbar-links">
          <a 
            href="/" 
            className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
          >
            <Home size={16} /> Home
          </a>

          <a 
            href="/products" 
            className={`nav-link ${currentPath.startsWith('/products') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('/products'); }}
          >
            <Package size={16} /> Products
          </a>

          <a 
            href="/categories" 
            className={`nav-link ${currentPath.startsWith('/categories') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('/categories'); }}
          >
            <Grid size={16} /> Categories
          </a>

          {/* Cart with Live Badge */}
          <a 
            href="/cart" 
            className={`nav-link nav-badge-link ${currentPath === '/cart' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('/cart'); }}
            title="Shopping Cart"
          >
            <ShoppingCart size={19} />
            <span style={{ marginLeft: 4 }}>Cart</span>
            {cart.itemCount > 0 && (
              <span className="badge-count">{cart.itemCount}</span>
            )}
          </a>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <User size={15} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName || user.email}
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div 
                  className="card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: 200,
                    zIndex: 100,
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem 0'
                  }}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Signed in as<br/><strong>{user.email}</strong>
                  </div>

                  <a 
                    href="/profile" 
                    className="admin-nav-item"
                    style={{ color: 'var(--text-main)', border: 'none' }}
                    onClick={(e) => { e.preventDefault(); setUserDropdownOpen(false); onNavigate('/profile'); }}
                  >
                    <User size={15} /> My Profile
                  </a>

                  <a 
                    href="/orders" 
                    className="admin-nav-item"
                    style={{ color: 'var(--text-main)', border: 'none' }}
                    onClick={(e) => { e.preventDefault(); setUserDropdownOpen(false); onNavigate('/orders'); }}
                  >
                    <Package size={15} /> My Orders
                  </a>

                  {isAdmin && (
                    <a 
                      href="/admin/dashboard" 
                      className="admin-nav-item"
                      style={{ color: '#2563eb', fontWeight: 600, border: 'none' }}
                      onClick={(e) => { e.preventDefault(); setUserDropdownOpen(false); onNavigate('/admin/dashboard'); }}
                    >
                      <ShieldCheck size={15} /> Admin Dashboard
                    </a>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}></div>

                  <button 
                    className="admin-nav-item"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', textAlign: 'left' }}
                    onClick={() => { setUserDropdownOpen(false); logout(); onNavigate('/'); }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('/login')}
              >
                Sign In
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('/register')}
              >
                Register
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
