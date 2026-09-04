import React, { useEffect, useState } from 'react';
import { DollarSign, CheckCircle2, RotateCcw } from 'lucide-react';
import ApiClient from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Modal';

export const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/refunds', { status: statusFilter, page, limit: 15 });
      if (res.success) {
        setRefunds(res.refunds);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter, page]);

  const handleProcessRefund = async (refundId) => {
    if (!window.confirm('Process and complete this refund? This will issue the credit to the customer, update payment status to Refunded, and restore warehouse inventory.')) return;

    try {
      setProcessingId(refundId);
      const res = await ApiClient.post(`/refunds/${refundId}/process`);
      if (res.success) {
        alert('Refund completed successfully! Warehouse stock has been restored.');
        fetchRefunds();
      }
    } catch (err) {
      alert(err.message || 'Error processing refund');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Refund Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Issue customer refunds for approved returns/cancellations and replenish warehouse inventory
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'Pending', 'Processing', 'Completed'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Refund #</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Refund Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Processed Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map(ref => (
                <tr key={ref.id}>
                  <td><code>{ref.refundNumber}</code></td>
                  <td><strong>{ref.orderNumber}</strong></td>
                  <td>
                    <div>{ref.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ref.customerEmail}</div>
                  </td>
                  <td><strong style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>${ref.amount.toFixed(2)}</strong></td>
                  <td style={{ maxWidth: 220, fontSize: '0.85rem' }}>{ref.reason}</td>
                  <td><StatusBadge status={ref.status} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {ref.processedAt ? new Date(ref.processedAt).toLocaleString() : 'Pending Processing'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {ref.status !== 'Completed' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={processingId === ref.id}
                        onClick={() => handleProcessRefund(ref.id)}
                      >
                        <CheckCircle2 size={14} /> {processingId === ref.id ? 'Processing...' : 'Process Refund'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                        &check; Completed
                      </span>
                    )}
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
