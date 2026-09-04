import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Laptop, Smartphone, Headphones, Watch } from 'lucide-react';
import ApiClient from '../../services/api';
import { ProductCard } from '../../components/customer/ProductCard';

export const HomePage = ({ onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catData, prodData, newProdData] = await Promise.all([
          ApiClient.get('/categories'),
          ApiClient.get('/products', { limit: 8 }),
          ApiClient.get('/products', { sortBy: 'newest', limit: 4 })
        ]);

        if (catData.success) setCategories(catData.categories);
        if (prodData.success) setFeaturedProducts(prodData.products);
        if (newProdData.success) setNewArrivals(newProdData.products);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '4rem 0',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '3rem',
        backgroundImage: 'linear-gradient(to right, #0f172a, #1e293b)'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              color: '#60a5fa',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              <Sparkles size={14} /> Capstone OOAD E-Commerce Platform
            </div>

            <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
              Engineered for Speed, Reliability & Precision.
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Explore premium smartphones, high-performance laptops, studio-grade audio, and precision accessories with real-time inventory tracking and transparent order workflows.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('/products')}
              >
                Browse All Products <ArrowRight size={18} />
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                onClick={() => onNavigate('/categories')}
              >
                Shop by Category
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80" 
              alt="Flagship Tech" 
              style={{
                width: '100%',
                maxHeight: '380px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Shop by Category</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Browse curated tech collections</p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/categories')}
          >
            View All Categories <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '1rem', transition: 'transform 0.15s ease' }}
              onClick={() => onNavigate(`/products?category=${cat.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img 
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80'} 
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{cat.name}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {cat.productCount || 0} Products
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Featured Products</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Top-rated equipment in stock now</p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/products')}
          >
            See Full Catalog <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading products from central database...
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Mid-page Promotional Banner */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div>
            <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Direct From Warehouse
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Guaranteed Authentic. Zero Compromise.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Every unit in our inventory is backed by manufacturer warranty, verified stock logs, and instant digital invoicing. Experience smooth demo card checkout or pay cash on arrival.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('/products')}
            >
              Start Shopping
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <Zap size={24} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Live Stock Checks</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real database-driven inventory updates</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <Shield size={24} color="#16a34a" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Full Protection</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full return and refund lifecycle</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="container" style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>New Arrivals</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Freshly added to the catalog</p>
        </div>

        <div className="product-grid">
          {newArrivals.map(prod => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
