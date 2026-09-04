import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import ApiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const CheckoutPage = ({ onNavigate }) => {
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    notes: ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('DEMO_CARD'); // COD or DEMO_CARD
  const [cardData, setCardData] = useState({
    cardNumber: '4242 4242 4242 4242',
    cardHolder: 'David Harrison',
    expiry: '12/28',
    cvv: '123'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill user profile info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.fullName || '',
        customerEmail: user.email || '',
        customerPhone: user.phone || '',
        shippingAddress: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || ''
      }));
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Sign In Required</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          Please sign in to proceed with checkout.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('/login')}>
          Sign In
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          You cannot checkout with an empty cart.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('/products')}>
          Return to Catalog
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic Validation
    if (!formData.customerName || !formData.shippingAddress || !formData.city || !formData.state || !formData.postalCode) {
      setErrorMsg('Please complete all required delivery address fields.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        paymentMethod,
        cardDetails: paymentMethod === 'DEMO_CARD' ? cardData : null
      };

      const res = await ApiClient.post('/orders/checkout', payload);

      if (res.success && res.order) {
        await refreshCart();
        onNavigate(`/order-success/${res.order.id}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <button 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => onNavigate('/cart')}
      >
        <ArrowLeft size={16} /> Return to Cart
      </button>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Checkout & Order Confirmation
      </h1>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Delivery Details & Payment */}
          <div>
            {/* Step 1: Delivery Address */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="var(--accent)" /> 1. Shipping Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    className="form-control"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="customerEmail"
                    className="form-control"
                    required
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    name="shippingAddress"
                    className="form-control"
                    required
                    placeholder="House number, apartment, suite, street name..."
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State / Province *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    required
                    placeholder="CA, NY, etc."
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal / Zip Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="form-control"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    disabled
                    value={formData.country}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="var(--accent)" /> 2. Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Option: Demo Card Payment */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'DEMO_CARD' ? 'var(--accent)' : 'var(--border-color)'}`,
                    backgroundColor: paymentMethod === 'DEMO_CARD' ? 'var(--accent-light)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEMO_CARD"
                    checked={paymentMethod === 'DEMO_CARD'}
                    onChange={() => setPaymentMethod('DEMO_CARD')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Demo Card Payment (Instant Order Confirmation)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Simulated secure card transaction. Validates card rules and generates a real transaction ID.
                    </div>
                  </div>
                </label>

                {/* Option: Cash on Delivery */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'COD' ? 'var(--accent)' : 'var(--border-color)'}`,
                    backgroundColor: paymentMethod === 'COD' ? 'var(--accent-light)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Pay in cash directly to delivery agent upon receiving your order.
                    </div>
                  </div>
                </label>
              </div>

              {/* Demo Card Inputs */}
              {paymentMethod === 'DEMO_CARD' && (
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cardholder Information</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Demo Test Mode</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      className="form-control"
                      placeholder="4242 4242 4242 4242"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      required={paymentMethod === 'DEMO_CARD'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      className="form-control"
                      value={cardData.cardHolder}
                      onChange={handleCardChange}
                      required={paymentMethod === 'DEMO_CARD'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        name="expiry"
                        className="form-control"
                        placeholder="12/28"
                        maxLength="5"
                        value={cardData.expiry}
                        onChange={handleCardChange}
                        required={paymentMethod === 'DEMO_CARD'}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        className="form-control"
                        placeholder="123"
                        maxLength="4"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        required={paymentMethod === 'DEMO_CARD'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 90 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              Items in Order ({cart.items.length})
            </h3>

            {/* Item Mini List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 260, overflowY: 'auto', marginBottom: '1.25rem', paddingRight: 4 }}>
              {cart.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80'}
                    alt={item.productName}
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>${cart.subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping:</span>
                <span style={{ fontWeight: 600 }}>
                  {cart.shippingFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `$${cart.shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: 700 }}>Total Due:</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Confirming Order & Stock...' : `Place Order ($${cart.totalAmount.toFixed(2)})`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              <ShieldCheck size={16} color="var(--success)" />
              Stock is reserved and inventory logs recorded upon order placement
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
