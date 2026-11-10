import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield,
  Film,
  Users,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [activeTab, setActiveTab] = useState('movies');
  const [loading, setLoading] = useState(true);
  const [verifyingLinks, setVerifyingLinks] = useState(false);
  const [linkVerifyResult, setLinkVerifyResult] = useState(null);

  const handleVerifyLinks = async () => {
    setVerifyingLinks(true);
    try {
      const res = await api.post('/admin/verify-links');
      if (res.data?.success) {
        setLinkVerifyResult(res.data);
      }
    } catch (err) {
      console.error('Error verifying links:', err);
    } finally {
      setVerifyingLinks(false);
    }
  };

  // Movie Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    overview: '',
    poster: '',
    releaseYear: 2024,
    runtime: 90,
    genres: 'Drama, Comedy',
    languages: 'English',
    director: 'Unknown',
    cast: '',
    moodTags: 'happy, feel-good',
    moodExplanation: 'Uplifting and comforting viewing experience.',
    availabilityType: 'Public Domain',
    provider: 'Internet Archive',
    url: '',
    region: 'Global',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, moviesRes, usersRes, revsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/movies?limit=50&sort=latest'),
        api.get('/admin/users'),
        api.get('/admin/reviews'),
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.stats);
        setRecentActivity(dashRes.data.recentActivity);
      }
      if (moviesRes.data.success) {
        setMoviesList(moviesRes.data.movies);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
      if (revsRes.data.success) {
        setReviewsList(revsRes.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setMovieForm({
      title: '',
      overview: '',
      poster: '/posters/the-general.jpg',
      releaseYear: 2024,
      runtime: 90,
      genres: 'Drama, Comedy',
      languages: 'English',
      director: 'Unknown',
      cast: '',
      moodTags: 'happy, feel-good',
      moodExplanation: 'Curated recommendation for this emotional state.',
      availabilityType: 'Public Domain',
      provider: 'Internet Archive',
      url: 'https://archive.org/details/example',
      region: 'Global',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title,
      overview: m.overview,
      poster: m.poster,
      releaseYear: m.releaseYear,
      runtime: m.runtime || 90,
      genres: Array.isArray(m.genres) ? m.genres.join(', ') : m.genres,
      languages: Array.isArray(m.languages) ? m.languages.join(', ') : m.languages,
      director: m.director || 'Unknown',
      cast: Array.isArray(m.cast) ? m.cast.join(', ') : m.cast || '',
      moodTags: Array.isArray(m.moodTags) ? m.moodTags.join(', ') : m.moodTags,
      moodExplanation: m.moodExplanation || '',
      availabilityType: m.freeAvailability?.type || 'Public Domain',
      provider: m.freeAvailability?.provider || 'Internet Archive',
      url: m.freeAvailability?.url || '',
      region: m.freeAvailability?.region || 'Global',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    const payload = {
      title: movieForm.title,
      overview: movieForm.overview,
      poster: movieForm.poster,
      releaseYear: Number(movieForm.releaseYear),
      runtime: Number(movieForm.runtime),
      genres: movieForm.genres.split(',').map((g) => g.trim()),
      languages: movieForm.languages.split(',').map((l) => l.trim()),
      director: movieForm.director,
      cast: movieForm.cast ? movieForm.cast.split(',').map((c) => c.trim()) : [],
      moodTags: movieForm.moodTags.split(',').map((m) => m.trim().toLowerCase()),
      moodExplanation: movieForm.moodExplanation,
      freeAvailability: {
        type: movieForm.availabilityType,
        provider: movieForm.provider,
        region: movieForm.region,
        url: movieForm.url,
      },
    };

    try {
      if (editingMovie) {
        const res = await api.put(`/admin/movies/${editingMovie._id}`, payload);
        if (res.data.success) {
          setMoviesList((prev) =>
            prev.map((m) => (m._id === editingMovie._id ? res.data.movie : m))
          );
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/movies', payload);
        if (res.data.success) {
          setMoviesList([res.data.movie, ...moviesList]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}" and all related user interactions?`)) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      setMoviesList((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review as administrator?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviewsList((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <div className="admin-page page-wrapper container">
      {/* ── Admin Header ─────────────────────────────────── */}
      <div className="section-head admin-head">
        <div>
          <span className="badge badge-free-streaming admin-pill">
            <Shield size={14} /> ROLE: ADMINISTRATOR
          </span>
          <h2>Platform Control Center</h2>
          <p>Real-time MongoDB Atlas operations, verified stream management, and user governance.</p>
        </div>

        <button type="button" onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Free Movie</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Connecting to database metrics & collections..." />
      ) : (
        <>
          {/* ── Key Metrics Cards ──────────────────────────── */}
          <div className="stats-row">
            <div className="stat-card glass-panel">
              <Film size={26} className="stat-icon-color icon-purple" />
              <div className="stat-text">
                <span className="stat-number">{stats?.totalMovies || moviesList.length}</span>
                <span className="stat-title">Catalog Movies</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <Users size={26} className="stat-icon-color icon-blue" />
              <div className="stat-text">
                <span className="stat-number">{stats?.totalUsers || usersList.length}</span>
                <span className="stat-title">Registered Users</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <MessageSquare size={26} className="stat-icon-color icon-amber" />
              <div className="stat-text">
                <span className="stat-number">{stats?.totalReviews || reviewsList.length}</span>
                <span className="stat-title">Audience Reviews</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <CheckCircle size={26} className="stat-icon-color icon-green" />
              <div className="stat-text">
                <span className="stat-number">
                  {stats?.availabilityByType?.publicDomain || 0}
                </span>
                <span className="stat-title">Public Domain Works</span>
              </div>
            </div>
          </div>

          {/* ── Link Health & Streaming Verification Card ─── */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0e1628] to-emerald-950/30 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Stream Link Health & Verification Engine</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    Active
                  </span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Audit YouTube full movie search routes, subscription platform queries, and ensure zero dead links for users.
                </p>
                {linkVerifyResult && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    ✓ Audit complete: Checked {linkVerifyResult.totalChecked} movies. Verified: {linkVerifyResult.verifiedCount}, Auto-healed: {linkVerifyResult.updatedCount}.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyLinks}
              disabled={verifyingLinks}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all flex-shrink-0 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw size={13} className={verifyingLinks ? 'animate-spin' : ''} />
              <span>{verifyingLinks ? 'Auditing Links...' : 'Audit & Verify Stream Links'}</span>
            </button>
          </div>

          {/* ── Dashboard Tabs ─────────────────────────────── */}
          <div className="admin-tabs-bar">
            <button
              type="button"
              onClick={() => setActiveTab('movies')}
              className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
            >
              <Film size={16} /> Movie Records ({moviesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={16} /> User Accounts ({usersList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              <MessageSquare size={16} /> Review Moderation ({reviewsList.length})
            </button>
          </div>

          {/* ── TAB 1: MOVIES LIST ─────────────────────────── */}
          {activeTab === 'movies' && (
            <div className="admin-table-container glass-panel animate-fade-in">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title & Release</th>
                    <th>Free Availability Type</th>
                    <th>Provider</th>
                    <th>Verified URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moviesList.map((m) => (
                    <tr key={m._id}>
                      <td className="poster-cell">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="table-poster-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100';
                          }}
                        />
                      </td>
                      <td>
                        <strong>{m.title}</strong>
                        <div className="table-subtext">{m.releaseYear} • {m.runtime} min</div>
                      </td>
                      <td>
                        <span className={`badge ${m.freeAvailability?.type === 'Public Domain' ? 'badge-public-domain' : 'badge-free-streaming'}`}>
                          {m.freeAvailability?.type || 'Free'}
                        </span>
                      </td>
                      <td>{m.freeAvailability?.provider || 'Unknown'}</td>
                      <td>
                        <a
                          href={m.freeAvailability?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="table-link"
                        >
                          <span>Open Link</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            className="btn-table-action"
                            title="Edit Movie"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMovie(m._id, m.title)}
                            className="btn-table-action btn-danger-action"
                            title="Delete Movie"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 2: USERS LIST ──────────────────────────── */}
          {activeTab === 'users' && (
            <div className="admin-table-container glass-panel animate-fade-in">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-free-streaming' : 'badge-public-domain'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 3: REVIEWS LIST ────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className="admin-table-container glass-panel animate-fade-in">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Author</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Moderate</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewsList.map((r) => (
                    <tr key={r._id}>
                      <td><strong>{r.movie?.title || 'Unknown'}</strong></td>
                      <td>{r.user?.name || 'Anonymous'}</td>
                      <td>★ {r.rating} / 5</td>
                      <td className="comment-cell">{r.comment}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r._id)}
                          className="btn-table-action btn-danger-action"
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Add / Edit Movie Modal ───────────────────────── */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card glass-panel animate-fade-in">
            <div className="modal-head">
              <h3>{editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Verified Free Movie'}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            {formError && <div className="modal-error-box">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Movie Title</label>
                  <input
                    type="text"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Poster Path / URL</label>
                  <input
                    type="text"
                    placeholder="/posters/my-movie.jpg or https://..."
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Overview / Synopsis</label>
                <textarea
                  rows="2"
                  value={movieForm.overview}
                  onChange={(e) => setMovieForm({ ...movieForm, overview: e.target.value })}
                  className="form-textarea"
                  required
                ></textarea>
              </div>

              <div className="modal-grid-3">
                <div className="form-group">
                  <label className="form-label">Release Year</label>
                  <input
                    type="number"
                    value={movieForm.releaseYear}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseYear: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Runtime (minutes)</label>
                  <input
                    type="number"
                    value={movieForm.runtime}
                    onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genres}
                    onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mood Tags (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.moodTags}
                    onChange={(e) => setMovieForm({ ...movieForm, moodTags: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Free Availability Group */}
              <div className="modal-free-box">
                <span className="free-box-title">Verified Legal Free Availability</span>
                <div className="modal-grid-3">
                  <div className="form-group">
                    <label className="form-label">Free Type</label>
                    <select
                      value={movieForm.availabilityType}
                      onChange={(e) => setMovieForm({ ...movieForm, availabilityType: e.target.value })}
                      className="form-select"
                    >
                      <option value="Public Domain">Public Domain</option>
                      <option value="Free Official Streaming">Free Official Streaming</option>
                      <option value="Ad-Supported Free">Ad-Supported Free</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Provider Name</label>
                    <input
                      type="text"
                      placeholder="Internet Archive, Plex, YouTube Free..."
                      value={movieForm.provider}
                      onChange={(e) => setMovieForm({ ...movieForm, provider: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <input
                      type="text"
                      value={movieForm.region}
                      onChange={(e) => setMovieForm({ ...movieForm, region: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Verified Viewing URL</label>
                  <input
                    type="url"
                    placeholder="https://archive.org/details/..."
                    value={movieForm.url}
                    onChange={(e) => setMovieForm({ ...movieForm, url: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary"
                >
                  {formSubmitting ? 'Saving to Database...' : editingMovie ? 'Update Movie' : 'Create Free Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .admin-pill {
          margin-bottom: 0.5rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .stat-icon-color { flex-shrink: 0; }
        .icon-purple { color: #c084fc; }
        .icon-blue { color: #38bdf8; }
        .icon-amber { color: #fbbf24; }
        .icon-green { color: #34d399; }
        .stat-text {
          display: flex;
          flex-direction: column;
        }
        .stat-number {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .stat-title {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .admin-tabs-bar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.75rem;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .tab-btn.active {
          color: #fff;
          background: var(--surface-2);
          border: 1px solid var(--border);
        }
        .admin-table-container {
          overflow-x: auto;
          padding: 0.5rem;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }
        .admin-table th {
          padding: 1rem 0.85rem;
          color: var(--text-dim);
          border-bottom: 1px solid var(--border-subtle);
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
        }
        .admin-table td {
          padding: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          vertical-align: middle;
        }
        .poster-cell { width: 50px; }
        .table-poster-thumb {
          width: 40px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }
        .table-subtext {
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .table-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #38bdf8;
          font-size: 0.78rem;
        }
        .table-link:hover { text-decoration: underline; }
        .table-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-table-action {
          padding: 0.4rem;
          border-radius: 4px;
          color: var(--text-muted);
          transition: color 0.2s, background 0.2s;
        }
        .btn-table-action:hover {
          color: #fff;
          background: var(--surface-2);
        }
        .btn-danger-action:hover {
          color: #f87171;
        }
        .comment-cell {
          max-width: 320px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2.25rem;
          background: var(--surface);
          border: 1px solid var(--border);
        }
        .modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .modal-head h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: #fff;
        }
        .modal-close-btn {
          color: var(--text-dim);
        }
        .modal-close-btn:hover { color: #fff; }
        .modal-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .modal-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }
        .modal-free-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1rem;
          margin: 1rem 0;
        }
        .free-box-title {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #34d399;
          font-weight: 700;
          margin-bottom: 0.85rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .modal-error-box {
          padding: 0.65rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 650px) {
          .modal-grid-2, .modal-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
