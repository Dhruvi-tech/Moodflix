import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, Shield, User } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('guest@moodflix.com', 'Guest@123456');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="auth-page page-wrapper container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <span className="auth-icon">🎬</span>
          <h2>Welcome to MoodFlix</h2>
          <p>Sign in to your account or jump straight in as a Guest.</p>
        </div>

        {error && (
          <div className="auth-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Instant Guest Login */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="btn btn-secondary guest-instant-btn"
        >
          <User size={18} />
          <span>{loading ? 'Entering...' : 'Continue as Guest (1-Click Demo)'}</span>
        </button>

        <div className="guest-action-divider">
          <span>OR SIGN IN WITH EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-submit-btn"
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Pre-fill for Evaluators */}
        <div className="demo-credentials-box">
          <span className="demo-title">Fill Pre-seeded Account:</span>
          <div className="demo-btns-row">
            <button
              type="button"
              onClick={() => handleQuickLogin('guest@moodflix.com', 'Guest@123456')}
              className="btn btn-sm btn-outline"
            >
              Guest User
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@moodflix.com', 'Admin@123456')}
              className="btn btn-sm btn-outline admin-demo-btn"
            >
              <Shield size={13} />
              <span>Admin Account</span>
            </button>
          </div>
        </div>

        <div className="auth-footer text-center">
          <p>
            Want your own personal watchlist?{' '}
            <Link to="/register" className="auth-link">
              Create a free account
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }
        .auth-card {
          width: 100%;
          max-width: 460px;
          padding: 2.5rem 2rem;
          margin: 1rem auto;
        }
        .auth-header {
          margin-bottom: 1.5rem;
        }
        .auth-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .auth-header h2 {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: #fff;
          margin-bottom: 0.4rem;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .guest-instant-btn {
          width: 100%;
          padding: 0.85rem;
          margin-bottom: 1.25rem;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.35);
          color: #c4b5fd;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .guest-instant-btn:hover {
          background: rgba(139, 92, 246, 0.28);
          border-color: #a78bfa;
          color: #fff;
          transform: translateY(-1px);
        }
        .guest-action-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
        }
        .guest-action-divider::before,
        .guest-action-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }
        .guest-action-divider span {
          padding: 0 0.75rem;
          color: var(--text-dim);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .auth-error-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: var(--radius-sm);
          color: #f87171;
          font-size: 0.88rem;
          margin-bottom: 1.25rem;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-dim);
          pointer-events: none;
        }
        .input-with-icon .form-input {
          padding-left: 2.75rem;
        }
        .auth-submit-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.85rem;
        }
        .demo-credentials-box {
          margin-top: 1.75rem;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
          border: 1px dashed var(--border);
        }
        .demo-title {
          display: block;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .demo-btns-row {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        .admin-demo-btn {
          color: #c084fc;
          border-color: rgba(192, 132, 252, 0.4);
        }
        .auth-footer {
          margin-top: 1.75rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .auth-link {
          color: #c4b5fd;
          font-weight: 600;
        }
        .auth-link:hover {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
