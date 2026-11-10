import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Heart, Play } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';

const MovieCard = ({ movie }) => {
  const { user } = useAuth();
  const { inWatchlist, inFavourites, toggleWatchlist, toggleFavourite } = useWatchlist();

  const isWl = inWatchlist(movie._id || movie.id);
  const isFav = inFavourites(movie._id || movie.id);

  const handleWlClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWatchlist(movie);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFavClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavourite(movie);
    } catch (err) {
      alert(err.message);
    }
  };

  // Availability badge styling
  const renderBadge = () => {
    if (movie.isFree) {
      if (movie.availabilityStatus === 'PUBLIC DOMAIN') {
        return (
          <span className="movie-badge badge-public-domain">
            <span className="badge-dot dot-violet"></span>
            Public Domain
          </span>
        );
      }
      if (movie.availabilityStatus === 'FREE WITH ADS') {
        return (
          <span className="movie-badge badge-ad-supported">
            <span className="badge-dot dot-amber"></span>
            Free with Ads
          </span>
        );
      }
      return (
        <span className="movie-badge badge-free-streaming">
          <span className="badge-dot dot-green"></span>
          Free to Watch
        </span>
      );
    }

    // Subscription required
    const platformName = movie.primaryPlatform || 'Subscription';
    return (
      <span className="movie-badge badge-subscription">
        🔒 {platformName}
      </span>
    );
  };

  const primaryLang = movie.originalLanguage || (movie.languages && movie.languages[0]) || '';
  const movieLink = `/movies/${movie.slug || movie._id || movie.id}`;

  const directWatchUrl = movie.isFree
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.releaseYear || ''} full movie`)}`
    : (movie.primaryPlatform === 'Netflix'
        ? `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`
        : movie.primaryPlatform === 'Hotstar'
          ? `https://www.hotstar.com/in/search?q=${encodeURIComponent(movie.title)}`
          : `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(movie.title)}`);

  return (
    <article className="movie-card group">
      <Link to={movieLink} className="movie-card-poster-wrapper">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="movie-card-poster"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
          }}
        />

        {/* Top Gradient Vignette */}
        <div className="poster-top-vignette" />

        {/* Availability Badge */}
        {renderBadge()}

        {/* Language Pill */}
        {primaryLang && (
          <span className="movie-lang-badge">
            {primaryLang}
          </span>
        )}

        {/* Rating Floating Badge */}
        {movie.ratings?.value && (
          <span className="movie-rating-badge">
            <Star size={11} fill="#fbbf24" color="#fbbf24" />
            <span>{movie.ratings.value}</span>
          </span>
        )}

        {/* Quick Action Overlay Buttons */}
        <div className="movie-quick-actions">
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="quick-action-btn"
            title={movie.isFree ? `Watch Free on ${movie.freeAvailability?.provider || 'YouTube'}` : `Watch on ${movie.primaryPlatform || 'Stream'}`}
          >
            <Play size={13} fill="#fff" />
          </a>
          {user && (
            <>
              <button
                type="button"
                onClick={handleWlClick}
                className={`quick-action-btn ${isWl ? 'active' : ''}`}
                title={isWl ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Bookmark size={14} fill={isWl ? '#8b5cf6' : 'none'} color={isWl ? '#a78bfa' : '#fff'} />
              </button>
              <button
                type="button"
                onClick={handleFavClick}
                className={`quick-action-btn ${isFav ? 'active' : ''}`}
                title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
              >
                <Heart size={14} fill={isFav ? '#ec4899' : 'none'} color={isFav ? '#f472b6' : '#fff'} />
              </button>
            </>
          )}
        </div>

        {/* Hover Play Overlay */}
        <div className="poster-play-overlay">
          <div className="play-icon-circle">
            <Play size={20} fill="#fff" className="translate-x-0.5" />
          </div>
        </div>
      </Link>

      <div className="movie-card-content">
        <Link to={movieLink}>
          <h3 className="movie-card-title" title={movie.title}>
            {movie.title}
          </h3>
        </Link>

        <div className="movie-card-meta">
          <span className="meta-year">{movie.releaseYear}</span>
          <span className="dot">•</span>
          <span className="genres-span">{Array.isArray(movie.genres) ? movie.genres.slice(0, 2).join(', ') : movie.genres}</span>
        </div>

        {movie.freeAvailability?.provider && (
          <div className="movie-provider-info">
            <span className="provider-label">Free on:</span>
            <span className="provider-name">{movie.freeAvailability.provider}</span>
          </div>
        )}
      </div>

      <style>{`
        .movie-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 14px;
          background: #0f1629;
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease;
        }
        .movie-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(168, 85, 247, 0.55);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.75), 0 0 25px rgba(139, 92, 246, 0.35);
        }
        .movie-card-poster-wrapper {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          background: #090c15;
          display: block;
        }
        .movie-card-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .movie-card:hover .movie-card-poster {
          transform: scale(1.08);
        }
        .poster-top-vignette {
          position: absolute;
          inset: 0 0 50% 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.65) 0%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }
        .movie-badge {
          position: absolute;
          top: 0.65rem;
          left: 0.65rem;
          z-index: 2;
          font-size: 0.65rem;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 0.22rem 0.55rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-green {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .dot-violet {
          background: #a855f7;
          box-shadow: 0 0 8px #a855f7;
        }
        .dot-amber {
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }
        .badge-free-streaming {
          background: rgba(6, 78, 59, 0.85);
          color: #6ee7b7;
          border: 1px solid rgba(52, 211, 153, 0.4);
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.25);
        }
        .badge-public-domain {
          background: rgba(88, 28, 135, 0.85);
          color: #d8b4fe;
          border: 1px solid rgba(167, 139, 250, 0.4);
          box-shadow: 0 2px 10px rgba(139, 92, 246, 0.25);
        }
        .badge-ad-supported {
          background: rgba(120, 53, 15, 0.85);
          color: #fde68a;
          border: 1px solid rgba(245, 158, 11, 0.4);
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.25);
        }
        .badge-subscription {
          background: rgba(15, 23, 42, 0.85);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 700;
        }
        .movie-lang-badge {
          position: absolute;
          bottom: 0.65rem;
          left: 0.65rem;
          z-index: 2;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          background: rgba(15, 23, 42, 0.82);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          letter-spacing: 0.04em;
        }
        .movie-rating-badge {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        .movie-quick-actions {
          position: absolute;
          bottom: 0.65rem;
          right: 0.65rem;
          z-index: 3;
          display: flex;
          gap: 0.4rem;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .movie-card:hover .movie-quick-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .quick-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(15, 22, 40, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          display: grid;
          place-items: center;
          transition: transform 0.2s, background 0.2s, border-color 0.2s;
        }
        .quick-action-btn:hover {
          transform: scale(1.15);
          background: #1e293b;
          border-color: #a855f7;
        }
        .quick-action-btn.active {
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.2);
        }
        .poster-play-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(15, 22, 41, 0.4) 0%, rgba(7, 9, 19, 0.75) 100%);
          display: grid;
          place-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .movie-card:hover .poster-play-overlay {
          opacity: 1;
        }
        .play-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          display: grid;
          place-items: center;
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.65), 0 0 10px rgba(139, 92, 246, 0.8);
          transform: scale(0.8);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .movie-card:hover .play-icon-circle {
          transform: scale(1.05);
        }
        .movie-card-content {
          padding: 0.9rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          background: linear-gradient(180deg, rgba(15, 22, 41, 0.6) 0%, #0f1629 100%);
        }
        .movie-card-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.35;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }
        .movie-card:hover .movie-card-title {
          color: #c084fc;
        }
        .movie-card-meta {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: #94a3b8;
        }
        .meta-year {
          color: #cbd5e1;
          font-weight: 500;
        }
        .dot {
          color: #64748b;
        }
        .genres-span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #94a3b8;
        }
        .movie-provider-info {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          margin-top: 0.25rem;
          padding-top: 0.35rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .provider-label {
          color: #64748b;
          font-weight: 500;
        }
        .provider-name {
          color: #38bdf8;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </article>
  );
};

export default MovieCard;
