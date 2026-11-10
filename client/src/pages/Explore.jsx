import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Filter, SlidersHorizontal, RotateCcw, Search, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';

const GENRES_LIST = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
];

const MOODS_LIST = [
  'All',
  'happy',
  'sad',
  'thriller',
  'romantic',
  'chill',
  'adventurous',
  'horror',
  'comedy',
  'inspirational',
  'mystery',
  'feel-good',
  'emotional',
  'family',
  'motivational',
  'suspense',
  'relaxing',
];

const PLATFORMS_LIST = [
  'All',
  'Free',
  'YouTube',
  'Netflix',
  'Amazon Prime Video',
  'JioCinema',
  'Hotstar',
];

const LANGUAGES_LIST = [
  'All',
  'Hindi',
  'Kannada',
  'Telugu',
  'Tamil',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Punjabi',
  'Gujarati',
  'Odia',
  'Assamese',
  'Urdu',
  'Konkani',
  'Sanskrit',
  'Bhojpuri',
  'Nepali',
  'English',
];

const AVAILABILITY_STATUSES = [
  'All',
  'FREE TO WATCH',
  'FREE WITH ADS',
  'PUBLIC DOMAIN',
  'SUBSCRIPTION REQUIRED',
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL query params or user stored preference
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [mood, setMood] = useState(searchParams.get('mood') || 'All');
  const [platform, setPlatform] = useState(() => {
    const qp = searchParams.get('platform');
    if (qp) return qp;
    try {
      const saved = localStorage.getItem('moodflix_platform_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.freeOnly) return 'Free';
        if (parsed.platforms?.length === 1 && parsed.platforms[0] !== 'all') {
          const map = {
            free: 'Free',
            youtube: 'YouTube',
            netflix: 'Netflix',
            prime: 'Amazon Prime Video',
            hotstar: 'Hotstar',
            jiocinema: 'JioCinema',
          };
          return map[parsed.platforms[0].toLowerCase()] || parsed.platforms[0];
        }
      }
    } catch {}
    return 'All';
  });
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [availabilityStatus, setAvailabilityStatus] = useState(searchParams.get('availabilityStatus') || 'All');
  const [freeOnly, setFreeOnly] = useState(() => {
    const qp = searchParams.get('freeOnly');
    if (qp !== null) return qp === 'true';
    try {
      const saved = localStorage.getItem('moodflix_platform_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.freeOnly) return true;
        if (parsed.platforms?.length === 1 && parsed.platforms[0] !== 'free') return false;
      }
    } catch {}
    return false;
  });
  const [isIndian, setIsIndian] = useState(searchParams.get('isIndian') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popularity');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [movies, setMovies] = useState(fallbackMovies.slice(0, 24));
  const [total, setTotal] = useState(fallbackMovies.length);
  const [totalPages, setTotalPages] = useState(Math.ceil(fallbackMovies.length / 24));
  const [loading, setLoading] = useState(false);

  // Fetch movies whenever filters or page changes
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 24,
          sort,
        };
        if (search.trim()) params.search = search.trim();
        if (genre !== 'All') params.genre = genre;
        if (mood !== 'All') params.mood = mood;
        if (platform !== 'All') params.platform = platform;
        if (language !== 'All') params.language = language;
        if (availabilityStatus !== 'All') params.availabilityStatus = availabilityStatus;
        if (freeOnly) params.freeOnly = 'true';
        if (isIndian) params.isIndian = 'true';
        if (minRating) params.minRating = minRating;

        const res = await api.get('/movies', { params });
        if (res.data.success && res.data.movies?.length) {
          setMovies(res.data.movies);
          setTotal(res.data.total);
          setTotalPages(res.data.pages || Math.ceil(res.data.total / 24) || 1);
        } else {
          // Client-side fallback filter
          let pool = [...fallbackMovies];
          if (platform !== 'All') {
            const pLower = platform.toLowerCase();
            if (pLower === 'free') {
              pool = pool.filter((m) => m.isFree === true || m.availabilityStatus === 'FREE TO WATCH' || m.availabilityStatus === 'PUBLIC DOMAIN');
            } else {
              pool = pool.filter(
                (m) =>
                  m.primaryPlatform?.toLowerCase().includes(pLower) ||
                  m.platforms?.some((p) => p.name?.toLowerCase().includes(pLower))
              );
            }
          } else if (freeOnly) {
            pool = pool.filter((m) => m.isFree === true || m.availabilityStatus === 'FREE TO WATCH' || m.availabilityStatus === 'PUBLIC DOMAIN');
          }
          if (language !== 'All') {
            pool = pool.filter(
              (m) =>
                m.languages?.some((l) => l.toLowerCase() === language.toLowerCase()) ||
                m.originalLanguage?.toLowerCase() === language.toLowerCase()
            );
          }
          if (genre !== 'All') pool = pool.filter((m) => m.genres?.some((g) => g.toLowerCase() === genre.toLowerCase()));
          if (mood !== 'All') pool = pool.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
          if (search.trim()) {
            const s = search.toLowerCase();
            pool = pool.filter((m) => m.title.toLowerCase().includes(s) || m.director?.toLowerCase().includes(s));
          }
          setTotal(pool.length);
          setTotalPages(Math.ceil(pool.length / 24) || 1);
          const skip = (page - 1) * 24;
          setMovies(pool.slice(skip, skip + 24));
        }
      } catch (err) {
        console.warn('Using local fallback catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, genre, mood, platform, language, availabilityStatus, freeOnly, isIndian, minRating, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setGenre('All');
    setMood('All');
    setPlatform('All');
    setLanguage('All');
    setAvailabilityStatus('All');
    setFreeOnly(false);
    setIsIndian(false);
    setMinRating('');
    setSort('popularity');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="explore-page page-wrapper container text-slate-100">
      {/* ── Section Header ───────────────────────────────── */}
      <div className="section-head mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#f72585] px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 inline-block mb-2">
          500+ Verified Titles Catalog
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Explore Movies</h2>
        <p className="text-sm text-gray-300">
          Discover films across verified free services and premium streaming platforms tailored to your language and mood.
        </p>
      </div>

      {/* ── Active Platform Filter Status (No unselected platforms shown on top) ── */}
      <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-gray-400 font-medium">Selected Platform:</span>
          <span className="font-extrabold text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10">
            {platform === 'Free' || freeOnly
              ? '🆓 Free Movies Only'
              : platform !== 'All'
              ? platform
              : 'All Verified Platforms'}
          </span>
          <span className="text-gray-400 hidden sm:inline">
            • Exclusively showing {total} verified movies. Unselected platforms are hidden.
          </span>
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-platform-preferences'))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex-shrink-0"
        >
          <SlidersHorizontal size={13} />
          <span>Change Platform</span>
        </button>
      </div>

      {/* ── Advanced Filter Panel ─────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl mb-8 space-y-4">
        {/* Top search & sorting row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, director, or cast..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#9d4edd] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Free only toggle switch */}
            <button
              type="button"
              onClick={() => {
                setFreeOnly(!freeOnly);
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${
                freeOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>🆓</span>
              <span>Free Movies Only</span>
              {freeOnly && <span className="text-xs">✓</span>}
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/15">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="popularity" className="bg-[#18122B]">Most Popular</option>
                <option value="rating" className="bg-[#18122B]">Highest Rated</option>
                <option value="year" className="bg-[#18122B]">Newest Release</option>
                <option value="title" className="bg-[#18122B]">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset All Filters"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Language */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#9d4edd]"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang} value={lang} className="bg-[#18122B]">
                  {lang === 'All' ? 'All Languages (20+)' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Mood Tonight</label>
            <select
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#9d4edd]"
            >
              {MOODS_LIST.map((m) => (
                <option key={m} value={m} className="bg-[#18122B]">
                  {m === 'All' ? 'All 16 Moods' : m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Genre */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Genre</label>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#9d4edd]"
            >
              {GENRES_LIST.map((g) => (
                <option key={g} value={g} className="bg-[#18122B]">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Minimum IMDb</label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#9d4edd]"
            >
              <option value="" className="bg-[#18122B]">Any Rating</option>
              <option value="7.0" className="bg-[#18122B]">★ 7.0 & above</option>
              <option value="7.5" className="bg-[#18122B]">★ 7.5 & above</option>
              <option value="8.0" className="bg-[#18122B]">★ 8.0 & above</option>
              <option value="8.5" className="bg-[#18122B]">★ 8.5 & above</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results Count Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
        <span className="text-sm text-gray-300">
          Showing <strong>{movies.length}</strong> of <strong>{total}</strong> verified movies
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {freeOnly && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Free Only
            </span>
          )}
          {platform !== 'All' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#9d4edd]/20 text-[#e0aaff] border border-[#9d4edd]/40">
              Platform: {platform}
            </span>
          )}
          {language !== 'All' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/40">
              Language: {language}
            </span>
          )}
          {mood !== 'All' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40">
              Mood: {mood}
            </span>
          )}
        </div>
      </div>

      {/* ── Movie Grid / Loading / Empty State ────────────── */}
      {loading ? (
        <LoadingSpinner text="Searching master cinema catalog..." />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No movies found for these filters"
          description="Try selecting 'All Platforms' or clearing language filters to see more results."
          actionText="Clear All Filters"
          actionLink="#"
          onActionClick={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 animate-fade-in mb-10">
            {movies.map((movie) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-8 border-t border-white/10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-secondary btn-sm px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span className="text-sm text-gray-400">
                Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-secondary btn-sm px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
