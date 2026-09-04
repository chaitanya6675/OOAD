import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, XCircle, RotateCcw, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import ApiClient from '../../services/api';
import { OrderTracker } from '../../components/customer/OrderTracker';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const OrderDetailPage = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get(`/orders/${orderId}`);
      if (res.success && res.order) {
        setOrder(res.order);
        setPayment(res.payment);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error loading order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please specify a reason for cancellation.');
      return;
    }

    try {
      setCancelling(true);
      const res = await ApiClient.post(`/orders/${orderId}/cancel`, { reason: cancelReason });
      if (res.success) {
        setSuccessMsg('Order cancelled successfully. Inventory has been restored.');
        setCancelModalOpen(false);
        fetchOrderDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Retrieving order status from central database...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => onNavigate('/orders')}>
          Return to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <button 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => onNavigate('/orders')}
      >
        <ArrowLeft size={16} /> Back to My Orders
      </button>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {/* Header Summary */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{order.orderNumber}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate(`/invoices/${order.id}`)}
            >
              <FileText size={16} /> View Tax Invoice
            </button>

            {/* Cancel Button: Allowed only when Pending */}
            {order.canCancel && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setCancelModalOpen(true)}
              >
                <XCircle size={16} /> Cancel Order
              </button>
            )}

            {/* Return Button: Allowed only when Delivered */}
            {order.canReturn && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate(`/returns/new/${order.id}`)}
              >
                <RotateCcw size={16} /> Request Return
              </button>
            )}
          </div>
        </div>

        {/* Live Order Tracker */}
        <OrderTracker orderStatus={order.orderStatus} cancelReason={order.cancelReason} />
      </div>

      {/* Grid: Order Items & Delivery / Payment Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Order Items Table */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Ordered Items ({order.items?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items?.map((it, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.75rem'
                }}
              >
                <img
                  src={it.productImage || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                  alt={it.productName}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />

                <div style={{ flex: 1 }}>
                  <h4 
                    style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => onNavigate(`/products/${it.productId}`)}
                  >
                    {it.productName}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ${it.unitPrice.toFixed(2)} &times; {it.quantity}
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  ${it.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>${order.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping Fee:</span>
              <span style={{ fontWeight: 600 }}>
                {order.shippingFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem' }}>
              <span style={{ fontWeight: 700 }}>Total:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)' }}>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shipping Address */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              <Truck size={18} color="var(--accent)" /> Delivery Address
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              <strong>{order.customerName}</strong><br/>
              {order.shippingAddress}<br/>
              {order.city}, {order.state} {order.postalCode}<br/>
              {order.country || 'United States'}<br/>
              Email: {order.customerEmail}<br/>
              Phone: {order.customerPhone || 'N/A'}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              <CreditCard size={18} color="var(--accent)" /> Payment Details
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong>{order.paymentMethod === 'DEMO_CARD' ? 'Demo Card Payment' : 'Cash on Delivery'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              {payment && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                  <code style={{ fontSize: '0.75rem' }}>{payment.transactionId}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Are you sure you want to cancel order <strong>{order.orderNumber}</strong>? The order status will become "Cancelled" and items will be restocked in the warehouse immediately.
        </p>

        <div className="form-group">
          <label className="form-label">Please state your reason for cancellation *</label>
          <select
            className="form-select"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          >
            <option value="">Select cancellation reason...</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Found a better price elsewhere">Found a better price elsewhere</option>
            <option value="Delivery address entered incorrectly">Delivery address entered incorrectly</option>
            <option value="Need to change payment method">Need to change payment method</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setCancelModalOpen(false)}>
            Close
          </button>
          <button 
            className="btn btn-danger"
            disabled={cancelling || !cancelReason}
            onClick={handleCancelOrder}
          >
            {cancelling ? 'Cancelling & Restocking...' : 'Confirm Cancellation'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
