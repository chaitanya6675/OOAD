import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';
import ApiClient from '../../services/api';
import { Pagination } from '../../components/common/Modal';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/admin/customers', { search, page, limit: 15 });
      if (res.success) {
        setCustomers(res.customers);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customer Directory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Overview of registered customer accounts, order counts, and total customer lifetime value
        </p>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: 450 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Shipping Location</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent)' }}>
                        {c.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <strong>{c.full_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User ID: #{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{c.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone || 'No phone recorded'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{c.city ? `${c.city}, ${c.state || ''}` : 'No address saved'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.country || 'United States'}</div>
                  </td>
                  <td>
                    <span className="badge badge-confirmed">
                      {c.total_orders} Orders
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--success)' }}>
                      ${Number(c.total_spend || 0).toFixed(2)}
                    </strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
