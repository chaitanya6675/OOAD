import React, { useEffect, useState } from 'react';
import { BarChart3, Filter, Download, FileSpreadsheet, RotateCcw } from 'lucide-react';
import ApiClient from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Modal';

export const AdminReportsPage = () => {
  const [reportData, setReportData] = useState({
    summary: { totalOrders: 0, totalUnitsSold: 0, totalRevenue: 0, avgOrderValue: 0 },
    records: [],
    total: 0,
    totalPages: 1
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    ApiClient.get('/categories').then(res => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/admin/reports', {
        startDate,
        endDate,
        categoryId,
        orderStatus,
        paymentStatus,
        page,
        limit: 20
      });
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [categoryId, orderStatus, paymentStatus, page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCategoryId('');
    setOrderStatus('');
    setPaymentStatus('');
    setPage(1);
  };

  const handleExportCsv = () => {
    try {
      ApiClient.downloadTableCsv('sales');
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    }
  };

  const handleExportExcel = () => {
    try {
      ApiClient.downloadMasterExcel();
    } catch (err) {
      alert('Error exporting Excel: ' + err.message);
    }
  };

  const { summary } = reportData;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Sales & Order Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comprehensive sales performance calculated from transactional order line items
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportExcel}>
            <FileSpreadsheet size={14} /> Export Master Excel
          </button>
        </div>
      </div>

      {/* Summary Stat Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Filtered Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
            ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {summary.totalOrders}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Units Sold</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
            {summary.totalUnitsSold}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Average Order Value</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
            ${summary.avgOrderValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Order Status</label>
            <select
              className="form-select"
              value={orderStatus}
              onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Payment Status</label>
            <select
              className="form-select"
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
              <Filter size={14} /> Filter
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset} title="Reset">
              <RotateCcw size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Detailed Records Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Item Total</th>
                <th>Order Total</th>
                <th>Payment</th>
                <th>Order Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.records.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(r.order_date).toLocaleDateString()}
                  </td>
                  <td><strong>{r.order_number}</strong></td>
                  <td>{r.customer_name}</td>
                  <td>
                    <div><strong>{r.product_name}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.product_code}</div>
                  </td>
                  <td>{r.category_name}</td>
                  <td>${r.unit_price.toFixed(2)}</td>
                  <td><strong>{r.quantity}</strong></td>
                  <td><strong>${r.item_total.toFixed(2)}</strong></td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>${r.order_grand_total.toFixed(2)}</td>
                  <td><StatusBadge status={r.payment_status} /></td>
                  <td><StatusBadge status={r.order_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={reportData.totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
