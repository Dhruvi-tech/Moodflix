import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart } from 'lucide-react';

const Favourites = () => {
  const { favourites, loading } = useWatchlist();

  return (
    <div className="favourites-page page-wrapper container">
      <div className="section-head">
        <h2>My Favourite Films</h2>
        <p>Your curated showcase of cherished cinema and top personal picks.</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your favourite films..." />
      ) : favourites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourite movies yet"
          description="Click the heart icon on any movie card to add it to your permanent favourites."
          actionText="Discover Movies"
          actionLink="/explore"
        />
      ) : (
        <div className="movie-grid animate-fade-in">
          {favourites.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
