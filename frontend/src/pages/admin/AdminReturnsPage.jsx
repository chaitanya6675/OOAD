import React, { useEffect, useState } from 'react';
import { RotateCcw, Check, X, AlertCircle } from 'lucide-react';
import ApiClient from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal, Pagination } from '../../components/common/Modal';

export const AdminReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Action Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [actionType, setActionType] = useState('Approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/returns', { status: statusFilter, page, limit: 15 });
      if (res.success) {
        setReturns(res.returns);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter, page]);

  const openActionModal = (ret, action) => {
    setSelectedReturn(ret);
    setActionType(action);
    setAdminNotes(action === 'Approved' ? 'Return request verified and accepted.' : 'Item does not meet return policy criteria.');
    setModalOpen(true);
  };

  const handleProcessAction = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      setSubmitting(true);
      const res = await ApiClient.put(`/returns/${selectedReturn.id}/status`, {
        status: actionType,
        adminNotes
      });
      if (res.success) {
        setModalOpen(false);
        fetchReturns();
      }
    } catch (err) {
      alert(err.message || 'Error processing return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customer Returns Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review customer product return requests, approve items for refund, or reject
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'Requested', 'Approved', 'Rejected', 'Completed'].map(s => (
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
                <th>Return #</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Notes</th>
                <th style={{ textAlign: 'right' }}>Review Decision</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(ret => (
                <tr key={ret.id}>
                  <td><code>{ret.returnNumber}</code></td>
                  <td><strong>{ret.orderNumber}</strong></td>
                  <td>{ret.customerName}</td>
                  <td><strong>{ret.productName}</strong> (${ret.unitPrice.toFixed(2)})</td>
                  <td style={{ maxWidth: 220, fontSize: '0.85rem' }}>{ret.reason}</td>
                  <td><StatusBadge status={ret.status} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ret.adminNotes || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {ret.status === 'Requested' ? (
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--success)' }}
                          onClick={() => openActionModal(ret, 'Approved')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => openActionModal(ret, 'Rejected')}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decision Recorded</span>
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

      {/* Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${actionType === 'Approved' ? 'Approve' : 'Reject'} Return: ${selectedReturn?.returnNumber}`}
      >
        <form onSubmit={handleProcessAction}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {actionType === 'Approved' ? (
              <span>Approving this return will automatically queue a <strong>Refund of ${selectedReturn?.unitPrice.toFixed(2)}</strong> in the Refund Management system.</span>
            ) : (
              <span>Rejecting this return will notify the customer with your rationale below.</span>
            )}
          </p>

          <div className="form-group">
            <label className="form-label">Admin Notes / Feedback to Customer *</label>
            <textarea
              className="form-control"
              required
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${actionType === 'Approved' ? 'btn-primary' : 'btn-danger'}`}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : `Confirm ${actionType}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
