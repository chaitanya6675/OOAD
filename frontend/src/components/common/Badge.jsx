import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();
  let className = 'badge';

  if (['pending', 'requested'].includes(normalized)) {
    className += ' badge-pending';
  } else if (['confirmed', 'processing'].includes(normalized)) {
    className += ' badge-confirmed';
  } else if (['shipped'].includes(normalized)) {
    className += ' badge-shipped';
  } else if (['delivered', 'paid', 'completed', 'approved'].includes(normalized)) {
    className += ' badge-delivered';
  } else if (['cancelled', 'failed', 'rejected'].includes(normalized)) {
    className += ' badge-cancelled';
  } else if (['refunded'].includes(normalized)) {
    className += ' badge-refunded';
  }

  return <span className={className}>{status}</span>;
};

export const StockBadge = ({ status, quantity }) => {
  if (status === 'OUT_OF_STOCK' || quantity === 0) {
    return <span className="stock-badge out-of-stock">Out of Stock</span>;
  }
  if (status === 'LOW_STOCK' || (quantity !== undefined && quantity <= 5)) {
    return <span className="stock-badge low-stock">Only {quantity} left</span>;
  }
  return <span className="stock-badge in-stock">In Stock ({quantity})</span>;
};
