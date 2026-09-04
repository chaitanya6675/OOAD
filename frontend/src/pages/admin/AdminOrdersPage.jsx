import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, Filter, CheckCircle2, FileText } from 'lucide-react';
import ApiClient from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal, Pagination } from '../../components/common/Modal';

export const AdminOrdersPage = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/orders', {
        status: statusFilter,
        search,
        page,
        limit: 15
      });
      if (res.success) {
        setOrders(res.orders);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await ApiClient.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPayStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await ApiClient.put(`/orders/${orderId}/status`, { paymentStatus: newPayStatus });
      if (res.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err) {
      alert(err.message || 'Error updating payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Order Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Process customer orders, advance delivery pipeline, and inspect transactions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {['ALL', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search order number, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Update Order Pipeline</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                  </td>
                  <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
                  <td>
                    <select
                      className="form-select"
                      style={{ height: 32, fontSize: '0.75rem', padding: '0.15rem 0.5rem', width: 110 }}
                      value={order.paymentStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ height: 32, fontSize: '0.8rem', padding: '0.15rem 0.5rem', width: 140, fontWeight: 600 }}
                      value={order.orderStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => viewOrder(order)}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Order Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        maxWidth={700}
      >
        {selectedOrder && (
          <div>
            {/* Meta Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</span>
                <div style={{ fontWeight: 600 }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.customerEmail}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.customerPhone || 'N/A'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shipping Destination</span>
                <div style={{ fontSize: '0.85rem' }}>
                  {selectedOrder.shippingAddress}<br/>
                  {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}<br/>
                  {selectedOrder.country}
                </div>
              </div>
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Line Items ({selectedOrder.items?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto', marginBottom: '1.25rem' }}>
              {selectedOrder.items?.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img 
                      src={it.productImage || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=60&auto=format&fit=crop&q=80'} 
                      alt={it.productName}
                      style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{it.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {it.quantity} &times; ${it.unitPrice.toFixed(2)}</div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '0.9rem' }}>${it.subtotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Method: </span>
                <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                Total: ${selectedOrder.totalAmount.toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setDetailModalOpen(false);
                  onNavigate(`/invoices/${selectedOrder.id}`);
                }}
              >
                <FileText size={16} /> Open Full Tax Invoice
              </button>
              <button className="btn btn-primary" onClick={() => setDetailModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
