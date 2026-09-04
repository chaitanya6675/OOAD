import React from 'react';
import { Printer, Download, CheckCircle, ShoppingCart } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const InvoiceView = ({ invoiceData }) => {
  if (!invoiceData || !invoiceData.order) return null;

  const { order, invoice, store } = invoiceData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice Paper Document */}
      <div 
        className="card" 
        style={{
          padding: '2.5rem',
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              <ShoppingCart size={24} color="#2563eb" />
              <span>Smart</span>E-Commerce
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              {store?.address || '100 University Ave, Tech Park'}<br/>
              {store?.city || 'San Francisco, CA 94107'}<br/>
              Email: {store?.email || 'support@smartecom.com'} | Phone: {store?.phone || '+1 (800) 555-0199'}<br/>
              Tax ID: {store?.taxId || 'US-EIN-987654321'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--accent)' }}>TAX INVOICE</h1>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {invoice?.invoiceNumber || `INV-${order.orderNumber}`}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Date: {new Date(order.createdAt).toLocaleDateString()}<br/>
              Order Ref: <strong>{order.orderNumber}</strong>
            </div>
          </div>
        </div>

        {/* Billed To / Shipped To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Billed & Shipped To:
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-main)' }}>
              {order.customerName}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {order.shippingAddress}<br/>
              {order.city}, {order.state} {order.postalCode}<br/>
              {order.country || 'United States'}<br/>
              Email: {order.customerEmail}<br/>
              Phone: {order.customerPhone || 'N/A'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Payment Information:
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)' }}>
              Method: <strong>{order.paymentMethod === 'DEMO_CARD' ? 'Demo Card Payment' : 'Cash on Delivery (COD)'}</strong>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Payment Status: <StatusBadge status={order.paymentStatus} />
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Order Status: <StatusBadge status={order.orderStatus} />
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="data-table" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Item Description</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.productName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {item.productCode || `PRD-${item.productId}`}</div>
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>${order.subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping Fee:</span>
              <span style={{ fontWeight: 600 }}>
                {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Tax:</span>
              <span style={{ fontWeight: 600 }}>$0.00</span>
            </div>

            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem' }}>
              <span style={{ fontWeight: 700 }}>Total Amount:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)' }}>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Footer Note */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <p><strong>Terms & Policy:</strong> This computer-generated invoice is issued by Smart E-Commerce Platform. Returns are accepted within 7 days of delivery for eligible undamaged items. For assistance or refund status, visit your Customer Orders dashboard.</p>
        </div>
      </div>
    </div>
  );
};
