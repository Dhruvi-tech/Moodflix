import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Filter, SlidersHorizontal, RotateCcw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';

const GENRES_LIST = ['All', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance', 'Thriller'];
const MOODS_LIST = ['All', 'happy', 'sad', 'thriller', 'romantic', 'chill', 'adventurous', 'horror', 'comedy', 'inspirational', 'mystery', 'feel-good', 'emotional'];
const AVAILABILITY_TYPES = ['All', 'Public Domain', 'Free Official Streaming', 'Ad-Supported Free'];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [mood, setMood] = useState(searchParams.get('mood') || 'All');
  const [availabilityType, setAvailabilityType] = useState(searchParams.get('availabilityType') || 'All');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popularity');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [movies, setMovies] = useState(fallbackMovies);
  const [total, setTotal] = useState(fallbackMovies.length);
  const [totalPages, setTotalPages] = useState(Math.ceil(fallbackMovies.length / 12));
  const [loading, setLoading] = useState(false);

  // Fetch movies whenever filters or page changes
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sort,
        };
        if (search.trim()) params.search = search.trim();
        if (genre !== 'All') params.genre = genre;
        if (mood !== 'All') params.mood = mood;
        if (availabilityType !== 'All') params.availabilityType = availabilityType;
        if (minRating) params.minRating = minRating;

        const res = await api.get('/movies', { params });
        if (res.data.success && res.data.movies?.length) {
          setMovies(res.data.movies);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.warn('Using local fallback catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, genre, mood, availabilityType, minRating, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setGenre('All');
    setMood('All');
    setAvailabilityType('All');
    setMinRating('');
    setSort('popularity');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="explore-page page-wrapper container">
      {/* ── Section Header ───────────────────────────────── */}
      <div className="section-head">
        <h2>Explore Free Movies</h2>
        <p>Browse our catalog of verified legal free-to-watch cinema with advanced filtering.</p>
      </div>

      {/* ── Advanced Filter Bar ──────────────────────────── */}
      <div className="filter-panel glass-panel">
        <div className="filter-row-top">
          <div className="search-filter-box">
            <Search size={18} className="search-filter-icon" />
            <input
              type="text"
              placeholder="Filter by title, actor, or director..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="search-filter-input"
            />
          </div>

          <div className="sort-box">
            <SlidersHorizontal size={16} />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="releaseYear">Newest Release</option>
              <option value="oldest">Classic (Oldest)</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-secondary btn-sm reset-btn"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        <div className="filter-row-bottom">
          {/* Genre */}
          <div className="filter-select-group">
            <label className="filter-label">Genre</label>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              {GENRES_LIST.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div className="filter-select-group">
            <label className="filter-label">Mood / Vibe</label>
            <select
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              {MOODS_LIST.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Moods' : m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="filter-select-group">
            <label className="filter-label">Free Type</label>
            <select
              value={availabilityType}
              onChange={(e) => {
                setAvailabilityType(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              {AVAILABILITY_TYPES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="filter-select-group">
            <label className="filter-label">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">Any Rating</option>
              <option value="7.0">★ 7.0 & above</option>
              <option value="7.5">★ 7.5 & above</option>
              <option value="8.0">★ 8.0 & above</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results Count ─────────────────────────────────── */}
      <div className="results-meta-bar">
        <span>Showing <strong>{movies.length}</strong> of <strong>{total}</strong> verified free movies</span>
        {genre !== 'All' && <span className="active-filter-pill">Genre: {genre}</span>}
        {mood !== 'All' && <span className="active-filter-pill">Mood: {mood}</span>}
        {availabilityType !== 'All' && <span className="active-filter-pill">Type: {availabilityType}</span>}
      </div>

      {/* ── Movie Grid / Loading / Empty State ────────────── */}
      {loading ? (
        <LoadingSpinner text="Filtering cinematic database..." />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No movies match your criteria"
          description="Try broadening your genre or rating filter to discover more free films."
          actionText="Clear All Filters"
          actionLink="#"
          onActionClick={handleResetFilters}
        />
      ) : (
        <>
          <div className="movie-grid animate-fade-in">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span className="pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-secondary btn-sm"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .filter-panel {
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .filter-row-top {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .search-filter-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
        }
        .search-filter-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-dim);
        }
        .search-filter-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.65rem 1.25rem 0.65rem 2.6rem;
          color: #fff;
          font-size: 0.9rem;
        }
        .search-filter-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .sort-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--surface-2);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }
        .filter-row-bottom {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .filter-select-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .filter-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          font-weight: 700;
        }
        .filter-select {
          background: var(--surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.55rem 0.85rem;
          color: #fff;
          font-size: 0.88rem;
          cursor: pointer;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        .reset-btn {
          height: 38px;
        }
        .results-meta-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.88rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .active-filter-pill {
          padding: 0.2rem 0.6rem;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          color: #c4b5fd;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .pagination-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 3.5rem;
        }
        .pagination-info {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Explore;
