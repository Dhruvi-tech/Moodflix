import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark } from 'lucide-react';

const Watchlist = () => {
  const { watchlist, loading } = useWatchlist();

  return (
    <div className="watchlist-page page-wrapper container">
      <div className="section-head">
        <h2>My Saved Watchlist</h2>
        <p>Films you have earmarked to watch legally free at your convenience.</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your saved movies..." />
      ) : watchlist.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your Watchlist is empty"
          description="Explore our catalog and click the bookmark icon on any movie to save it for later."
          actionText="Browse Free Movies"
          actionLink="/explore"
        />
      ) : (
        <div className="movie-grid animate-fade-in">
          {watchlist.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
