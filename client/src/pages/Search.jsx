import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';

const SUGGESTIONS = ['Charlie Chaplin', 'Buster Keaton', 'Alfred Hitchcock', 'Cary Grant', 'Sherlock Holmes', 'Fantasy', 'Romance'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputVal(queryParam);
    if (!queryParam.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/movies', {
          params: { search: queryParam.trim(), limit: 24 },
        });
        if (res.data.success) {
          setResults(res.data.movies);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [queryParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
    setResults([]);
  };

  const handleSuggestionClick = (term) => {
    setInputVal(term);
    setSearchParams({ q: term });
  };

  return (
    <div className="search-page page-wrapper container">
      {/* ── Search Input Section ─────────────────────────── */}
      <div className="search-hero-box text-center">
        <h2>Search Free Cinema</h2>
        <p>Discover films by title, legendary actor, director, or genre keyword.</p>

        <form onSubmit={handleSubmit} className="big-search-form">
          <SearchIcon size={22} className="big-search-icon" />
          <input
            type="text"
            placeholder="Type a title (e.g. The General), actor (Chaplin), or genre..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="big-search-input"
            autoFocus
          />
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-search-btn"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button type="submit" className="btn btn-primary big-search-btn">
            Search
          </button>
        </form>

        {/* Popular Search Suggestions */}
        <div className="search-suggestions-row">
          <span className="suggestions-label">Try searching:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="suggestion-pill"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Area ─────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner text={`Searching for "${queryParam}"...`} />
      ) : queryParam && results.length === 0 ? (
        <EmptyState
          title={`No results found for "${queryParam}"`}
          description="Check the spelling or try searching for another actor, director, or genre."
          actionText="Explore All Free Movies"
          actionLink="/explore"
        />
      ) : results.length > 0 ? (
        <div className="search-results-section animate-fade-in">
          <div className="results-header-bar">
            <h3>Found {results.length} movies for "{queryParam}"</h3>
          </div>

          <div className="movie-grid">
            {results.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <div className="search-placeholder-view text-center">
          <Sparkles size={40} color="#8b5cf6" style={{ margin: '0 auto 1rem' }} />
          <h3>Type your query above to start searching</h3>
          <p>Our database contains verified public domain classics, educational releases, and free streaming hits.</p>
        </div>
      )}

      <style>{`
        .search-hero-box {
          max-width: 720px;
          margin: 0 auto 3.5rem;
        }
        .big-search-form {
          position: relative;
          display: flex;
          align-items: center;
          margin: 2rem 0 1.25rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0.35rem 0.35rem 0.35rem 1.25rem;
          box-shadow: var(--shadow-md);
        }
        .big-search-icon {
          color: var(--text-dim);
          flex-shrink: 0;
        }
        .big-search-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.75rem 1rem;
          font-size: 1.05rem;
          color: #fff;
        }
        .big-search-input:focus {
          outline: none;
        }
        .clear-search-btn {
          color: var(--text-dim);
          padding: 0.5rem;
          margin-right: 0.5rem;
          display: grid;
          place-items: center;
        }
        .clear-search-btn:hover {
          color: #fff;
        }
        .big-search-btn {
          padding: 0.8rem 1.75rem;
        }
        .search-suggestions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .suggestions-label {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .suggestion-pill {
          padding: 0.25rem 0.65rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .suggestion-pill:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: var(--primary);
          color: #fff;
          transform: translateY(-1px);
        }
        .results-header-bar {
          margin-bottom: 2rem;
        }
        .results-header-bar h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: #fff;
        }
        .search-placeholder-view {
          padding: 4rem 1rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Search;
