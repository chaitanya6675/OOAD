import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Grid } from 'lucide-react';
import ApiClient from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/categories');
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', slug: '', description: '', imageUrl: '' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditing) {
        await ApiClient.put(`/categories/${currentId}`, formData);
      } else {
        await ApiClient.post('/categories', formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await ApiClient.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Category Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Structure product taxonomy and organize collections
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add New Category
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products Count</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop&q=80'} 
                        alt={cat.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border-color)' }}
                      />
                      <strong style={{ fontSize: '0.95rem' }}>{cat.name}</strong>
                    </div>
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 300, fontSize: '0.85rem' }}>{cat.description}</td>
                  <td>
                    <span className="badge badge-delivered">{cat.productCount || 0} Products</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: 6 }}
                      title="Edit Category"
                      onClick={() => openEditModal(cat)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Category"
                      onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL Slug (optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. smart-wearables"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
