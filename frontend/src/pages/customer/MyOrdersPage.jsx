import React, { useEffect, useState } from 'react';
import { Package, Calendar, DollarSign, ArrowRight, Clock } from 'lucide-react';
import ApiClient from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

export const MyOrdersPage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      ApiClient.get('/orders/my-orders')
        .then(res => {
          if (res.success) setOrders(res.orders);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Sign In to View Orders</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          Please log in to view your past and active orders.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('/login')}>
          Sign In
        </button>
      </div>
    );
  }

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.orderStatus.toLowerCase() === filter.toLowerCase());

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track and manage your order history and returns
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {['ALL', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your order history from central database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Package size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            {filter === 'ALL' 
              ? "You haven't placed any orders yet." 
              : `You have no orders currently in "${filter}" status.`}
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('/products')}>
            Browse Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card" style={{ padding: '1.25rem' }}>
              {/* Order Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.orderNumber}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PLACED ON</span>
                    <div style={{ fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>

              {/* Order Items Preview */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: 260 }}>
                  {order.items?.slice(0, 4).map((it, idx) => (
                    <img
                      key={idx}
                      src={it.productImage || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                      alt={it.productName}
                      title={`${it.productName} (x${it.quantity})`}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  ))}
                  {order.items?.length > 4 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      +{order.items.length - 4} more
                    </span>
                  )}
                  <div style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate(`/invoices/${order.id}`)}
                  >
                    Invoice
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigate(`/orders/${order.id}`)}
                  >
                    View Details & Track <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
