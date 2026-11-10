import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, AlertCircle, Sparkles } from 'lucide-react';

const MOOD_OPTIONS = ['happy', 'thriller', 'romantic', 'chill', 'inspirational', 'comedy', 'feel-good'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [favoriteMoods, setFavoriteMoods] = useState(['happy']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMood = (m) => {
    if (favoriteMoods.includes(m)) {
      setFavoriteMoods(favoriteMoods.filter((item) => item !== m));
    } else {
      setFavoriteMoods([...favoriteMoods, m]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(name, email, password, {
        favoriteMoods,
        preferredLanguages: ['English'],
      });
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <span className="auth-icon">🎬</span>
          <h2>Join MoodFlix</h2>
          <p>Create your free account to track favorites, build your watchlist, and review free films.</p>
        </div>

        {error && (
          <div className="auth-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Dhruvi Mittal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="dhruvi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (min 6 characters)</label>
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Initial Mood Preferences */}
          <div className="mood-preference-select-group">
            <label className="form-label">Select Your Favorite Vibes (Optional):</label>
            <div className="mood-select-pills">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = favoriteMoods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    className={`mood-pref-pill ${isSelected ? 'active' : ''}`}
                  >
                    <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-submit-btn"
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="auth-footer text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log in instead
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
          max-width: 480px;
          padding: 2.75rem 2.25rem;
          margin: 1rem auto;
        }
        .auth-header {
          margin-bottom: 2rem;
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
          margin-bottom: 1.5rem;
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
        .mood-preference-select-group {
          margin: 1.25rem 0 1.5rem;
        }
        .mood-select-pills {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.4rem;
        }
        .mood-pref-pill {
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: var(--surface-2);
          color: var(--text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mood-pref-pill:hover {
          border-color: var(--primary);
          color: #fff;
        }
        .mood-pref-pill.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: var(--primary);
          color: #c4b5fd;
          font-weight: 600;
        }
        .auth-submit-btn {
          width: 100%;
          padding: 0.85rem;
        }
        .auth-footer {
          margin-top: 2rem;
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

export default Register;
