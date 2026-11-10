import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Heart, Play, ExternalLink } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { getDirectMovieWatchUrl, getWatchButtonInfo } from '../utils/platformFilter';

const MovieCard = ({ movie }) => {
  const { user } = useAuth();
  const { inWatchlist, inFavourites, toggleWatchlist, toggleFavourite } = useWatchlist();

  if (!movie) return null;

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

  // Determine watch info and verified direct streaming link
  const watchInfo = getWatchButtonInfo(movie);
  const directWatchUrl = getDirectMovieWatchUrl(movie);

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

    const pLower = (movie.primaryPlatform || '').toLowerCase();
    if (pLower.includes('netflix')) {
      return (
        <span className="movie-badge badge-netflix">
          🎬 Netflix
        </span>
      );
    }
    if (pLower.includes('prime') || pLower.includes('amazon')) {
      return (
        <span className="movie-badge badge-prime">
          🍿 Prime Video
        </span>
      );
    }
    if (pLower.includes('hotstar') || pLower.includes('disney')) {
      return (
        <span className="movie-badge badge-hotstar">
          ⭐ Hotstar
        </span>
      );
    }
    if (pLower.includes('jio')) {
      return (
        <span className="movie-badge badge-jiocinema">
          📺 JioCinema
        </span>
      );
    }

    return (
      <span className="movie-badge badge-subscription">
        🔒 {movie.primaryPlatform || 'Subscription'}
      </span>
    );
  };

  const primaryLang = movie.originalLanguage || (movie.languages && movie.languages[0]) || '';
  const movieLink = `/movies/${movie.slug || movie._id || movie.id}`;

  return (
    <article className="movie-card group">
      {/* Poster Wrapper with clean, non-nested links */}
      <div className="movie-card-poster-wrapper">
        <Link to={movieLink} className="poster-image-link" aria-label={`View details for ${movie.title}`}>
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
        </Link>

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
            className="quick-action-btn"
            title={watchInfo.label}
          >
            <Play size={12} fill="#fff" />
          </a>
          {user && (
            <>
              <button
                type="button"
                onClick={handleWlClick}
                className={`quick-action-btn ${isWl ? 'active' : ''}`}
                title={isWl ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Bookmark size={13} fill={isWl ? '#8b5cf6' : 'none'} color={isWl ? '#a78bfa' : '#fff'} />
              </button>
              <button
                type="button"
                onClick={handleFavClick}
                className={`quick-action-btn ${isFav ? 'active' : ''}`}
                title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
              >
                <Heart size={13} fill={isFav ? '#ec4899' : 'none'} color={isFav ? '#f472b6' : '#fff'} />
              </button>
            </>
          )}
        </div>

        {/* Direct Watch Stream Overlay */}
        <a
          href={directWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="poster-play-overlay"
          title={watchInfo.label}
        >
          <div className="play-icon-circle">
            <Play size={18} fill="#fff" className="translate-x-0.5" />
          </div>
        </a>
      </div>

      {/* Card Content & Action Buttons */}
      <div className="movie-card-content">
        <Link to={movieLink}>
          <h3 className="movie-card-title" title={movie.title}>
            {movie.title}
          </h3>
        </Link>

        <div className="movie-card-meta">
          <span className="meta-year">{movie.releaseYear}</span>
          <span className="dot">•</span>
          <span className="genres-span">
            {Array.isArray(movie.genres) ? movie.genres.slice(0, 2).join(', ') : movie.genres}
          </span>
        </div>

        {/* Direct Platform Streaming Button */}
        <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between gap-1.5">
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="direct-stream-link"
            style={{ borderColor: `${watchInfo.color}60` }}
          >
            <Play size={11} fill="currentColor" color={watchInfo.color} />
            <span className="truncate">{watchInfo.label}</span>
            <ExternalLink size={10} className="flex-shrink-0 opacity-70" />
          </a>

          <Link
            to={movieLink}
            className="details-link-btn"
            title="View Details & Reviews"
          >
            Details
          </Link>
        </div>
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
          transform: translateY(-6px);
          border-color: rgba(168, 85, 247, 0.55);
          box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.75), 0 0 20px rgba(139, 92, 246, 0.3);
        }
        .movie-card-poster-wrapper {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          background: #090c15;
          display: block;
        }
        .poster-image-link {
          display: block;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .movie-card-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .movie-card:hover .movie-card-poster {
          transform: scale(1.06);
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
          top: 0.55rem;
          left: 0.55rem;
          z-index: 2;
          font-size: 0.62rem;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          text-transform: uppercase;
          pointer-events: none;
        }
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-green {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }
        .dot-violet {
          background: #a855f7;
        }
        .dot-amber {
          background: #f59e0b;
        }
        .badge-free-streaming {
          background: rgba(6, 78, 59, 0.9);
          color: #6ee7b7;
          border: 1px solid rgba(52, 211, 153, 0.45);
        }
        .badge-netflix {
          background: rgba(185, 28, 28, 0.9);
          color: #fecaca;
          border: 1px solid rgba(239, 68, 68, 0.5);
          box-shadow: 0 2px 8px rgba(229, 9, 20, 0.3);
        }
        .badge-prime {
          background: rgba(3, 105, 161, 0.9);
          color: #bae6fd;
          border: 1px solid rgba(14, 165, 233, 0.5);
          box-shadow: 0 2px 8px rgba(0, 168, 225, 0.3);
        }
        .badge-hotstar {
          background: rgba(30, 58, 138, 0.9);
          color: #bfdbfe;
          border: 1px solid rgba(59, 130, 246, 0.5);
        }
        .badge-jiocinema {
          background: rgba(131, 24, 67, 0.9);
          color: #fbcfe8;
          border: 1px solid rgba(236, 72, 153, 0.5);
        }
        .badge-public-domain {
          background: rgba(88, 28, 135, 0.9);
          color: #d8b4fe;
          border: 1px solid rgba(167, 139, 250, 0.45);
        }
        .badge-ad-supported {
          background: rgba(120, 53, 15, 0.9);
          color: #fde68a;
          border: 1px solid rgba(245, 158, 11, 0.45);
        }
        .badge-subscription {
          background: rgba(15, 23, 42, 0.9);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .movie-lang-badge {
          position: absolute;
          bottom: 0.55rem;
          left: 0.55rem;
          z-index: 2;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          background: rgba(15, 23, 42, 0.85);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          backdrop-filter: blur(6px);
          pointer-events: none;
        }
        .movie-rating-badge {
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0.15rem 0.45rem;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(251, 191, 36, 0.35);
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #fff;
          pointer-events: none;
        }
        .movie-quick-actions {
          position: absolute;
          bottom: 0.55rem;
          right: 0.55rem;
          z-index: 4;
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
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(15, 22, 40, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          display: grid;
          place-items: center;
          transition: transform 0.2s, background 0.2s;
        }
        .quick-action-btn:hover {
          transform: scale(1.15);
          background: #1e293b;
        }
        .poster-play-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(15, 22, 41, 0.35) 0%, rgba(7, 9, 19, 0.7) 100%);
          display: grid;
          place-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
          cursor: pointer;
        }
        .movie-card:hover .poster-play-overlay {
          opacity: 1;
        }
        .play-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          display: grid;
          place-items: center;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
        }
        .movie-card-content {
          padding: 0.75rem 0.85rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          flex: 1;
          background: linear-gradient(180deg, rgba(15, 22, 41, 0.7) 0%, #0f1629 100%);
        }
        .movie-card-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
          transition: color 0.2s ease;
        }
        .movie-card:hover .movie-card-title {
          color: #c084fc;
        }
        .movie-card-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.74rem;
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
        .direct-stream-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.32rem 0.6rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.7rem;
          font-weight: 700;
          color: #f1f5f9;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 0;
        }
        .direct-stream-link:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          transform: translateY(-1px);
        }
        .details-link-btn {
          padding: 0.32rem 0.55rem;
          border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .details-link-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
      `}</style>
    </article>
  );
};

export default MovieCard;
