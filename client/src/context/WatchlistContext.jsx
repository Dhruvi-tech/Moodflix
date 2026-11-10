import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLists();
    } else {
      setWatchlist([]);
      setFavourites([]);
    }
  }, [user]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const [wlRes, favRes] = await Promise.all([
        api.get('/watchlist'),
        api.get('/favourites'),
      ]);
      if (wlRes.data.success) setWatchlist(wlRes.data.movies);
      if (favRes.data.success) setFavourites(favRes.data.movies);
    } catch (err) {
      console.error('Error loading watchlist or favourites:', err);
    } finally {
      setLoading(false);
    }
  };

  const inWatchlist = (movieId) => {
    return watchlist.some((m) => m._id === movieId || m.id === movieId);
  };

  const inFavourites = (movieId) => {
    return favourites.some((m) => m._id === movieId || m.id === movieId);
  };

  const toggleWatchlist = async (movie) => {
    if (!user) throw new Error('Please login to manage your watchlist');
    const movieId = movie._id || movie.id;
    const exists = inWatchlist(movieId);

    if (exists) {
      await api.delete(`/watchlist/${movieId}`);
      setWatchlist((prev) => prev.filter((m) => (m._id || m.id) !== movieId));
      return false;
    } else {
      await api.post(`/watchlist/${movieId}`);
      setWatchlist((prev) => [movie, ...prev]);
      return true;
    }
  };

  const toggleFavourite = async (movie) => {
    if (!user) throw new Error('Please login to save favourites');
    const movieId = movie._id || movie.id;
    const exists = inFavourites(movieId);

    if (exists) {
      await api.delete(`/favourites/${movieId}`);
      setFavourites((prev) => prev.filter((m) => (m._id || m.id) !== movieId));
      return false;
    } else {
      await api.post(`/favourites/${movieId}`);
      setFavourites((prev) => [movie, ...prev]);
      return true;
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        favourites,
        loading,
        inWatchlist,
        inFavourites,
        toggleWatchlist,
        toggleFavourite,
        fetchLists,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
