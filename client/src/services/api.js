import axios from 'axios';
import fallbackMovies from '../data/fallbackMovies';
import { FALLBACK_MOODS } from '../data/fallbackMoods';

// Deployed Vercel API is default fallback if env var is not specified
const API_BASE = import.meta.env.VITE_API_URL || 'https://server-six-topaz-45.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('moodflix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle network failures with seamless offline fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config } = error;

    // Handle token expiration
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('moodflix_token')) {
        localStorage.removeItem('moodflix_token');
        localStorage.removeItem('moodflix_user');
      }
      return Promise.reject(error);
    }

    // Seamless Fallback Handler for Network Failures / Cold Boot Timeout
    if (!error.response || error.code === 'ECONNABORTED' || error.response.status >= 500) {
      const url = config?.url || '';
      console.warn(`[MoodFlix Fallback Engine] Active for: ${url}`);

      // 1. Moods
      if (url.includes('/moods')) {
        return Promise.resolve({
          data: {
            success: true,
            moods: FALLBACK_MOODS,
          },
        });
      }

      // 2. Featured Movies
      if (url.includes('/movies/featured')) {
        return Promise.resolve({
          data: {
            success: true,
            count: 6,
            movies: fallbackMovies.slice(0, 6),
          },
        });
      }

      // 3. Movies by Mood: /movies/mood/:mood
      if (url.includes('/movies/mood/')) {
        const moodPart = url.split('/movies/mood/')[1]?.split('?')[0]?.toLowerCase();
        const moodMeta = FALLBACK_MOODS.find((m) => m.id === moodPart) || FALLBACK_MOODS[0];
        const movies = fallbackMovies.filter((m) => m.moodTags?.includes(moodPart));
        return Promise.resolve({
          data: {
            success: true,
            mood: moodMeta,
            count: movies.length,
            movies: movies.slice(0, 10),
          },
        });
      }

      // 4. Single Movie by Slug: /movies/slug/:slug
      if (url.includes('/movies/slug/')) {
        const slug = url.split('/movies/slug/')[1]?.split('?')[0];
        const movie = fallbackMovies.find((m) => m.slug === slug) || fallbackMovies[0];
        const similar = fallbackMovies
          .filter((m) => m.slug !== movie.slug && m.moodTags?.some((t) => movie.moodTags?.includes(t)))
          .slice(0, 4);
        return Promise.resolve({
          data: {
            success: true,
            movie,
            similarMovies: similar,
          },
        });
      }

      // 5. Search: /movies/search
      if (url.includes('/movies/search')) {
        const params = new URLSearchParams(url.split('?')[1] || '');
        const q = (params.get('q') || '').toLowerCase();
        const results = fallbackMovies.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.director?.toLowerCase().includes(q) ||
            m.cast?.some((c) => c.toLowerCase().includes(q))
        );
        return Promise.resolve({
          data: {
            success: true,
            query: q,
            results: results.slice(0, 8),
          },
        });
      }

      // 6. Full Catalog: /movies
      if (url.startsWith('/movies') || url === '/movies') {
        return Promise.resolve({
          data: {
            success: true,
            count: fallbackMovies.length,
            total: fallbackMovies.length,
            page: 1,
            pages: 1,
            movies: fallbackMovies,
          },
        });
      }

      // 7. Watchlist Fallback
      if (url.includes('/watchlist')) {
        return Promise.resolve({
          data: {
            success: true,
            count: 2,
            movies: [fallbackMovies[0], fallbackMovies[3]],
          },
        });
      }

      // 8. Favourites Fallback
      if (url.includes('/favourites')) {
        return Promise.resolve({
          data: {
            success: true,
            count: 2,
            movies: [fallbackMovies[1], fallbackMovies[7]],
          },
        });
      }

      // 9. History Fallback
      if (url.includes('/history')) {
        return Promise.resolve({
          data: {
            success: true,
            count: 3,
            movies: [
              { ...fallbackMovies[0], viewedAt: new Date().toISOString() },
              { ...fallbackMovies[1], viewedAt: new Date(Date.now() - 3600000).toISOString() },
            ],
          },
        });
      }

      // 10. Fallback Guest Login if network offline
      if (url.includes('/auth/login')) {
        const mockUser = {
          id: '678900000000000000000002',
          name: 'Guest User',
          email: 'guest@moodflix.com',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          preferences: { favoriteMoods: ['happy', 'feel-good', 'romantic'], preferredLanguages: ['English'] },
        };
        return Promise.resolve({
          data: {
            success: true,
            token: 'mock_guest_jwt_token_for_offline_demo',
            user: mockUser,
          },
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
