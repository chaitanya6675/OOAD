import React, { useEffect, useState } from 'react';
import { 
  DollarSign, ShoppingCart, Users, Package, AlertTriangle, 
  CheckCircle, RotateCcw, TrendingUp, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import ApiClient from '../../services/api';
import { StatCard } from '../../components/admin/StatCard';
import { StatusBadge } from '../../components/common/Badge';

export const AdminDashboardPage = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [metricRes, analyticRes, ordersRes] = await Promise.all([
          ApiClient.get('/admin/dashboard'),
          ApiClient.get('/admin/analytics'),
          ApiClient.get('/orders', { limit: 5 })
        ]);

        if (metricRes.success) setMetrics(metricRes.metrics);
        if (analyticRes.success) setAnalytics(analyticRes.analytics);
        if (ordersRes.success) setRecentOrders(ordersRes.orders);
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading dashboard metrics and analytical charts from central database...
      </div>
    );
  }

  const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div>
      {/* Top Welcome Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Executive Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time sales, inventory, order lifecycle, and refund metrics from central SQLite database
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/admin/export')}
          >
            Export All Data (Excel)
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('/admin/products')}
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Total Sales" 
          value={`$${metrics?.totalSales?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`} 
          icon={DollarSign} 
          color="#16a34a" 
          bg="rgba(22, 163, 74, 0.1)" 
        />
        <StatCard 
          title="Total Orders" 
          value={metrics?.totalOrders || 0} 
          icon={ShoppingCart} 
          color="#2563eb" 
          bg="rgba(37, 99, 235, 0.1)" 
        />
        <StatCard 
          title="Registered Customers" 
          value={metrics?.totalUsers || 0} 
          icon={Users} 
          color="#7c3aed" 
          bg="rgba(124, 58, 237, 0.1)" 
        />
        <StatCard 
          title="Total Products" 
          value={metrics?.totalProducts || 0} 
          icon={Package} 
          color="#0284c7" 
          bg="rgba(2, 132, 199, 0.1)" 
        />
        <StatCard 
          title="Pending Orders" 
          value={metrics?.pendingOrders || 0} 
          icon={TrendingUp} 
          color="#d97706" 
          bg="rgba(217, 119, 6, 0.1)" 
        />
        <StatCard 
          title="Delivered Orders" 
          value={metrics?.deliveredOrders || 0} 
          icon={CheckCircle} 
          color="#059669" 
          bg="rgba(5, 150, 105, 0.1)" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={metrics?.lowStockProducts || 0} 
          icon={AlertTriangle} 
          color="#dc2626" 
          bg="rgba(220, 38, 38, 0.1)" 
        />
        <StatCard 
          title="Total Refunds" 
          value={`$${metrics?.totalRefunds?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`} 
          icon={RotateCcw} 
          color="#475569" 
          bg="rgba(71, 85, 105, 0.1)" 
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Sales Revenue Over Time */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Revenue Trends Over Time ($)
          </h3>
          <div style={{ height: 260 }}>
            {analytics?.salesOverTime && analytics.salesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.salesOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No historical sales records to plot.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Orders by Status */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Orders Distribution by Status
          </h3>
          <div style={{ height: 260 }}>
            {analytics?.ordersByStatus && analytics.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {analytics.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No order statuses found.
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Sales by Category */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Revenue by Product Category ($)
          </h3>
          <div style={{ height: 260 }}>
            {analytics?.salesByCategory && analytics.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.salesByCategory} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No category sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Top 5 Best Selling Products */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Top Selling Products by Volume
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((p, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, width: 20, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <img 
                      src={p.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80&auto=format&fit=crop&q=80'} 
                      alt={p.name}
                      style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.product_code} &bull; ${p.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.total_sold} units</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>${p.total_revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                No completed purchases yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Customer Orders</h3>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/admin/orders')}
          >
            Manage All Orders <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>
                    <div>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
                  <td><StatusBadge status={order.paymentStatus} /></td>
                  <td><StatusBadge status={order.orderStatus} /></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate('/admin/orders')}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
