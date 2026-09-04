import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { StockBadge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`/products/${product.id}`);
    }
  };

  const isOutOfStock = !product.isAvailable || product.stockQuantity <= 0;

  return (
    <div className="product-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrapper">
        <img 
          src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'} 
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
      </div>

      <div className="product-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="product-category">{product.categoryName || 'Electronics'}</span>
          <StockBadge status={product.stockStatus} quantity={product.stockQuantity} />
        </div>

        <h3 className="product-title" title={product.name}>{product.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
          <div className="product-price">${product.price.toFixed(2)}</div>

          <button
            className={`btn btn-sm ${justAdded ? 'btn-secondary' : 'btn-primary'}`}
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            style={{ minWidth: 90 }}
          >
            {justAdded ? (
              <>
                <Check size={14} color="#16a34a" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> {isOutOfStock ? 'Sold Out' : 'Add'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
