import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, Search, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import ApiClient from '../../services/api';
import { Pagination } from '../../components/common/Modal';

export const AdminDataExportPage = () => {
  const tables = [
    { key: 'users', label: '1. Users' },
    { key: 'customers', label: '2. Customers' },
    { key: 'products', label: '3. Products' },
    { key: 'categories', label: '4. Categories' },
    { key: 'orders', label: '5. Orders' },
    { key: 'order_items', label: '6. Order Items' },
    { key: 'payments', label: '7. Payments' },
    { key: 'invoices', label: '8. Invoices' },
    { key: 'inventory', label: '9. Inventory Logs' },
    { key: 'returns', label: '10. Returns' },
    { key: 'refunds', label: '11. Refunds' },
    { key: 'sales', label: '12. Sales Records' }
  ];

  const [activeTable, setActiveTable] = useState('orders');
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get(`/export/records/${activeTable}`, {
        search,
        page,
        limit: 15
      });
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [activeTable, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTableData();
  };

  const handleExportAllExcel = async () => {
    try {
      setDownloadingAll(true);
      window.location.href = '/api/export/excel/all';
      setTimeout(() => setDownloadingAll(false), 2000);
    } catch (err) {
      alert('Error downloading Excel file');
      setDownloadingAll(false);
    }
  };

  const handleExportTableCsv = (tableKey) => {
    window.location.href = `/api/export/csv/${tableKey}`;
  };

  // Get dynamic table headers
  const headers = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <div>
      {/* Top Banner with Master Excel Export Button */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <Database size={16} /> Central Relational Database Explorer
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Database Records & Excel Data Access</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 650, marginTop: '0.25rem' }}>
              Direct live access to all 12 system relational entities stored in <code>backend/database/ecommerce.db</code>. 
              Export the entire database into a unified multi-sheet Excel spreadsheet with sanitized credentials.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => handleExportTableCsv(activeTable)}
            >
              <Download size={18} /> Export Current Table (CSV)
            </button>

            <button
              className="btn btn-primary btn-lg"
              disabled={downloadingAll}
              onClick={handleExportAllExcel}
              style={{ backgroundColor: '#10b981', borderColor: '#059669' }}
            >
              <FileSpreadsheet size={20} />
              {downloadingAll ? 'Generating Excel Workbook...' : 'Export Complete Database (Excel .xlsx)'}
            </button>
          </div>
        </div>
      </div>

      {/* 12 Entity Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {tables.map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${activeTable === t.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={() => { setActiveTable(t.key); setSearch(''); setPage(1); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table Data Viewer Card */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT TABLE:</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {tables.find(t => t.key === activeTable)?.label} ({total} Records)
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="form-control"
                style={{ width: 220, height: 32, fontSize: '0.8rem' }}
                placeholder="Search table records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ height: 32 }}>
                <Search size={12} />
              </button>
            </form>

            <button 
              className="btn btn-secondary btn-sm"
              style={{ height: 32 }}
              onClick={fetchTableData} 
              title="Refresh table"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Live Records Table */}
        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading data from centralized database table...
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              No records found in this table.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map(h => (
                    <th key={h} style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {headers.map(h => {
                      const val = row[h];
                      return (
                        <td key={h} style={{ fontSize: '0.85rem' }}>
                          {val === null || val === undefined 
                            ? <span style={{ color: 'var(--text-light)' }}>—</span> 
                            : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
