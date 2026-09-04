import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shippingFee: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend whenever user logs in or page loads
  const refreshCart = async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ items: [], itemCount: 0, subtotal: 0, shippingFee: 0, totalAmount: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await ApiClient.get('/cart');
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, isCustomer]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to your shopping cart.');
    }
    const data = await ApiClient.post('/cart/items', { productId, quantity });
    if (data.success && data.cart) {
      setCart(data.cart);
      return data.cart;
    }
    throw new Error(data.message || 'Failed to add item to cart.');
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    const data = await ApiClient.put('/cart/items', { productId, quantity });
    if (data.success && data.cart) {
      setCart(data.cart);
      return data.cart;
    }
    throw new Error(data.message || 'Failed to update item quantity.');
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    const data = await ApiClient.delete(`/cart/items/${productId}`);
    if (data.success && data.cart) {
      setCart(data.cart);
      return data.cart;
    }
    throw new Error(data.message || 'Failed to remove item.');
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    const data = await ApiClient.delete('/cart');
    if (data.success && data.cart) {
      setCart(data.cart);
    }
  };

  const value = {
    cart,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
