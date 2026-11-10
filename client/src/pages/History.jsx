import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { History as HistoryIcon, Trash2 } from 'lucide-react';

const History = () => {
  const [historyMovies, setHistoryMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/history');
      if (res.data.success) {
        setHistoryMovies(res.data.movies);
      }
    } catch (err) {
      console.error('Error fetching viewing history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire viewing history?')) return;
    try {
      await api.delete('/history');
      setHistoryMovies([]);
    } catch (err) {
      alert('Failed to clear viewing history');
    }
  };

  return (
    <div className="history-page page-wrapper container">
      <div className="section-head history-head">
        <div>
          <h2>Viewing History</h2>
          <p>Recent free movies you have opened and explored on MoodFlix.</p>
        </div>

        {historyMovies.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your viewing log..." />
      ) : historyMovies.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No viewing history recorded"
          description="Whenever you view movie details or watch free films, they will appear here."
          actionText="Explore Movies Now"
          actionLink="/explore"
        />
      ) : (
        <div className="movie-grid animate-fade-in">
          {historyMovies.map((movie) => (
            <div key={movie._id || movie.slug} className="history-item-wrapper">
              <MovieCard movie={movie} />
              {movie.viewedAt && (
                <span className="history-timestamp">
                  Opened {new Date(movie.viewedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .history-item-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .history-timestamp {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default History;
