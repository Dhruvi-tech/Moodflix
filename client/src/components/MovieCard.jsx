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
  const getBadgeClass = (type) => {
    if (type === 'Public Domain') return 'badge-public-domain';
    if (type === 'Free Official Streaming') return 'badge-free-streaming';
    return 'badge-ad-supported';
  };

  const movieLink = `/movies/${movie.slug || movie._id}`;

  return (
    <article className="movie-card glass-card">
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

        {/* Free Availability Badge */}
        {movie.freeAvailability?.type && (
          <span className={`badge ${getBadgeClass(movie.freeAvailability.type)} movie-badge`}>
            {movie.freeAvailability.type}
          </span>
        )}

        {/* Rating Floating Badge */}
        {movie.ratings?.value && (
          <span className="movie-rating-badge">
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>{movie.ratings.value}</span>
          </span>
        )}

        {/* Quick Action Overlay Buttons */}
        {user && (
          <div className="movie-quick-actions">
            <button
              type="button"
              onClick={handleWlClick}
              className={`quick-action-btn ${isWl ? 'active' : ''}`}
              title={isWl ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark size={15} fill={isWl ? '#8b5cf6' : 'none'} />
            </button>
            <button
              type="button"
              onClick={handleFavClick}
              className={`quick-action-btn ${isFav ? 'active' : ''}`}
              title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
            >
              <Heart size={15} fill={isFav ? '#ec4899' : 'none'} color={isFav ? '#ec4899' : 'currentColor'} />
            </button>
          </div>
        )}

        {/* Hover Play Overlay */}
        <div className="poster-play-overlay">
          <div className="play-icon-circle">
            <Play size={20} fill="#fff" />
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
          <span>{movie.releaseYear}</span>
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
          border-radius: var(--radius-md);
          background: var(--surface);
          position: relative;
        }
        .movie-card-poster-wrapper {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          background: #0a0d14;
          display: block;
        }
        .movie-card-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .movie-card:hover .movie-card-poster {
          transform: scale(1.06);
        }
        .movie-badge {
          position: absolute;
          top: 0.6rem;
          left: 0.6rem;
          z-index: 2;
          font-size: 0.65rem;
          backdrop-filter: blur(8px);
        }
        .movie-rating-badge {
          position: absolute;
          top: 0.6rem;
          right: 0.6rem;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.5rem;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }
        .movie-quick-actions {
          position: absolute;
          bottom: 0.6rem;
          right: 0.6rem;
          z-index: 3;
          display: flex;
          gap: 0.35rem;
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.25s ease;
        }
        .movie-card:hover .movie-quick-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .quick-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(16, 22, 37, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-subtle);
          color: #fff;
          display: grid;
          place-items: center;
          transition: transform 0.2s, background 0.2s;
        }
        .quick-action-btn:hover {
          transform: scale(1.1);
          background: var(--surface-2);
          border-color: var(--primary);
        }
        .quick-action-btn.active {
          border-color: var(--primary);
        }
        .poster-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(9, 12, 21, 0.4);
          display: grid;
          place-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .movie-card:hover .poster-play-overlay {
          opacity: 1;
        }
        .play-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: grid;
          place-items: center;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
          transform: scale(0.85);
          transition: transform 0.25s ease;
        }
        .movie-card:hover .play-icon-circle {
          transform: scale(1);
        }
        .movie-card-content {
          padding: 0.85rem 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          flex: 1;
        }
        .movie-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
          transition: color 0.2s;
        }
        .movie-card-title:hover {
          color: var(--primary);
        }
        .movie-card-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .dot {
          color: var(--text-dim);
        }
        .genres-span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .movie-provider-info {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          margin-top: 0.2rem;
        }
        .provider-label {
          color: var(--text-dim);
        }
        .provider-name {
          color: #38bdf8;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </article>
  );
};

export default MovieCard;
