import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const CartPage = ({ onNavigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
        <h2>Please Sign In</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          Sign in to view your shopping cart and complete purchases.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('/login')}>
          Sign In to Your Account
        </button>
      </div>
    );
  }

  // Safe stock validation: cart quantity must not exceed available warehouse stock
  const isItemStockExceeded = (item) => {
    if (!item) return false;
    // If explicitly marked inactive or unavailable (0 or false)
    if (item.isAvailable === 0 || item.isAvailable === false) return true;
    const stock = typeof item.stockQuantity === 'number' ? item.stockQuantity : 999;
    if (stock <= 0) return true;
    const qty = Number(item.quantity) || 1;
    return qty > stock;
  };

  const hasInsufficientStock = cart.items.some(isItemStockExceeded);

  const handleQtyChange = async (productId, newQty) => {
    try {
      setUpdatingId(productId);
      await updateQuantity(productId, newQty);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId);
      await removeFromCart(productId);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
        <h2>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          Looks like you haven't added any items to your cart yet.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('/products')}>
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Shopping Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
      </h1>

      {hasInsufficientStock && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Stock Alert:</strong> One or more items in your cart have exceeded available warehouse stock. Please adjust quantities before proceeding to checkout.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Product</span>
            <button 
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)' }}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cart.items.map(item => {
              const isExceeded = isItemStockExceeded(item);
              const maxStock = typeof item.stockQuantity === 'number' ? item.stockQuantity : 999;

              return (
                <div 
                  key={item.productId}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '1.25rem',
                    alignItems: 'center'
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&auto=format&fit=crop&q=80'}
                    alt={item.productName || item.name || 'Product'}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <h4 
                      style={{ fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => onNavigate(`/products/${item.productId}`)}
                    >
                      {item.productName || item.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Price: ${item.price.toFixed(2)} each
                    </div>

                    {isExceeded && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, marginTop: '0.25rem' }}>
                        Only {item.stockQuantity} in stock! Reduce quantity.
                      </div>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff' }}>
                    <button
                      style={{ width: 28, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      disabled={item.quantity <= 1 || updatingId === item.productId}
                      onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ width: 34, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                      {item.quantity}
                    </span>
                    <button
                      style={{ width: 28, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      disabled={item.quantity >= maxStock || updatingId === item.productId}
                      onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ width: 90, textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>
                    ${item.subtotal.toFixed(2)}
                  </div>

                  {/* Delete button */}
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 6 }}
                    title="Remove item"
                    onClick={() => handleRemove(item.productId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Checkout Card */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 90 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
              <span style={{ fontWeight: 600 }}>${cart.subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Standard Shipping:</span>
              <span style={{ fontWeight: 600 }}>
                {cart.shippingFee === 0 ? (
                  <span style={{ color: 'var(--success)' }}>FREE</span>
                ) : (
                  `$${cart.shippingFee.toFixed(2)}`
                )}
              </span>
            </div>

            {cart.shippingFee > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '0.5rem', borderRadius: 4 }}>
                💡 Add ${(100 - cart.subtotal).toFixed(2)} more of eligible items to get <strong>FREE shipping</strong>!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sales Tax (Est.):</span>
              <span style={{ fontWeight: 600 }}>$0.00</span>
            </div>

            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
              <span style={{ fontWeight: 700 }}>Total:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)' }}>${cart.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            disabled={hasInsufficientStock || cart.items.length === 0}
            onClick={() => onNavigate('/checkout')}
            style={{ marginBottom: '1rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <button
            className="btn btn-secondary btn-block"
            onClick={() => onNavigate('/products')}
          >
            Continue Shopping
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="var(--success)" /> Verified SSL Encrypted Checkout
          </div>
        </div>
      </div>
    </div>
  );
};
