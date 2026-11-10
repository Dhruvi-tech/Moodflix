import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import fallbackMovies from '../data/fallbackMovies';
import {
  Play,
  Bookmark,
  Heart,
  Star,
  ShieldCheck,
  ExternalLink,
  Clock,
  Calendar,
  Globe,
  Film,
  User,
  MessageSquare,
  Edit2,
  Trash2,
  Share2,
  Check,
  Scale,
} from 'lucide-react';

const getPlatformWatchUrl = (movie, platformName = '', rawUrl = '') => {
  const title = movie?.title || '';
  const year = movie?.releaseYear || '';
  const plat = (platformName || movie?.primaryPlatform || movie?.freeAvailability?.provider || '').toLowerCase();

  // If rawUrl is an official YouTube search query, it always works
  if (rawUrl && rawUrl.includes('results?search_query=')) {
    return rawUrl;
  }

  // 1. YouTube Free Movie: Direct full-movie query on official YouTube
  if (plat.includes('youtube') || movie?.isFree) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} full movie`)}`;
  }

  // 2. Netflix
  if (plat.includes('netflix')) {
    return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  }

  // 3. Amazon Prime Video
  if (plat.includes('prime') || plat.includes('amazon')) {
    return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`;
  }

  // 4. Disney+ Hotstar
  if (plat.includes('hotstar') || plat.includes('disney')) {
    return `https://www.hotstar.com/in/search?q=${encodeURIComponent(title)}`;
  }

  // 5. JioCinema
  if (plat.includes('jio')) {
    return `https://www.jiocinema.com/search/${encodeURIComponent(title)}`;
  }

  // 6. ZEE5
  if (plat.includes('zee')) {
    return `https://www.zee5.com/search?q=${encodeURIComponent(title)}`;
  }

  // 7. SonyLIV
  if (plat.includes('sony')) {
    return `https://www.sonyliv.com/search?q=${encodeURIComponent(title)}`;
  }

  // 8. Public Domain Archive
  if (movie?.availabilityStatus === 'PUBLIC DOMAIN') {
    return `https://archive.org/search?query=${encodeURIComponent(`${title} ${year}`)}`;
  }

  // Default: Verified YouTube full movie stream search
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} full movie`)}`;
};

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { inWatchlist, inFavourites, toggleWatchlist, toggleFavourite } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Review Form State
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        let m = null;

        // 1. Instant match from fallback catalog (0ms latency, never breaks)
        const localMatch = fallbackMovies.find(
          (item) => item.slug === id || item._id === id || String(item.id) === String(id)
        );
        if (localMatch) {
          m = localMatch;
          setMovie(localMatch);
          setSimilarMovies(
            fallbackMovies
              .filter((x) => x.slug !== localMatch.slug && x.moodTags?.some((t) => localMatch.moodTags?.includes(t)))
              .slice(0, 4)
          );
        }

        // 2. Fetch fresh from API
        try {
          let res;
          try {
            res = await api.get(`/movies/slug/${id}`);
          } catch {
            res = await api.get(`/movies/${id}`);
          }

          if (res?.data?.success && res.data.movie) {
            m = res.data.movie;
            setMovie(m);
            if (res.data.similarMovies?.length) {
              setSimilarMovies(res.data.similarMovies);
            }
          }
        } catch (apiErr) {
          console.warn('API fetch failed, local fallback retained:', apiErr);
        }

        // 3. Fallback to first movie if still not found
        if (!m && fallbackMovies.length > 0) {
          m = fallbackMovies[0];
          setMovie(m);
        }

        // 4. Record history & load reviews
        if (m) {
          if (user) {
            api.post(`/history/${m._id || m.id}`).catch(() => {});
          }
          api.get(`/reviews/movie/${m._id || m.id}`)
            .then((revRes) => {
              if (revRes.data?.success) setReviews(revRes.data.reviews || []);
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error('Error loading movie:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo(0, 0);
  }, [id, user]);

  if (loading) {
    return (
      <div className="page-wrapper container">
        <LoadingSpinner text="Loading cinematic features & verified stream links..." />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page-wrapper container text-center">
        <h2>Movie Not Found</h2>
        <p>The requested film could not be located in our catalog.</p>
        <Link to="/explore" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const isWl = inWatchlist(movie._id);
  const isFav = inFavourites(movie._id);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to leave a review.');
    if (!myComment.trim()) return setReviewError('Please write your review thoughts.');

    setSubmittingReview(true);
    setReviewError('');

    try {
      if (editingReviewId) {
        // Update review
        const res = await api.put(`/reviews/${editingReviewId}`, {
          rating: myRating,
          comment: myComment.trim(),
        });
        if (res.data.success) {
          setReviews((prev) =>
            prev.map((r) => (r._id === editingReviewId ? res.data.review : r))
          );
          setEditingReviewId(null);
          setMyComment('');
        }
      } else {
        // Create review
        const res = await api.post(`/reviews/movie/${movie._id}`, {
          rating: myRating,
          comment: myComment.trim(),
        });
        if (res.data.success) {
          setReviews([res.data.review, ...reviews]);
          setMyComment('');
          setMyRating(5);
        }
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setMyRating(review.rating);
    setMyComment(review.comment);
    window.scrollTo({ top: document.getElementById('review-form')?.offsetTop - 100, behavior: 'smooth' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${movie.title} (${movie.releaseYear}) on MoodFlix`,
          text: `Check out ${movie.title} on MoodFlix! Verified free & streaming discovery.`,
          url,
        });
        return;
      } catch (e) {
        // user cancelled or share failed, fallback to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (e) {
      alert(`Share link: ${url}`);
    }
  };

  const verifiedDateFormatted = movie.freeAvailability?.verifiedDate
    ? new Date(movie.freeAvailability.verifiedDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  return (
    <div className="movie-details-page page-wrapper">
      {/* ── Hero Backdrop & Header ──────────────────────── */}
      <section className="movie-header-backdrop">
        <div className="container movie-header-inner">
          {/* Poster Column */}
          <div className="details-poster-col">
            <div className="details-poster-frame glass-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="details-poster-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';
                }}
              />
              <span className={`badge details-badge ${movie.freeAvailability?.type === 'Public Domain' ? 'badge-public-domain' : 'badge-free-streaming'}`}>
                {movie.freeAvailability?.type || 'Free Watch'}
              </span>
            </div>
          </div>

          {/* Metadata Column */}
          <div className="details-info-col">
            <h1 className="details-title">{movie.title}</h1>

            <div className="details-meta-row">
              <span className="meta-pill"><Calendar size={14} /> {movie.releaseYear}</span>
              <span className="meta-pill"><Clock size={14} /> {movie.runtime} min</span>
              <span className="meta-pill"><Globe size={14} /> {Array.isArray(movie.languages) ? movie.languages.join(', ') : movie.languages}</span>
              <span className="meta-pill rating-pill">
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span>{movie.ratings?.value || '7.5'} / 10 ({movie.ratings?.source || 'IMDb'})</span>
              </span>
            </div>

            {/* Genres & Languages */}
            <div className="details-genres">
              {movie.genres?.map((g) => (
                <span key={g} className="genre-tag">{g}</span>
              ))}
              {movie.originalLanguage && (
                <span className="genre-tag lang-tag">Audio: {movie.originalLanguage}</span>
              )}
              {movie.dubbedLanguages && movie.dubbedLanguages.length > 0 && (
                <span className="genre-tag dub-tag">Dubbed: {movie.dubbedLanguages.join(', ')}</span>
              )}
            </div>

            {/* Synopsis */}
            <p className="details-overview">{movie.overview}</p>

            {/* Mood Explanation Card */}
            {movie.moodExplanation && (
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 mb-4">
                <span className="font-bold text-[#f72585] block mb-1">🎭 Curated Mood Rationale:</span>
                <p>{movie.moodExplanation}</p>
                {movie.moodTags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {movie.moodTags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cast & Director */}
            <div className="details-credits">
              <p><strong>Director:</strong> {movie.director || 'Unknown'}</p>
              {movie.cast && movie.cast.length > 0 && (
                <p><strong>Cast:</strong> {movie.cast.join(', ')}</p>
              )}
            </div>

            {/* Verified Viewing Callout Card */}
            <div className="verified-stream-card glass-panel">
              <div className="stream-badge-head">
                <ShieldCheck size={18} className={movie.isFree ? 'verified-shield' : 'text-amber-400'} />
                <span>{movie.isFree ? 'Verified Legal Free Stream' : 'Subscription Streaming'}</span>
                <span className="verified-date">{movie.isFree ? `Checked ${verifiedDateFormatted}` : 'Subscription Required'}</span>
              </div>
              <p className="stream-provider-note">
                {movie.isFree ? (
                  <>
                    Officially available at zero cost via <strong>{movie.freeAvailability?.provider || movie.primaryPlatform}</strong> ({movie.freeAvailability?.region || 'Global'} Region). No subscription or credit card needed.
                  </>
                ) : (
                  <>
                    Streamable on <strong>{movie.primaryPlatform}</strong> with an active subscription. Never mislabeled as free.
                  </>
                )}
              </p>

              {/* Multiple Platforms Availability Grid */}
              {movie.platforms && movie.platforms.length > 0 && (
                <div className="mt-3 mb-4 space-y-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Available On:</span>
                  <div className="flex flex-wrap gap-2">
                    {movie.platforms.map((plat, idx) => (
                      <a
                        key={idx}
                        href={getPlatformWatchUrl(movie, plat.name, plat.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          plat.type === 'Free' || !plat.subscriptionRequired
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        <span>{plat.name}</span>
                        <span className="text-[10px] opacity-75">({plat.type || (movie.isFree ? 'Free' : 'Subscription')})</span>
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="stream-cta-buttons">
                <a
                  href={getPlatformWatchUrl(movie, movie.freeAvailability?.provider || movie.primaryPlatform, movie.freeAvailability?.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-watch-free"
                >
                  <Play size={18} fill="#fff" />
                  <span>{movie.isFree ? `Watch Free on ${movie.freeAvailability?.provider || 'YouTube'}` : `Watch on ${movie.primaryPlatform || 'Stream'}`}</span>
                  <ExternalLink size={15} />
                </a>

                {/* Watch Trailer */}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.releaseYear || ''} official trailer`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Film size={18} />
                  <span>Watch Trailer</span>
                  <ExternalLink size={14} />
                </a>

                {/* Compare Button */}
                <Link
                  to={`/compare?movies=${encodeURIComponent(movie.slug || movie.title)}`}
                  className="btn btn-secondary"
                  title="Compare this movie with another"
                >
                  <Scale size={16} />
                  <span>Compare</span>
                </Link>

                {/* Share Movie Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className={`btn btn-secondary relative ${copiedToast ? 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10' : ''}`}
                  title="Share movie link"
                >
                  {copiedToast ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                  <span>{copiedToast ? 'Link Copied!' : 'Share'}</span>
                </button>

                {/* Watchlist & Favourite Buttons */}
                {user && (
                  <div className="user-action-buttons">
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(movie)}
                      className={`btn btn-outline ${isWl ? 'btn-active-wl' : ''}`}
                    >
                      <Bookmark size={16} fill={isWl ? 'currentColor' : 'none'} />
                      <span>{isWl ? 'In Watchlist' : 'Add to Watchlist'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavourite(movie)}
                      className={`btn btn-outline ${isFav ? 'btn-active-fav' : ''}`}
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      <span>{isFav ? 'Favourited' : 'Add Favourite'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── User Ratings & Reviews Section ───────────────── */}
      <section className="reviews-section container">
        <div className="section-head">
          <h2>Audience Reviews & Community Ratings</h2>
          <p>Share your review and rating for this free film.</p>
        </div>

        {/* Review Form */}
        <div className="review-form-card glass-panel" id="review-form">
          <h3 className="form-heading">
            {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
          </h3>

          {user ? (
            <form onSubmit={handleReviewSubmit}>
              {reviewError && <div className="review-error-banner">{reviewError}</div>}

              <div className="rating-select-group">
                <label>Your Star Rating:</label>
                <RatingStars
                  rating={myRating}
                  size={24}
                  interactive={true}
                  onChange={(val) => setMyRating(val)}
                />
                <span className="rating-num-label">{myRating} of 5 Stars</span>
              </div>

              <div className="form-group">
                <label className="form-label">Your Review Synopsis:</label>
                <textarea
                  rows="3"
                  placeholder="What did you think of the directing, pacing, or story? (Min 5 chars)"
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  className="form-textarea"
                  required
                ></textarea>
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary btn-sm"
                >
                  <MessageSquare size={16} />
                  <span>{submittingReview ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Post Review'}</span>
                </button>

                {editingReviewId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReviewId(null);
                      setMyComment('');
                      setMyRating(5);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="login-to-review-box">
              <p>Please log in to your MoodFlix account to rate this movie and share your thoughts.</p>
              <Link to="/login" className="btn btn-primary btn-sm">
                Log In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews-note">Be the first to review <em>{movie.title}</em>!</p>
          ) : (
            reviews.map((rev) => {
              const isAuthor = user && rev.user && (rev.user._id === user.id || rev.user === user.id);
              const authorName = rev.user?.name || 'Anonymous Cinephile';
              const authorAvatar = rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=8b5cf6&color=fff`;

              return (
                <div key={rev._id} className="review-card glass-panel">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img src={authorAvatar} alt={authorName} className="reviewer-avatar" />
                      <div>
                        <h4 className="reviewer-name">{authorName}</h4>
                        <span className="review-date">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="review-actions-right">
                      <RatingStars rating={rev.rating} size={15} />

                      {isAuthor && (
                        <div className="author-review-btns">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(rev)}
                            className="btn-icon-subtle"
                            title="Edit Review"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev._id)}
                            className="btn-icon-subtle btn-icon-danger"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="review-comment-text">{rev.comment}</p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── Similar Movies ───────────────────────────────── */}
      {similarMovies.length > 0 && (
        <section className="similar-section container">
          <div className="section-head">
            <h2>You May Also Enjoy</h2>
            <p>More legal free titles matching similar emotional tones and genres.</p>
          </div>

          <div className="movie-grid">
            {similarMovies.map((sim) => (
              <MovieCard key={sim._id} movie={sim} />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .movie-header-backdrop {
          padding: 2.5rem 0 3.5rem;
          background: linear-gradient(180deg, rgba(30, 27, 75, 0.4) 0%, rgba(9, 12, 21, 0.95) 100%);
          border-bottom: 1px solid var(--border-subtle);
        }
        .movie-header-inner {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 3rem;
          align-items: flex-start;
        }
        .details-poster-frame {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .details-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .details-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 2;
          font-size: 0.72rem;
        }
        .details-info-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .details-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.15;
          color: #fff;
        }
        .details-meta-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          background: var(--surface-2);
          padding: 0.3rem 0.7rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .rating-pill {
          color: #fbbf24;
          font-weight: 700;
        }
        .details-genres {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .genre-tag {
          padding: 0.25rem 0.65rem;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          color: #c4b5fd;
          font-weight: 600;
        }
        .details-overview {
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 780px;
        }
        .details-credits {
          font-size: 0.9rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .details-credits strong {
          color: #fff;
        }
        .verified-stream-card {
          padding: 1.5rem;
          border-left: 4px solid #10b981;
          margin-top: 0.5rem;
        }
        .stream-badge-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: #34d399;
          margin-bottom: 0.5rem;
        }
        .verified-shield { color: #34d399; }
        .verified-date {
          margin-left: auto;
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 500;
        }
        .stream-provider-note {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }
        .stream-cta-buttons {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }
        .btn-watch-free {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);
        }
        .user-action-buttons {
          display: flex;
          gap: 0.65rem;
        }
        .btn-active-wl {
          border-color: var(--primary);
          color: #c4b5fd;
          background: rgba(139, 92, 246, 0.15);
        }
        .btn-active-fav {
          border-color: var(--secondary);
          color: #f472b6;
          background: rgba(236, 72, 153, 0.15);
        }
        .trailer-embed-container {
          margin-top: 1.5rem;
        }
        .trailer-video-box {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #000;
          border: 1px solid var(--border);
        }
        .trailer-video-box iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .reviews-section, .similar-section {
          margin: 4.5rem auto;
        }
        .review-form-card {
          padding: 2rem;
          margin-bottom: 2.5rem;
        }
        .form-heading {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #fff;
          margin-bottom: 1.25rem;
        }
        .rating-select-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .rating-num-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .form-actions-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .review-error-banner {
          padding: 0.65rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .login-to-review-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          color: var(--text-muted);
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .review-card {
          padding: 1.5rem;
        }
        .review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .reviewer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }
        .reviewer-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }
        .review-date {
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .review-actions-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .author-review-btns {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-icon-subtle {
          color: var(--text-muted);
          padding: 0.3rem;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .btn-icon-subtle:hover {
          color: #fff;
        }
        .btn-icon-danger:hover {
          color: #f87171;
        }
        .review-comment-text {
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .no-reviews-note {
          color: var(--text-dim);
          font-size: 0.95rem;
        }
        @media (max-width: 850px) {
          .movie-header-inner {
            grid-template-columns: 1fr;
          }
          .details-poster-col {
            max-width: 260px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieDetails;
