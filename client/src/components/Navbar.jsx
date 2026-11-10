import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  Compass,
  Smile,
  Bookmark,
  Heart,
  History,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-container">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-icon">🎬</span>
          <span className="brand-text">MoodFlix</span>
        </Link>

        {/* Search Bar in Navbar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <Search size={16} className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search free movies, actors, directors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
        </form>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>
            Explore
          </Link>
          <Link to="/moods" className={`nav-link ${isActive('/moods') ? 'active' : ''}`}>
            Moods
          </Link>
          {user && (
            <>
              <Link to="/watchlist" className={`nav-link ${isActive('/watchlist') ? 'active' : ''}`}>
                Watchlist
              </Link>
              <Link to="/favourites" className={`nav-link ${isActive('/favourites') ? 'active' : ''}`}>
                Favourites
              </Link>
            </>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu-wrapper">
              <Link to="/profile" className="user-profile-badge">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
                  alt={user.name}
                  className="user-avatar"
                />
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="btn btn-sm btn-outline admin-badge-btn" title="Admin Dashboard">
                  <Shield size={14} />
                  <span>Admin</span>
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className="btn btn-sm btn-secondary logout-btn"
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="btn btn-sm btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
          </form>

          <nav className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Film size={18} /> Home
            </Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
              <Compass size={18} /> Explore Movies
            </Link>
            <Link to="/moods" onClick={() => setMobileMenuOpen(false)}>
              <Smile size={18} /> Mood Recommendations
            </Link>
            {user ? (
              <>
                <Link to="/watchlist" onClick={() => setMobileMenuOpen(false)}>
                  <Bookmark size={18} /> My Watchlist
                </Link>
                <Link to="/favourites" onClick={() => setMobileMenuOpen(false)}>
                  <Heart size={18} /> Favourites
                </Link>
                <Link to="/history" onClick={() => setMobileMenuOpen(false)}>
                  <History size={18} /> Viewing History
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <User size={18} /> My Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-admin-link">
                    <Shield size={18} /> Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-logout-btn"
                >
                  <LogOut size={18} /> Log Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">
                  Log In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                  Create Free Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      <style>{`
        .navbar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(9, 12, 21, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
          transition: background 0.3s ease;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4.5rem;
          gap: 1.5rem;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 1.3rem;
          font-family: var(--font-serif);
          color: #fff;
        }
        .brand-icon {
          font-size: 1.5rem;
        }
        .brand-text {
          background: linear-gradient(135deg, #fff, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-tag {
          font-size: 0.65rem;
          padding: 0.15rem 0.45rem;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #34d399;
          border-radius: 4px;
          font-family: var(--font-sans);
          font-weight: 700;
        }
        .nav-search-form {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 360px;
        }
        .nav-search-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--text-dim);
          pointer-events: none;
        }
        .nav-search-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.45rem 1rem 0.45rem 2.3rem;
          font-size: 0.85rem;
          color: #fff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .nav-search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .nav-link {
          font-size: 0.92rem;
          color: var(--text-muted);
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .nav-link:hover, .nav-link.active {
          color: #fff;
        }
        .nav-link.active {
          color: #c4b5fd;
          font-weight: 600;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-menu-wrapper {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.25rem 0.65rem 0.25rem 0.35rem;
          background: var(--surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          transition: border-color 0.2s;
        }
        .user-profile-badge:hover {
          border-color: var(--primary);
        }
        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .admin-badge-btn {
          color: #c084fc;
          border-color: rgba(192, 132, 252, 0.4);
        }
        .guest-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .mobile-toggle {
          display: none;
          color: #fff;
          padding: 0.35rem;
        }
        .mobile-drawer {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-search-form {
          position: relative;
          display: flex;
          align-items: center;
        }
        .mobile-search-form svg {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
        }
        .mobile-search-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.65rem 1rem 0.65rem 2.25rem;
          color: #fff;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-nav-links a, .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }
        .mobile-nav-links a:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .mobile-admin-link {
          color: #c084fc !important;
        }
        .mobile-logout-btn {
          width: 100%;
          text-align: left;
          color: #f87171 !important;
        }
        .mobile-auth-btns {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 900px) {
          .nav-search-form, .desktop-nav {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
