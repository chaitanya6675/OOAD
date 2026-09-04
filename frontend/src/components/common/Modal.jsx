import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 560 }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="card-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '2rem' }}>
      <button 
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      {pages.map(p => (
        <button
          key={p}
          className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onPageChange(p)}
          style={{ minWidth: 32 }}
        >
          {p}
        </button>
      ))}

      <button 
        className="btn btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};
