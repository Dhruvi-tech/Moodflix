import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark, Sparkles, Filter, Film, Calendar, Users, ShieldCheck } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Saved', icon: Film },
  { id: 'watch-later', label: 'Watch Later', icon: Bookmark },
  { id: 'weekend', label: 'Weekend Blockbusters', icon: Calendar },
  { id: 'family', label: 'Family & Kids', icon: Users },
  { id: 'free-only', label: '100% Free', icon: ShieldCheck },
];

const Watchlist = () => {
  const { watchlist, loading } = useWatchlist();
  const [activeCategory, setActiveCategory] = useState('all');

  const filterMovies = () => {
    if (!watchlist) return [];
    switch (activeCategory) {
      case 'weekend':
        // Weekend movies: runtime > 130m or high IMDb rating / thriller / action
        return watchlist.filter(
          (m) =>
            m.runtime >= 130 ||
            m.ratings?.value >= 8.0 ||
            m.genres?.some((g) => ['Action', 'Thriller', 'Adventure', 'Sci-Fi'].includes(g))
        );
      case 'family':
        // Family movies: family, comedy, animation, musical
        return watchlist.filter((m) =>
          m.genres?.some((g) => ['Family', 'Animation', 'Comedy', 'Musical'].includes(g))
        );
      case 'free-only':
        return watchlist.filter((m) => m.isFree || m.availabilityType !== 'subscription');
      case 'watch-later':
        return watchlist;
      case 'all':
      default:
        return watchlist;
    }
  };

  const filteredMovies = filterMovies();

  return (
    <div className="watchlist-page page-wrapper container py-10">
      <div className="section-head mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
          <Bookmark size={14} />
          <span>Personal Collection</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">My Saved Watchlist</h2>
        <p className="text-sm text-gray-400 mt-1">
          Films you have earmarked to watch legally free or stream at your convenience.
        </p>
      </div>

      {/* Category Filter Pills */}
      {watchlist.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 w-fit">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
                {cat.id === 'all' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
                    {watchlist.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

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
      ) : filteredMovies.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/10 text-gray-400">
          <p className="text-sm">No movies in your watchlist match the "{CATEGORIES.find((c) => c.id === activeCategory)?.label}" filter.</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-bold underline"
          >
            Show All Saved Movies ({watchlist.length})
          </button>
        </div>
      ) : (
        <div className="movie-grid animate-fade-in">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
