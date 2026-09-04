import React, { useEffect, useState } from 'react';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import ApiClient from '../../services/api';
import { ProductCard } from '../../components/customer/ProductCard';
import { Pagination } from '../../components/common/Modal';

export const ProductsPage = ({ onNavigate, queryParams = {} }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(queryParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.category || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Load Categories
  useEffect(() => {
    ApiClient.get('/categories')
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(console.error);
  }, []);

  // Update filters if URL queryParams change
  useEffect(() => {
    if (queryParams.search !== undefined) setSearch(queryParams.search);
    if (queryParams.category !== undefined) setSelectedCategory(queryParams.category);
  }, [queryParams]);

  // Fetch Products based on filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        category: selectedCategory,
        minPrice,
        maxPrice,
        inStockOnly,
        sortBy,
        page,
        limit: 12
      };

      const res = await ApiClient.get('/products', params);
      if (res.success) {
        setProducts(res.products);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, inStockOnly, sortBy, page]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Filter size={16} color="var(--accent)" /> Filters
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 26 }}
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilter}>
            {/* Search Filter */}
            <div className="form-group">
              <label className="form-label">Search Query</label>
              <input
                type="text"
                className="form-control"
                placeholder="Product name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.productCount})</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="form-group">
              <label className="form-label">Price Range ($)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="inStockToggle"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="inStockToggle" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>
                In Stock Only
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Products Listing Area */}
        <main>
          {/* Top Sort & Summary Bar */}
          <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
              {search && <span> for "<em>{search}</em>"</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort By:</span>
              <select
                className="form-select"
                style={{ width: 180, height: 36, padding: '0.25rem 0.5rem' }}
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Grid / Empty State */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Searching products in central database...
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>No matching products found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Try adjusting your search query, clearing price bounds, or switching categories.
              </p>
              <button className="btn btn-secondary" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>

              {/* Numbered Pagination */}
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
