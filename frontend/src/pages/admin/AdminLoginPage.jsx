import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.user.role !== 'admin') {
        setErrorMsg('Access denied. This account does not possess administrator privileges.');
        return;
      }
      onNavigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminDemo = () => {
    setEmail('admin@smartecom.com');
    setPassword('Admin@12345');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)', marginBottom: '1rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Smart E-Commerce Management System
          </p>
        </div>

        {/* Demo Fast Fill */}
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
            <strong>Demo Credentials:</strong>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', height: 26, padding: '0 0.5rem' }}
            onClick={handleFillAdminDemo}
          >
            <Sparkles size={12} color="var(--accent)" /> Auto-Fill Admin
          </button>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@smartecom.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
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
            style={{ marginTop: '1.5rem', marginBottom: '1rem' }}
          >
            {loading ? 'Authenticating Admin...' : 'Sign In as Admin'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('/')}
            >
              <ArrowLeft size={14} /> Return to Storefront
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
