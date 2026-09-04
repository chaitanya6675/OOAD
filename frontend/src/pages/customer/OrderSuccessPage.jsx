import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import ApiClient from '../../services/api';

export const OrderSuccessPage = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      ApiClient.get(`/orders/${orderId}`)
        .then(res => {
          if (res.success && res.order) {
            setOrder(res.order);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  return (
    <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center', maxWidth: 650, margin: '0 auto' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--success-bg)', border: '2px solid var(--success-border)', marginBottom: '1.5rem' }}>
        <CheckCircle2 size={40} color="var(--success)" />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        Thank You for Your Order!
      </h1>

      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Your order has been recorded in the central database. Warehouse stock was automatically updated, and your tax invoice has been generated.
      </p>

      {order && (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Number</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{order.orderNumber}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent)' }}>${order.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span><br/>
              <strong>{order.customerName}</strong><br/>
              {order.shippingAddress}, {order.city}, {order.state} {order.postalCode}
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span><br/>
              <strong>{order.paymentMethod === 'DEMO_CARD' ? 'Demo Card Payment (Paid)' : 'Cash on Delivery (Pending)'}</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{order.orderStatus}</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => onNavigate(`/orders/${orderId}`)}
        >
          <Package size={18} /> View & Track Order
        </button>

        <button 
          className="btn btn-secondary btn-lg"
          onClick={() => onNavigate(`/invoices/${orderId}`)}
        >
          <FileText size={18} /> View Tax Invoice
        </button>

        <button 
          className="btn btn-secondary btn-lg"
          onClick={() => onNavigate('/products')}
        >
          <ShoppingBag size={18} /> Continue Shopping
        </button>
      </div>
    </div>
  );
};
