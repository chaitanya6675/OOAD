import React from 'react';
import { 
  LayoutDashboard, Package, Grid, Layers, Users, ShoppingCart, 
  CreditCard, RotateCcw, DollarSign, BarChart3, FileSpreadsheet, 
  ExternalLink, LogOut, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = ({ children, currentPath = '/admin/dashboard', onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Grid },
    { label: 'Inventory', path: '/admin/inventory', icon: Layers },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Returns', path: '/admin/returns', icon: RotateCcw },
    { label: 'Refunds', path: '/admin/refunds', icon: DollarSign },
    { label: 'Sales Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Data Export (Excel)', path: '/admin/export', icon: FileSpreadsheet }
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={24} color="#60a5fa" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>Admin Console</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Smart E-Commerce</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate(item.path);
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Sidebar Bottom */}
        <div style={{ marginTop: 'auto', padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/');
            }}
          >
            <ExternalLink size={15} />
            <span>Storefront Home</span>
          </a>

          <button
            onClick={() => { logout(); if (onNavigate) onNavigate('/admin/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};
