import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import MoodChip from '../components/MoodChip';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Sparkles, SlidersHorizontal, Info } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';
import { FALLBACK_MOODS } from '../data/fallbackMoods';

const Moods = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVibe = searchParams.get('vibe') || 'happy';

  const [moods, setMoods] = useState(FALLBACK_MOODS);
  const [selectedMoodId, setSelectedMoodId] = useState(initialVibe);
  const [currentMood, setCurrentMood] = useState(
    () => FALLBACK_MOODS.find((m) => m.id === initialVibe) || FALLBACK_MOODS[0]
  );
  const [movies, setMovies] = useState(() =>
    fallbackMovies.filter((m) => m.moodTags?.includes(initialVibe))
  );
  const [genreFilter, setGenreFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Fetch all moods
  useEffect(() => {
    api.get('/moods').then((res) => {
      if (res.data.success && res.data.moods?.length) {
        setMoods(res.data.moods);
        const match = res.data.moods.find((m) => m.id === selectedMoodId) || res.data.moods[0];
        setCurrentMood(match);
      }
    }).catch(() => {});
  }, []);

  // Fetch movies for active mood
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const params = { limit: 12 };
        if (genreFilter !== 'All') params.genre = genreFilter;
        if (languageFilter !== 'All') params.language = languageFilter;

        const res = await api.get(`/movies/mood/${selectedMoodId}`, { params });
        if (res.data.success && res.data.movies?.length) {
          setMovies(res.data.movies);
          setCurrentMood(res.data.mood || FALLBACK_MOODS.find((m) => m.id === selectedMoodId));
        } else {
          const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMoodId));
          setMovies(fb);
        }
      } catch (err) {
        const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMoodId));
        setMovies(fb);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
    setSearchParams({ vibe: selectedMoodId });
  }, [selectedMoodId, genreFilter, languageFilter]);

  const handleMoodClick = (id) => {
    setSelectedMoodId(id);
    setGenreFilter('All');
    setLanguageFilter('All');
  };

  return (
    <div className="moods-page page-wrapper container">
      {/* ── Section Header ───────────────────────────────── */}
      <div className="section-head text-center">
        <h2>Curated Mood Engine</h2>
        <p>Explore twelve emotional palettes designed to find the exact free film matching your psychology right now.</p>
      </div>

      {/* ── 12 Mood Grid ─────────────────────────────────── */}
      <div className="all-moods-grid">
        {moods.map((m) => (
          <MoodChip
            key={m.id}
            mood={m}
            count={m.movieCount}
            active={selectedMoodId === m.id}
            onClick={handleMoodClick}
          />
        ))}
      </div>

      {/* ── Selected Mood Detail Banner ──────────────────── */}
      {currentMood && (
        <div
          className="selected-mood-banner glass-panel"
          style={{ '--accent-color': currentMood.accent || '#8b5cf6' }}
        >
          <div className="mood-banner-left">
            <span className="banner-emoji">{currentMood.emoji}</span>
            <div>
              <h3 className="banner-title">{currentMood.label} Recommendations</h3>
              <p className="banner-tagline">{currentMood.tagline}</p>
            </div>
          </div>

          <div className="mood-algorithm-note">
            <Info size={16} className="info-icon" />
            <span>Deterministic metadata matching across emotional tags, tone, and pacing.</span>
          </div>
        </div>
      )}

      {/* ── Secondary In-Mood Filters ────────────────────── */}
      <div className="in-mood-filters-bar">
        <div className="filter-group-inline">
          <label>Filter by Genre:</label>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="filter-select-sm"
          >
            <option value="All">All Genres</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Adventure">Adventure</option>
            <option value="Romance">Romance</option>
            <option value="Mystery">Mystery</option>
            <option value="Animation">Animation</option>
          </select>
        </div>

        <div className="filter-group-inline">
          <label>Filter by Language:</label>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="filter-select-sm"
          >
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Silent">Silent Cinema</option>
          </select>
        </div>
      </div>

      {/* ── Recommendations Grid ─────────────────────────── */}
      {loading ? (
        <LoadingSpinner text={`Curating ${currentMood?.label || ''} shortlist...`} />
      ) : movies.length === 0 ? (
        <EmptyState
          title={`No ${currentMood?.label} movies found with this filter`}
          description="Try resetting genre and language filters to view all recommendations."
          actionText="Show All Recommendations"
          actionLink="#"
          onActionClick={() => {
            setGenreFilter('All');
            setLanguageFilter('All');
          }}
        />
      ) : (
        <div className="movie-grid animate-fade-in">
          {movies.map((movie) => (
            <div key={movie._id} className="mood-movie-item">
              <MovieCard movie={movie} />
              {movie.moodExplanation && (
                <div className="why-it-matches-box">
                  <span className="why-label">Why it matches:</span>
                  <p>{movie.moodExplanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .text-center {
          text-align: center;
        }
        .text-center p {
          margin-inline: auto;
        }
        .all-moods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.85rem;
          margin-bottom: 2.5rem;
        }
        .selected-mood-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2rem;
          margin-bottom: 1.75rem;
          border-left: 4px solid var(--accent-color);
          background: linear-gradient(90deg, color-mix(in srgb, var(--accent-color) 12%, #101625), var(--surface-card));
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .mood-banner-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .banner-emoji {
          font-size: 2.8rem;
          line-height: 1;
        }
        .banner-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: #fff;
        }
        .banner-tagline {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.2rem;
        }
        .mood-algorithm-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-dim);
          background: rgba(0, 0, 0, 0.4);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .info-icon {
          color: #38bdf8;
          flex-shrink: 0;
        }
        .in-mood-filters-bar {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .filter-group-inline {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .filter-select-sm {
          background: var(--surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.85rem;
          color: #fff;
          font-size: 0.85rem;
        }
        .mood-movie-item {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .why-it-matches-box {
          padding: 0.65rem 0.85rem;
          background: var(--surface-2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          font-size: 0.75rem;
          line-height: 1.45;
        }
        .why-label {
          display: block;
          font-weight: 700;
          color: #c4b5fd;
          margin-bottom: 0.2rem;
          text-transform: uppercase;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
        }
        .why-it-matches-box p {
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .all-moods-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .selected-mood-banner {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Moods;
