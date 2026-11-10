import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import MoodChip from '../components/MoodChip';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Film,
  Compass,
  ArrowRight,
  Play,
  Star,
  Settings,
  Languages,
  Tv,
  CheckCircle,
  TrendingUp,
  Heart,
  Clock,
} from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';
import { FALLBACK_MOODS } from '../data/fallbackMoods';

const INDIAN_LANGUAGES = [
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
];

const FREE_SUBCATEGORIES = [
  { id: 'all-free', label: 'All Free Movies' },
  { id: 'free-indian', label: 'Free Indian Cinema' },
  { id: 'free-hindi', label: 'Hindi Classics' },
  { id: 'free-kannada', label: 'Kannada' },
  { id: 'free-telugu', label: 'Telugu' },
  { id: 'free-tamil', label: 'Tamil' },
  { id: 'free-malayalam', label: 'Malayalam' },
  { id: 'free-bengali', label: 'Bengali' },
  { id: 'free-comedy', label: 'Free Comedy' },
  { id: 'free-public-domain', label: 'Public Domain' },
];

export default function Home() {
  const { user } = useAuth();

  // Moods state (16 moods)
  const [moods, setMoods] = useState(FALLBACK_MOODS);
  const [selectedMood, setSelectedMood] = useState('happy');
  const [moodMovies, setMoodMovies] = useState([]);
  const [moodMeta, setMoodMeta] = useState(FALLBACK_MOODS[0]);
  const [loadingMoodMovies, setLoadingMoodMovies] = useState(false);

  // Platform preference state
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('moodflix_platform_pref');
      return saved ? JSON.parse(saved) : { platforms: ['free'], freeOnly: true };
    } catch {
      return { platforms: ['free'], freeOnly: true };
    }
  });

  // Dedicated section states
  const [freeSubcat, setFreeSubcat] = useState('all-free');
  const [selectedLanguageTab, setSelectedLanguageTab] = useState('Kannada');
  const [recentHistory, setRecentHistory] = useState([]);

  // Sync preference updates across tabs / events
  useEffect(() => {
    const handlePrefUpdate = () => {
      try {
        const saved = localStorage.getItem('moodflix_platform_pref');
        if (saved) setPreferences(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('platform-preferences-updated', handlePrefUpdate);
    return () => window.removeEventListener('platform-preferences-updated', handlePrefUpdate);
  }, []);

  // Fetch moods metadata from API or fallback
  useEffect(() => {
    api.get('/moods')
      .then((res) => {
        if (res.data.success && res.data.moods?.length) {
          setMoods(res.data.moods);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch movies for selected mood
  useEffect(() => {
    setLoadingMoodMovies(true);
    api.get(`/movies/mood/${selectedMood}?limit=6`)
      .then((res) => {
        if (res.data.success && res.data.movies?.length) {
          setMoodMovies(res.data.movies);
          setMoodMeta(res.data.mood || moods.find((m) => m.id === selectedMood) || FALLBACK_MOODS[0]);
        } else {
          const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood));
          setMoodMovies(fb.slice(0, 6));
          setMoodMeta(moods.find((m) => m.id === selectedMood) || FALLBACK_MOODS[0]);
        }
      })
      .catch(() => {
        const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood));
        setMoodMovies(fb.slice(0, 6));
        setMoodMeta(moods.find((m) => m.id === selectedMood) || FALLBACK_MOODS[0]);
      })
      .finally(() => setLoadingMoodMovies(false));
  }, [selectedMood, moods]);

  // Fetch user viewing history
  useEffect(() => {
    if (user) {
      api.get('/history')
        .then((res) => {
          if (res.data.success && res.data.movies?.length) {
            setRecentHistory(res.data.movies.slice(0, 4));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Filter free movies according to subcategory chip
  const getFreeSectionMovies = () => {
    let freePool = fallbackMovies.filter((m) => m.isFree === true);
    if (freeSubcat === 'free-indian') {
      return freePool.filter((m) => m.isIndianCinema).slice(0, 8);
    }
    if (freeSubcat === 'free-hindi') {
      return freePool.filter((m) => m.languages?.includes('Hindi')).slice(0, 8);
    }
    if (freeSubcat === 'free-kannada') {
      return freePool.filter((m) => m.languages?.includes('Kannada')).slice(0, 8);
    }
    if (freeSubcat === 'free-telugu') {
      return freePool.filter((m) => m.languages?.includes('Telugu')).slice(0, 8);
    }
    if (freeSubcat === 'free-tamil') {
      return freePool.filter((m) => m.languages?.includes('Tamil')).slice(0, 8);
    }
    if (freeSubcat === 'free-malayalam') {
      return freePool.filter((m) => m.languages?.includes('Malayalam')).slice(0, 8);
    }
    if (freeSubcat === 'free-bengali') {
      return freePool.filter((m) => m.languages?.includes('Bengali')).slice(0, 8);
    }
    if (freeSubcat === 'free-comedy') {
      return freePool.filter((m) => m.genres?.includes('Comedy')).slice(0, 8);
    }
    if (freeSubcat === 'free-public-domain') {
      return freePool.filter((m) => m.availabilityStatus === 'PUBLIC DOMAIN').slice(0, 8);
    }
    return freePool.slice(0, 8);
  };

  // Section 5: Popular Indian Movies
  const popularIndianMovies = fallbackMovies
    .filter((m) => m.isIndianCinema && (m.ratings?.value >= 7.8 || m.featured))
    .slice(0, 8);

  // Section 6: Language-based movies
  const languageTabMovies = fallbackMovies
    .filter((m) =>
      m.languages?.some((l) => l.toLowerCase() === selectedLanguageTab.toLowerCase()) ||
      m.originalLanguage?.toLowerCase() === selectedLanguageTab.toLowerCase()
    )
    .slice(0, 8);

  // Section 7: Free Hindi Movies
  const freeHindiMovies = fallbackMovies
    .filter((m) => m.isFree && m.languages?.includes('Hindi'))
    .slice(0, 8);

  // Section 8: Free Regional Cinema
  const freeRegionalMovies = fallbackMovies
    .filter(
      (m) =>
        m.isFree &&
        m.isIndianCinema &&
        m.originalLanguage !== 'Hindi' &&
        m.languages?.some((l) => ['Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Assamese'].includes(l))
    )
    .slice(0, 8);

  // Section 9: Free YouTube Movies
  const freeYoutubeMovies = fallbackMovies
    .filter((m) => m.isFree && (m.primaryPlatform === 'YouTube' || m.platforms?.some((p) => p.name === 'YouTube')))
    .slice(0, 8);

  // Section 10: Trending Movies
  const trendingMovies = fallbackMovies
    .filter((m) => m.ratings?.value >= 8.0)
    .slice(0, 8);

  // Section 11: Smart Recommendations
  const smartRecommendations = (() => {
    let pool = fallbackMovies;
    if (preferences.freeOnly) {
      pool = pool.filter((m) => m.isFree);
    } else if (preferences.platforms?.length && !preferences.platforms.includes('all')) {
      pool = pool.filter((m) =>
        preferences.platforms.some(
          (p) =>
            m.primaryPlatform?.toLowerCase().includes(p) ||
            m.platforms?.some((plat) => plat.name?.toLowerCase().includes(p)) ||
            (p === 'free' && m.isFree)
        )
      );
    }
    return pool.slice(0, 8);
  })();

  const openPrefModal = () => {
    window.dispatchEvent(new CustomEvent('open-platform-preferences'));
  };

  return (
    <div className="home-page page-wrapper text-slate-100">
      {/* ── SECTION 1: HERO BANNER ─────────────────────────────────── */}
      <section className="hero-section container relative overflow-hidden py-12 md:py-20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7b2cbf]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#9d4edd]/20 to-[#f72585]/20 border border-[#9d4edd]/40 text-[#f72585] text-xs md:text-sm font-semibold tracking-wide shadow-lg shadow-[#9d4edd]/10">
            <Sparkles size={16} />
            <span>Personalized Free & Streaming Cinema Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight leading-tight">
            Find Your Next Movie <br />
            <span className="bg-gradient-to-r from-[#e0aaff] via-[#f72585] to-[#4cc9f0] bg-clip-text text-transparent">
              Based on Your Mood.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover over 500+ legally free and streaming movies across 20+ Indian regional languages
            and world cinema. No subscription traps, honest platform badges.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a href="#mood-selector" className="btn btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-[#9d4edd]/30">
              <Play size={18} fill="#fff" />
              <span>Explore by Mood</span>
            </a>
            <a href="#free-movies" className="btn btn-secondary px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30">
              <span>🆓 Watch Free Movies</span>
            </a>
            <Link to="/explore" className="btn btn-outline px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
              <Compass size={18} />
              <span>Browse 500+ Catalog</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-emerald-400 block">220+</span>
              <span className="text-xs text-gray-400">100% Free Legal Movies</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-[#c77dff] block">20+</span>
              <span className="text-xs text-gray-400">Indian Languages</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-[#f72585] block">16</span>
              <span className="text-xs text-gray-400">Emotional Moods</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-sky-400 block">507</span>
              <span className="text-xs text-gray-400">Verified Titles</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PLATFORM PREFERENCE QUICK BAR ──────────────── */}
      <section className="container mb-12">
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#18122B]/90 via-[#241442]/80 to-[#18122B]/90 border border-[#9d4edd]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9d4edd]/30 to-[#f72585]/30 border border-[#9d4edd]/40 flex items-center justify-center text-2xl flex-shrink-0">
              📺
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#f72585]">
                Your Platform Filter
              </span>
              <h3 className="text-lg font-bold text-white">
                {preferences.freeOnly
                  ? 'Showing Free Movies Only (No Subscription Required)'
                  : `Watching on: ${preferences.platforms?.join(', ') || 'Free Movies First'}`}
              </h3>
              <p className="text-xs text-gray-300">
                You can change platforms anytime. We never assume you have paid streaming subscriptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={openPrefModal}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-[#9d4edd]/20 border border-[#9d4edd]/40 text-[#e0aaff] hover:bg-[#9d4edd]/30 transition-all flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              <span>Change Platform Preferences</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: FREE MOVIES — WATCH WITHOUT A SUBSCRIPTION ───── */}
      <section id="free-movies" className="container mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/40 mb-2">
              <CheckCircle size={14} />
              <span>100% Free Legal Streaming</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-white">
              FREE MOVIES — WATCH WITHOUT A SUBSCRIPTION
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              Watch completely free legally on official YouTube channels, public domain archives, and verified free streaming networks.
            </p>
          </div>
          <Link to="/explore?freeOnly=true" className="btn btn-sm btn-outline text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20 self-start md:self-auto">
            <span>Explore All 220+ Free Movies</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Free Subcategory Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {FREE_SUBCATEGORIES.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFreeSubcat(chip.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                freeSubcat === chip.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-bold'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Free Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {getFreeSectionMovies().map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 4: CHOOSE YOUR MOOD (16 MOODS) ──────────────────── */}
      <section id="mood-selector" className="mood-showcase-section container mb-16">
        <div className="section-head mb-6">
          <span className="step-tag text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/30 inline-block mb-2">
            16 EMOTIONAL PALETTES
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-white">
            How Are You Feeling Tonight?
          </h2>
          <p className="text-sm text-gray-300 max-w-xl">
            Pick any vibe from our 16 curated mood palettes. Instant recommendations tailored to your emotional state.
          </p>
        </div>

        {/* Mood Chips 16 Grids */}
        <div className="mood-chips-scroll mb-8">
          {moods.map((m) => (
            <MoodChip
              key={m.id}
              mood={m}
              count={m.movieCount}
              active={selectedMood === m.id}
              onClick={(id) => setSelectedMood(id)}
            />
          ))}
        </div>

        {/* Dynamic Mood Recommendations Preview */}
        <div className="p-6 rounded-2xl bg-white/5 border border-[#9d4edd]/30 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                <span>{moodMeta?.emoji}</span>
                <span>{moodMeta?.label} Movies</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">{moodMeta?.tagline}</p>
            </div>
            <Link to={`/explore?mood=${selectedMood}`} className="btn btn-sm btn-outline text-[#c77dff] border-[#9d4edd]/40 hover:bg-[#9d4edd]/20">
              <span>View All {moodMeta?.label} Titles</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingMoodMovies ? (
            <LoadingSpinner text={`Finding ${moodMeta?.label || ''} titles...`} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 animate-fade-in">
              {moodMovies.map((movie) => (
                <MovieCard key={movie._id || movie.slug} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 5: POPULAR INDIAN MOVIES ──────────────────────── */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#f72585] text-xs font-bold uppercase tracking-wider mb-1">
              <Film size={14} />
              <span>Pan-India Cinema</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Popular Indian Movies</h2>
            <p className="text-xs sm:text-sm text-gray-300">From timeless blockbusters to legendary milestone achievements.</p>
          </div>
          <Link to="/explore?isIndian=true" className="btn btn-sm btn-outline">
            <span>Explore Indian Cinema</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {popularIndianMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 6: MOVIES IN YOUR LANGUAGE (REGIONAL TABS) ────── */}
      <section className="container mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Languages size={14} />
              <span>20+ Indian Languages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Movies in Your Language</h2>
            <p className="text-xs sm:text-sm text-gray-300">Switch tabs to explore authentic regional cinema with original audio and subtitles.</p>
          </div>
          <Link to={`/explore?language=${selectedLanguageTab}`} className="btn btn-sm btn-outline text-sky-400 border-sky-500/40 hover:bg-sky-500/20">
            <span>More in {selectedLanguageTab}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Regional Language Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {INDIAN_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguageTab(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLanguageTab === lang
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 font-bold scale-105'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Language Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {languageTabMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 7: FREE HINDI MOVIES ─────────────────────────── */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
              🆓 No Subscription Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Free Hindi Movies</h2>
            <p className="text-xs sm:text-sm text-gray-300">Immortal Hindi classics and comedies legally available on YouTube and public platforms.</p>
          </div>
          <Link to="/explore?language=Hindi&freeOnly=true" className="btn btn-sm btn-outline">
            <span>View All Hindi Free</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {freeHindiMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 8: FREE REGIONAL CINEMA ───────────────────────── */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
              🆓 South Indian & Regional Gems
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Free Regional Cinema</h2>
            <p className="text-xs sm:text-sm text-gray-300">Explore Kannada, Tamil, Telugu, Malayalam, Bengali & Marathi cinema without paying subscriptions.</p>
          </div>
          <Link to="/explore?freeOnly=true&isIndian=true" className="btn btn-sm btn-outline">
            <span>All Regional Free</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {freeRegionalMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 9: FREE YOUTUBE MOVIES ────────────────────────── */}
      <section className="container mb-16">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-red-950/40 via-red-900/20 to-black/60 border border-red-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Play size={14} fill="currentColor" />
                <span>YouTube Official Cinema</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Free Full YouTube Movies</h2>
              <p className="text-xs sm:text-sm text-gray-300">Uploaded legally by production houses and official public broadcast networks.</p>
            </div>
            <Link to="/explore?platform=YouTube&freeOnly=true" className="btn btn-sm bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl">
              <span>View All YouTube Movies</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {freeYoutubeMovies.map((movie) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 10: TRENDING MOVIES ──────────────────────────── */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp size={14} />
              <span>Highest Rated Cinema</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Trending Movies</h2>
            <p className="text-xs sm:text-sm text-gray-300">Critically acclaimed films boasting IMDb ratings 8.0 and above.</p>
          </div>
          <Link to="/explore?sort=rating" className="btn btn-sm btn-outline">
            <span>Explore High Rated</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 11: SMART RECOMMENDATIONS FOR YOU ────────────── */}
      <section className="container mb-16">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#7b2cbf]/20 via-[#f72585]/10 to-[#18122B] border border-[#9d4edd]/30 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[#f72585] text-xs font-bold uppercase tracking-wider block mb-1">
                ⭐ Customized Discovery
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Smart Recommendations For You</h2>
              <p className="text-xs sm:text-sm text-[#e0aaff] mt-1 font-mono">
                {preferences.freeOnly
                  ? 'Recommended because you prefer free movies without subscriptions.'
                  : `Recommended based on your platform preferences: ${preferences.platforms?.join(', ') || 'All Platforms'}.`}
              </p>
            </div>
            <button
              onClick={openPrefModal}
              className="btn btn-sm btn-outline text-white border-white/20 hover:bg-white/10 self-start md:self-auto"
            >
              <span>Refine Preferences</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {smartRecommendations.map((movie) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 12: EXPLORE BY GENRE ─────────────────────────── */}
      <section className="container mb-16">
        <div className="section-head mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Explore by Genre</h2>
          <p className="text-xs sm:text-sm text-gray-300">Dive into your favorite cinematic categories.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { name: 'Action', emoji: '💥', count: 95 },
            { name: 'Comedy', emoji: '😂', count: 140 },
            { name: 'Drama', emoji: '🎭', count: 210 },
            { name: 'Romance', emoji: '💖', count: 110 },
            { name: 'Thriller', emoji: '🔪', count: 130 },
            { name: 'Horror', emoji: '👻', count: 45 },
            { name: 'Sci-Fi', emoji: '🚀', count: 55 },
            { name: 'Family', emoji: '👨‍👩‍👧‍👦', count: 105 },
            { name: 'Mystery', emoji: '🕵️', count: 70 },
            { name: 'Adventure', emoji: '⚡', count: 120 },
            { name: 'Musical', emoji: '🎵', count: 40 },
            { name: 'Classic', emoji: '🏛️', count: 85 },
          ].map((genre) => (
            <Link
              key={genre.name}
              to={`/explore?genre=${genre.name}`}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#9d4edd] hover:bg-white/10 transition-all text-center group"
            >
              <span className="text-3xl block mb-1 group-hover:scale-110 transition-transform">{genre.emoji}</span>
              <span className="text-sm font-bold text-white block">{genre.name}</span>
              <span className="text-xs text-gray-400">{genre.count}+ titles</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECTION 13: EXPLORE BY PLATFORM ──────────────────────── */}
      <section className="container mb-16">
        <div className="section-head mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Explore by Platform</h2>
          <p className="text-xs sm:text-sm text-gray-300">Filter the MoodFlix catalog specifically by the streaming platforms you subscribe to.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'Free', name: 'Free Movies', icon: '🆓', border: 'border-emerald-500/40', bg: 'hover:bg-emerald-500/10' },
            { id: 'YouTube', name: 'YouTube', icon: '▶️', border: 'border-red-500/40', bg: 'hover:bg-red-500/10' },
            { id: 'Netflix', name: 'Netflix', icon: '🎬', border: 'border-red-600/40', bg: 'hover:bg-red-600/10' },
            { id: 'Amazon Prime Video', name: 'Prime Video', icon: '🍿', border: 'border-sky-500/40', bg: 'hover:bg-sky-500/10' },
            { id: 'JioCinema', name: 'JioCinema', icon: '📺', border: 'border-pink-500/40', bg: 'hover:bg-pink-500/10' },
            { id: 'Hotstar', name: 'Disney+ Hotstar', icon: '⭐', border: 'border-blue-500/40', bg: 'hover:bg-blue-500/10' },
          ].map((plat) => (
            <Link
              key={plat.id}
              to={`/explore?platform=${encodeURIComponent(plat.id)}`}
              className={`p-4 rounded-xl bg-white/5 border ${plat.border} ${plat.bg} transition-all text-center group`}
            >
              <span className="text-3xl block mb-1 group-hover:scale-110 transition-transform">{plat.icon}</span>
              <span className="text-sm font-bold text-white block">{plat.name}</span>
              <span className="text-xs text-gray-400">View Catalog</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECTION 14: RECENTLY VIEWED ──────────────────────────── */}
      {user && recentHistory.length > 0 && (
        <section className="container mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#f72585]" />
              <h2 className="text-2xl font-bold font-serif text-white">Recently Viewed</h2>
            </div>
            <Link to="/history" className="btn btn-sm btn-outline">
              <span>Full History</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentHistory.map((movie) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 15: COMMUNITY DISCOVERY & CIE-3 SUMMARY ───────── */}
      <section className="container mb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#241442] via-[#1a0f30] to-[#120a21] border border-[#9d4edd]/30 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#f72585] px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 inline-block">
              CS3301 Full Stack Development • CIE-3
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
              Discover Movies That Truly Fit Your Night.
            </h2>
            <p className="text-sm text-gray-300">
              MoodFlix transforms discovery by pairing emotional sentiment with legal, cost-free viewing options.
              Join millions finding cinema without endless paid subscriptions.
            </p>
            <div className="pt-2">
              <Link to="/explore" className="btn btn-primary px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2">
                <span>Start Discovering Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
