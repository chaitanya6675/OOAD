import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setErrorMsg('Full name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      onNavigate('/products');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.25rem', maxWidth: 480, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Register as a new customer to place orders and track delivery
          </p>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              placeholder="e.g. David Harrison"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (min 6 characters) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '1.5rem', marginBottom: '1.25rem' }}
          >
            <UserPlus size={16} /> {loading ? 'Creating Account...' : 'Register Account'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <a 
              href="/login" 
              style={{ color: 'var(--accent)', fontWeight: 600 }}
              onClick={(e) => { e.preventDefault(); onNavigate('/login'); }}
            >
              Sign In here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
