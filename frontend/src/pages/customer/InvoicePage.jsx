import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ApiClient from '../../services/api';
import { InvoiceView } from '../../components/customer/InvoiceView';

export const InvoicePage = ({ orderId, onNavigate }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (orderId) {
      ApiClient.get(`/invoices/order/${orderId}`)
        .then(res => {
          if (res.success) {
            setInvoiceData(res);
          }
        })
        .catch(err => setErrorMsg(err.message || 'Error loading invoice.'))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating digital tax invoice from central database...
      </div>
    );
  }

  if (errorMsg || !invoiceData) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Invoice Not Available</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{errorMsg || 'Could not locate invoice for this order.'}</p>
        <button className="btn btn-secondary" onClick={() => onNavigate('/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <div className="no-print" style={{ marginBottom: '1rem' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate(`/orders/${orderId}`)}
        >
          <ArrowLeft size={16} /> Back to Order #{invoiceData.order.orderNumber}
        </button>
      </div>

      <InvoiceView invoiceData={invoiceData} />
    </div>
  );
};
