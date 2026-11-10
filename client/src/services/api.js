import axios from 'axios';
import fallbackMovies from '../data/fallbackMovies';
import { FALLBACK_MOODS } from '../data/fallbackMoods';

// Deployed Vercel API is default fallback if env var is not specified
const API_BASE = import.meta.env.VITE_API_URL || 'https://moodflix-api.vercel.app/api';

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

      // 2b. Free Movies Fallback: /movies/free
      if (url.includes('/movies/free')) {
        const params = new URLSearchParams(url.split('?')[1] || '');
        const lang = params.get('language');
        const mood = params.get('mood');
        let filtered = fallbackMovies.filter((m) => m.isFree === true);
        if (lang && lang !== 'All') {
          filtered = filtered.filter((m) => m.languages?.some((l) => l.toLowerCase() === lang.toLowerCase()));
        }
        if (mood && mood !== 'All') {
          filtered = filtered.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
        }
        return Promise.resolve({
          data: {
            success: true,
            count: filtered.length,
            total: filtered.length,
            page: 1,
            pages: 1,
            movies: filtered.slice(0, 12),
          },
        });
      }

      // 2c. Smart Recommendations Fallback: /movies/recommendations
      if (url.includes('/movies/recommendations')) {
        const params = new URLSearchParams(url.split('?')[1] || '');
        const mood = params.get('mood');
        const lang = params.get('language') || params.get('languages');
        const isFree = params.get('freeOnly') === 'true';
        let filtered = fallbackMovies;
        if (isFree) filtered = filtered.filter((m) => m.isFree);
        if (mood && mood !== 'All') filtered = filtered.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
        if (lang && lang !== 'All') filtered = filtered.filter((m) => m.languages?.some((l) => l.toLowerCase().includes(lang.toLowerCase())));
        return Promise.resolve({
          data: {
            success: true,
            count: filtered.slice(0, 12).length,
            explanation: isFree ? 'Curated legal free movies in your favorite genres.' : 'Personalized recommendations based on your preferences.',
            movies: filtered.slice(0, 12),
          },
        });
      }

      // 2d. Language Fallback: /movies/language/:lang
      if (url.includes('/movies/language/')) {
        const lang = decodeURIComponent(url.split('/movies/language/')[1]?.split('?')[0] || '').toLowerCase();
        const movies = fallbackMovies.filter(
          (m) =>
            m.languages?.some((l) => l.toLowerCase() === lang) ||
            m.originalLanguage?.toLowerCase() === lang
        );
        return Promise.resolve({
          data: {
            success: true,
            language: lang,
            count: movies.length,
            total: movies.length,
            page: 1,
            pages: 1,
            movies: movies.slice(0, 12),
          },
        });
      }

      // 2e. Platform Fallback: /movies/platform/:platform
      if (url.includes('/movies/platform/')) {
        const platform = decodeURIComponent(url.split('/movies/platform/')[1]?.split('?')[0] || '').toLowerCase();
        let movies = [];
        if (platform === 'free') {
          movies = fallbackMovies.filter((m) => m.isFree === true);
        } else {
          movies = fallbackMovies.filter(
            (m) =>
              m.primaryPlatform?.toLowerCase().includes(platform) ||
              m.platforms?.some((p) => p.name?.toLowerCase().includes(platform))
          );
        }
        return Promise.resolve({
          data: {
            success: true,
            platform,
            count: movies.length,
            total: movies.length,
            page: 1,
            pages: 1,
            movies: movies.slice(0, 12),
          },
        });
      }

      // 3. Movies by Mood: /movies/mood/:mood
      if (url.includes('/movies/mood/')) {
        const moodPart = url.split('/movies/mood/')[1]?.split('?')[0]?.toLowerCase();
        const moodMeta = FALLBACK_MOODS.find((m) => m.id === moodPart) || FALLBACK_MOODS[0];
        const params = new URLSearchParams(url.split('?')[1] || '');
        const platform = params.get('platform');
        let movies = fallbackMovies.filter((m) => m.moodTags?.includes(moodPart));
        if (platform && platform !== 'All') {
          const pLower = platform.toLowerCase();
          if (pLower === 'free') {
            movies = movies.filter((m) => m.isFree === true || m.availabilityStatus === 'FREE TO WATCH' || m.availabilityStatus === 'PUBLIC DOMAIN');
          } else {
            movies = movies.filter(
              (m) =>
                m.primaryPlatform?.toLowerCase().includes(pLower) ||
                m.platforms?.some((p) => p.name?.toLowerCase().includes(pLower))
            );
          }
        }
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
        const movie = fallbackMovies.find((m) => m.slug === slug || m._id === slug || String(m.id) === String(slug)) || fallbackMovies[0];
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

      // 4b. Single Movie by ID or generic path: /movies/:idOrSlug
      const singleMatch = url.match(/^\/movies\/([a-zA-Z0-9_-]+)$/);
      if (singleMatch && !['free', 'featured', 'recommendations', 'search'].includes(singleMatch[1])) {
        const idOrSlug = singleMatch[1];
        const movie = fallbackMovies.find((m) => m.slug === idOrSlug || m._id === idOrSlug || String(m.id) === String(idOrSlug)) || fallbackMovies[0];
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
