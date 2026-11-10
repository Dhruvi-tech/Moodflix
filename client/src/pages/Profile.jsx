import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { User, Mail, Shield, Key, Check, AlertCircle, Bookmark, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { watchlist, favourites } = useWatchlist();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);

    try {
      await updateProfile({ name: name.trim(), avatar: avatar.trim() });
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword.length < 6) {
      return setPwError('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return setPwError('New passwords do not match');
    }

    setSavingPw(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="profile-page page-wrapper container">
      <div className="section-head">
        <h2>My Account & Settings</h2>
        <p>Manage your profile, login security, and viewing preferences.</p>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: User Card & Stats */}
        <div className="profile-sidebar-col">
          <div className="user-overview-card glass-panel text-center">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8b5cf6&color=fff`}
              alt={user?.name}
              className="profile-large-avatar"
            />
            <h3 className="profile-display-name">{user?.name}</h3>
            <span className="profile-email-tag">{user?.email}</span>
            <span className={`badge ${user?.role === 'admin' ? 'badge-free-streaming' : 'badge-public-domain'} role-badge`}>
              {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
            </span>

            <div className="profile-stats-grid">
              <Link to="/watchlist" className="stat-box">
                <Bookmark size={20} className="stat-icon" />
                <span className="stat-val">{watchlist.length}</span>
                <span className="stat-lbl">In Watchlist</span>
              </Link>
              <Link to="/favourites" className="stat-box">
                <Heart size={20} className="stat-icon-fav" />
                <span className="stat-val">{favourites.length}</span>
                <span className="stat-lbl">Favourites</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="profile-forms-col">
          {/* Edit Profile Form */}
          <div className="settings-card glass-panel">
            <h3 className="settings-title">Personal Information</h3>
            {profileSuccess && (
              <div className="alert-box alert-success">
                <Check size={16} /> <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} /> <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-primary btn-sm"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Platform & Viewing Preferences Card */}
          <div className="settings-card glass-panel">
            <div className="flex items-center justify-between mb-2">
              <h3 className="settings-title" style={{ margin: 0 }}>Platform & Free Movie Preferences</h3>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-platform-preferences'))}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                ⚙️ Change Platforms
              </button>
            </div>
            <p className="text-xs text-gray-300" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              MoodFlix prioritizes movies you can legally watch for free, while catering to your streaming subscriptions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>Default Mode</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Always prioritize verified free-to-watch cinema first</span>
                </div>
                <span className="badge badge-free-streaming">Active</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>Indian Languages</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Over 20 regional languages supported in catalog</span>
                </div>
                <span className="badge badge-ad-supported">20+ Languages</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="settings-card glass-panel">
            <h3 className="settings-title">Security & Password</h3>
            {pwSuccess && (
              <div className="alert-box alert-success">
                <Check size={16} /> <span>{pwSuccess}</span>
              </div>
            )}
            {pwError && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} /> <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingPw}
                className="btn btn-secondary btn-sm"
              >
                {savingPw ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .profile-layout-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2.5rem;
          align-items: flex-start;
        }
        .user-overview-card {
          padding: 2.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .profile-large-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--primary);
          margin-bottom: 1rem;
        }
        .profile-display-name {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: #fff;
          margin-bottom: 0.2rem;
        }
        .profile-email-tag {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .role-badge {
          margin-bottom: 1.75rem;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          width: 100%;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.5rem;
        }
        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.85rem;
          background: var(--surface-2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-box:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .stat-icon { color: var(--primary); margin-bottom: 0.35rem; }
        .stat-icon-fav { color: var(--secondary); margin-bottom: 0.35rem; }
        .stat-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
        }
        .stat-lbl {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }
        .profile-forms-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .settings-card {
          padding: 2rem;
        }
        .settings-title {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: #fff;
          margin-bottom: 1.5rem;
        }
        .alert-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .alert-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
        }
        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
        }
        @media (max-width: 800px) {
          .profile-layout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
