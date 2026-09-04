import React from 'react';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Value Proposition Banners */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.2)', padding: '0.6rem', borderRadius: 8 }}>
              <Truck size={22} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Fast & Free Shipping</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Free delivery on orders over $100</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(22, 163, 74, 0.2)', padding: '0.6rem', borderRadius: 8 }}>
              <RotateCcw size={22} color="#4ade80" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Hassle-Free Returns</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>7-day return & full refund guarantee</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '0.6rem', borderRadius: 8 }}>
              <Lock size={22} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Secure Demo Checkout</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PCI-compliant simulated card payments</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '0.6rem', borderRadius: 8 }}>
              <Headphones size={22} color="#facc15" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Expert Assistance</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Dedicated technical pair support</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem', color: '#fff', marginBottom: '0.75rem' }}>
              <ShoppingCart size={22} color="#60a5fa" />
              <span>Smart</span>E-Commerce
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
              A robust Object-Oriented Sales and Order Management Platform. Built as a comprehensive full-stack capstone project featuring relational inventory control, real order pipelines, and analytical sales tracking.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Quick Catalog</h4>
            <ul className="footer-links">
              <li><a href="/products" onClick={(e) => { e.preventDefault(); onNavigate('/products'); }}>All Products</a></li>
              <li><a href="/products?category=1" onClick={(e) => { e.preventDefault(); onNavigate('/products?category=1'); }}>Smartphones</a></li>
              <li><a href="/products?category=2" onClick={(e) => { e.preventDefault(); onNavigate('/products?category=2'); }}>Laptops & Computers</a></li>
              <li><a href="/products?category=3" onClick={(e) => { e.preventDefault(); onNavigate('/products?category=3'); }}>Audio & Headphones</a></li>
              <li><a href="/products?category=4" onClick={(e) => { e.preventDefault(); onNavigate('/products?category=4'); }}>Smart Wearables</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Customer Service</h4>
            <ul className="footer-links">
              <li><a href="/orders" onClick={(e) => { e.preventDefault(); onNavigate('/orders'); }}>Track Your Order</a></li>
              <li><a href="/orders" onClick={(e) => { e.preventDefault(); onNavigate('/orders'); }}>Returns & Refunds</a></li>
              <li><a href="/profile" onClick={(e) => { e.preventDefault(); onNavigate('/profile'); }}>Account Profile</a></li>
              <li><a href="/cart" onClick={(e) => { e.preventDefault(); onNavigate('/cart'); }}>Shopping Cart</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">System & Admin</h4>
            <ul className="footer-links">
              <li><a href="/admin/login" onClick={(e) => { e.preventDefault(); onNavigate('/admin/login'); }}>Admin Management Portal</a></li>
              <li><a href="/admin/dashboard" onClick={(e) => { e.preventDefault(); onNavigate('/admin/dashboard'); }}>Sales Analytics</a></li>
              <li><a href="/admin/inventory" onClick={(e) => { e.preventDefault(); onNavigate('/admin/inventory'); }}>Inventory Controls</a></li>
              <li><a href="/admin/export" onClick={(e) => { e.preventDefault(); onNavigate('/admin/export'); }}>Excel Database Export</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Smart E-Commerce Platform. OOAD Capstone Project.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Relational SQLite Central DB</span>
            <span>RESTful Node/Express Architecture</span>
            <span>React Vite SPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
