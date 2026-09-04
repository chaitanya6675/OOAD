import React, { useEffect, useState } from 'react';
import { Layers, Plus, Minus, Search, AlertTriangle, History, ArrowUpDown } from 'lucide-react';
import ApiClient from '../../services/api';
import { StockBadge } from '../../components/common/Badge';
import { Modal, Pagination } from '../../components/common/Modal';

export const AdminInventoryPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Manual Adjust Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(10);
  const [adjustmentReason, setAdjustmentReason] = useState('Warehouse restocking shipment');
  const [submitting, setSubmitting] = useState(false);

  const fetchLiveStock = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/inventory', {
        filter,
        search,
        page,
        limit: 15
      });
      if (res.success) {
        setStockItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await ApiClient.get('/inventory/logs', { limit: 25 });
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveStock();
  }, [filter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLiveStock();
  };

  const openAdjustModal = (item) => {
    setSelectedProduct(item);
    setAdjustmentAmount(5);
    setAdjustmentReason('Restocked from supplier');
    setAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await ApiClient.post('/inventory/adjust', {
        productId: selectedProduct.id,
        adjustment: parseInt(adjustmentAmount, 10),
        reason: adjustmentReason
      });
      setAdjustModalOpen(false);
      fetchLiveStock();
    } catch (err) {
      alert(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Inventory & Stock Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitor real-time warehouse levels, configure stock adjustments, and review audit logs
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { fetchAuditLogs(); setLogsOpen(true); }}
        >
          <History size={16} /> View Audit Logs
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilter('ALL'); setPage(1); }}
          >
            All Inventory
          </button>
          <button 
            className={`btn btn-sm ${filter === 'LOW_STOCK' ? 'btn-primary' : 'btn-secondary'}`}
            style={filter === 'LOW_STOCK' ? {} : { color: 'var(--warning)' }}
            onClick={() => { setFilter('LOW_STOCK'); setPage(1); }}
          >
            Low Stock (&le; 5 units)
          </button>
          <button 
            className={`btn btn-sm ${filter === 'OUT_OF_STOCK' ? 'btn-primary' : 'btn-secondary'}`}
            style={filter === 'OUT_OF_STOCK' ? {} : { color: 'var(--danger)' }}
            onClick={() => { setFilter('OUT_OF_STOCK'); setPage(1); }}
          >
            Out of Stock
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 240 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search product name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {/* Stock Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Code</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Stock Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(item => {
                const isLow = item.stock_quantity <= 5 && item.stock_quantity > 0;
                const isOut = item.stock_quantity === 0 || !item.is_available;

                return (
                  <tr key={item.id} style={isLow ? { backgroundColor: 'rgba(254, 243, 199, 0.3)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={item.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80&auto=format&fit=crop&q=80'} 
                          alt={item.name}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border-color)' }}
                        />
                        <strong style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </strong>
                      </div>
                    </td>
                    <td><code>{item.product_code}</code></td>
                    <td>{item.category_name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: isOut ? 'var(--danger)' : (isLow ? 'var(--warning)' : 'var(--text-main)') }}>
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <StockBadge status={item.stock_status} quantity={item.stock_quantity} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openAdjustModal(item)}
                      >
                        <ArrowUpDown size={14} /> Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name}`}
      >
        <form onSubmit={handleSaveAdjustment}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Warehouse Stock:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {selectedProduct?.stock_quantity} units
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Adjustment (+ to increase, - to decrease) *</label>
            <input
              type="number"
              className="form-control"
              required
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              New stock level will be: <strong>{parseInt(selectedProduct?.stock_quantity || 0, 10) + parseInt(adjustmentAmount || 0, 10)}</strong> units
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Audit Reason *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Received new shipment, stock reconciliation..."
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Applying Adjustment...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        isOpen={logsOpen}
        onClose={() => setLogsOpen(false)}
        title="Inventory Movement Audit Logs"
        maxWidth={750}
      >
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product</th>
                <th>Type</th>
                <th>Change</th>
                <th>New Stock</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td><strong>{log.product_name}</strong></td>
                  <td><code style={{ fontSize: '0.75rem' }}>{log.change_type}</code></td>
                  <td>
                    <span style={{ fontWeight: 700, color: log.quantity >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    </span>
                  </td>
                  <td>{log.new_stock}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};
