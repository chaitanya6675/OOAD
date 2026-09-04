import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import ApiClient from '../../services/api';
import { StockBadge } from '../../components/common/Badge';
import { Modal, Pagination } from '../../components/common/Modal';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    description: '',
    categoryId: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    isAvailable: 1
  });
  const [submitting, setSubmitting] = useState(false);

  // Load Categories
  useEffect(() => {
    ApiClient.get('/categories').then(res => {
      if (res.success) {
        setCategories(res.categories);
        if (res.categories.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: res.categories[0].id }));
        }
      }
    });
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/products', {
        search,
        category: selectedCategory,
        page,
        limit: 15
      });
      if (res.success) {
        setProducts(res.products);
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
    fetchProducts();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      productCode: `PRD-${Date.now().toString(36).toUpperCase()}`,
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      price: '',
      stockQuantity: '',
      imageUrl: '',
      isAvailable: 1
    });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setIsEditing(true);
    setCurrentId(prod.id);
    setFormData({
      productCode: prod.productCode,
      name: prod.name,
      description: prod.description,
      categoryId: prod.categoryId,
      price: prod.price,
      stockQuantity: prod.stockQuantity,
      imageUrl: prod.imageUrl,
      isAvailable: prod.isAvailable ? 1 : 0
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditing) {
        await ApiClient.put(`/products/${currentId}`, formData);
      } else {
        await ApiClient.post('/products', formData);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await ApiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error deleting product');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Product Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Add, update pricing, assign categories, and maintain catalog availability
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={14} /> Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category:</span>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={prod.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80&auto=format&fit=crop&q=80'} 
                        alt={prod.name}
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border-color)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{prod.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>{prod.productCode}</code></td>
                  <td>{prod.categoryName}</td>
                  <td><strong>${prod.price.toFixed(2)}</strong></td>
                  <td>
                    <StockBadge status={prod.stockStatus} quantity={prod.stockQuantity} />
                  </td>
                  <td>
                    <span className={`badge ${prod.isAvailable ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {prod.isAvailable ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: 6 }}
                      title="Edit Product"
                      onClick={() => openEditModal(prod)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Product"
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    >
                      <Trash2 size={14} />
                    </button>
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Product Details' : 'Create New Product'}
        maxWidth={620}
      >
        <form onSubmit={handleSaveProduct}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product Code *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Stock Quantity *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                disabled={isEditing}
                title={isEditing ? 'Adjust stock via Inventory Management module' : ''}
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              />
              {isEditing && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  To adjust existing stock, use Inventory Management tab.
                </div>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Image URL (Unsplash or direct URL)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
              <input
                type="checkbox"
                id="availCheck"
                checked={Boolean(formData.isAvailable)}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked ? 1 : 0 })}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="availCheck" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Product is available for public customer purchase
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
