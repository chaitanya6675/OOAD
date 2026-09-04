import React, { useEffect, useState } from 'react';
import { ArrowRight, Grid } from 'lucide-react';
import ApiClient from '../../services/api';

export const CategoriesPage = ({ onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get('/categories')
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Grid size={24} color="var(--accent)" /> All Product Categories
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Explore our product catalog structured by hardware and accessory classifications
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading categories from central database...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
              onClick={() => onNavigate(`/products?category=${cat.id}`)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
            >
              <div style={{ width: '100%', height: 180, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{cat.name}</h3>
                  <span className="badge badge-delivered" style={{ fontSize: '0.75rem' }}>
                    {cat.productCount || 0} Products
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {cat.description || 'Explore high quality tech hardware in this section.'}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem' }}>
                  Explore Category <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
