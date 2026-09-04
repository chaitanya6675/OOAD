import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import ApiClient from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Modal';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/payments', { page, limit: 15 });
      if (res.success) {
        setPayments(res.payments);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Payment Transactions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Audit log of all processed demo card payments and Cash on Delivery records
        </p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Card Last 4</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td><code>{p.transactionId}</code></td>
                  <td><strong>{p.orderNumber}</strong></td>
                  <td>{p.customerName}</td>
                  <td><strong style={{ color: 'var(--text-main)' }}>${p.amount.toFixed(2)}</strong></td>
                  <td>{p.paymentMethod === 'DEMO_CARD' ? 'Demo Card' : 'Cash on Delivery'}</td>
                  <td>{p.cardLast4 ? `•••• ${p.cardLast4}` : '—'}</td>
                  <td><StatusBadge status={p.paymentStatus} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(p.paymentDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={Math.ceil(total / 15)}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
