import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      onNavigate('/products');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type = 'customer') => {
    if (type === 'customer') {
      setEmail('customer@smartecom.com');
      setPassword('Customer@12345');
    } else {
      setEmail('admin@smartecom.com');
      setPassword('Admin@12345');
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.25rem', maxWidth: 450, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>Sign In</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Access your orders, cart, and profile
          </p>
        </div>

        {/* Demo Quick-Fill Pill */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Capstone Demo:</strong> Test credentials
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', height: 26, padding: '0 0.5rem' }}
            onClick={() => handleFillDemo('customer')}
          >
            <Sparkles size={12} color="var(--accent)" /> Auto-Fill Customer
          </button>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '1.5rem', marginBottom: '1.25rem' }}
          >
            <LogIn size={16} /> {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <a 
              href="/register" 
              style={{ color: 'var(--accent)', fontWeight: 600 }}
              onClick={(e) => { e.preventDefault(); onNavigate('/register'); }}
            >
              Register here
            </a>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center' }}>
            <a 
              href="/admin/login" 
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              onClick={(e) => { e.preventDefault(); onNavigate('/admin/login'); }}
            >
              Are you an administrator? <strong>Sign in to Admin Console &rarr;</strong>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
