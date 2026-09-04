import React, { useEffect, useState } from 'react';
import { ShoppingCart, Check, Shield, Truck, RotateCcw, ArrowLeft, AlertCircle } from 'lucide-react';
import ApiClient from '../../services/api';
import { StockBadge } from '../../components/common/Badge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProductDetailPage = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ApiClient.get(`/products/${productId}`);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setErrorMsg('Product could not be loaded.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = async (goToCart = false) => {
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('/login');
      return;
    }

    try {
      setAdding(true);
      setErrorMsg('');
      await addToCart(product.id, quantity);
      setSuccessMsg(`Added ${quantity} unit(s) of "${product.name}" to your cart.`);
      setTimeout(() => setSuccessMsg(''), 4000);

      if (goToCart && onNavigate) {
        onNavigate('/cart');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading product specifications from central database...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The requested product does not exist or has been removed.</p>
        <button className="btn btn-secondary" onClick={() => onNavigate('/products')}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = !product.isAvailable || product.stockQuantity <= 0;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Back button */}
      <button 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => onNavigate('/products')}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Alerts */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Product Image Stage */}
        <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff', overflow: 'hidden' }}>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'} 
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Product Details & Actions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.categoryName || 'Electronics'}
            </span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Code: <strong>{product.productCode}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, lineHeight: 1.25, marginBottom: '1rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ${product.price.toFixed(2)}
            </div>
            <StockBadge status={product.stockStatus} quantity={product.stockQuantity} />
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Stock & Quantity Selection */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quantity to purchase:</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isOutOfStock ? (
                  <strong style={{ color: 'var(--danger)' }}>Out of stock</strong>
                ) : (
                  <span>Available: <strong>{product.stockQuantity}</strong> units</span>
                )}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff' }}>
                <button
                  type="button"
                  style={{ width: 36, height: 38, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  readOnly
                  value={quantity}
                  style={{ width: 44, textAlign: 'center', border: 'none', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                />
                <button
                  type="button"
                  style={{ width: 36, height: 38, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}
                  disabled={quantity >= product.stockQuantity || isOutOfStock}
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                disabled={isOutOfStock || adding}
                onClick={() => handleAddToCart(false)}
              >
                <ShoppingCart size={18} /> {isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {!isOutOfStock && (
              <button
                className="btn btn-dark btn-block"
                style={{ marginTop: '0.75rem' }}
                disabled={adding}
                onClick={() => handleAddToCart(true)}
              >
                Buy Now (Proceed to Checkout)
              </button>
            )}
          </div>

          {/* Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Truck size={18} color="var(--accent)" /> Free Delivery Over $100
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <RotateCcw size={18} color="var(--success)" /> 7-Day Easy Returns
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Shield size={18} color="#0284c7" /> 1-Year Official Warranty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
