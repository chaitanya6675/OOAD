import React, { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import ApiClient from '../../services/api';

export const ReturnRequestPage = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (orderId) {
      ApiClient.get(`/orders/${orderId}`)
        .then(res => {
          if (res.success && res.order) {
            setOrder(res.order);
            if (res.order.items && res.order.items.length > 0) {
              setSelectedProductId(res.order.items[0].productId);
            }
          }
        })
        .catch(err => setErrorMsg(err.message))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProductId || !reason) {
      setErrorMsg('Please select a product and provide a return reason.');
      return;
    }

    try {
      setSubmitting(true);
      const fullReason = notes ? `${reason} - ${notes}` : reason;
      const res = await ApiClient.post('/returns/request', {
        orderId: parseInt(orderId, 10),
        productId: parseInt(selectedProductId, 10),
        reason: fullReason
      });

      if (res.success) {
        setSuccessMsg('Return request successfully submitted! Our warehouse team will review your request.');
        setTimeout(() => {
          onNavigate(`/orders/${orderId}`);
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Verifying return eligibility from database...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => onNavigate('/orders')}>
          Back to My Orders
        </button>
      </div>
    );
  }

  if (order.orderStatus !== 'Delivered') {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Order Not Eligible For Return</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
          Returns can only be requested for orders that have been successfully delivered.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate(`/orders/${orderId}`)}>
          Back to Order
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem', maxWidth: 700 }}>
      <button 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => onNavigate(`/orders/${orderId}`)}
      >
        <ArrowLeft size={16} /> Back to Order #{order.orderNumber}
      </button>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={22} color="var(--accent)" /> Request Product Return
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Submit a return request for Order <strong>#{order.orderNumber}</strong>. Once approved by our team, a refund will be processed and inventory will be restocked.
        </p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Select Product */}
          <div className="form-group">
            <label className="form-label">Select Item to Return *</label>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              {order.items?.map(it => (
                <option key={it.productId} value={it.productId}>
                  {it.productName} (${it.unitPrice.toFixed(2)}) &times; {it.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label className="form-label">Primary Return Reason *</label>
            <select
              className="form-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Select reason...</option>
              <option value="Defective or does not function">Defective or does not function</option>
              <option value="Damaged in transit / broken packaging">Damaged in transit / broken packaging</option>
              <option value="Received wrong item or model">Received wrong item or model</option>
              <option value="Product not as described on website">Product not as described on website</option>
              <option value="No longer needed / buyer remorse">No longer needed / buyer remorse</option>
            </select>
          </div>

          {/* Additional details */}
          <div className="form-group">
            <label className="form-label">Additional Comments / Condition Description</label>
            <textarea
              className="form-control"
              placeholder="Describe the issue in detail to expedite approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate(`/orders/${orderId}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting Request...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
