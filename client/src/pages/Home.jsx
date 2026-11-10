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

const DIRECT_PLATFORMS = [
  { id: 'free-only', label: 'Free Movies Only', icon: '🆓' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'netflix', label: 'Netflix', icon: '🎬' },
  { id: 'prime', label: 'Amazon Prime', icon: '🍿' },
  { id: 'hotstar', label: 'Disney+ Hotstar', icon: '⭐' },
  { id: 'jiocinema', label: 'JioCinema', icon: '📺' },
  { id: 'all', label: 'Show Everything', icon: '🌐' },
];

const FREE_SUBCATEGORIES = [
  { id: 'all-free', label: 'All Titles' },
  { id: 'free-indian', label: 'Indian Cinema' },
  { id: 'free-hindi', label: 'Hindi Classics' },
  { id: 'free-kannada', label: 'Kannada' },
  { id: 'free-telugu', label: 'Telugu' },
  { id: 'free-tamil', label: 'Tamil' },
  { id: 'free-malayalam', label: 'Malayalam' },
  { id: 'free-bengali', label: 'Bengali' },
  { id: 'free-comedy', label: 'Comedy' },
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

  // Strict movie matcher: Checks if a movie is available on the user's selected platform
  const movieMatchesPlatform = (m) => {
    if (!m) return false;
    if (preferences.freeOnly) {
      return (
        m.isFree === true ||
        m.availabilityType === 'free' ||
        m.availabilityType === 'free-with-ads' ||
        m.availabilityType === 'public-domain' ||
        m.availabilityStatus === 'FREE TO WATCH' ||
        m.availabilityStatus === 'PUBLIC DOMAIN'
      );
    }
    const plats = preferences.platforms || ['free'];
    if (plats.includes('all')) return true;

    return plats.some((p) => {
      const pLower = p.toLowerCase();
      if (pLower === 'free') {
        return (
          m.isFree === true ||
          m.availabilityType === 'free' ||
          m.availabilityStatus === 'FREE TO WATCH' ||
          m.availabilityStatus === 'PUBLIC DOMAIN'
        );
      }
      if (pLower === 'youtube') {
        return (
          m.primaryPlatform?.toLowerCase().includes('youtube') ||
          m.platforms?.some((plat) => plat.name?.toLowerCase().includes('youtube')) ||
          (m.isFree && !m.primaryPlatform)
        );
      }
      if (pLower === 'netflix') {
        return (
          m.primaryPlatform?.toLowerCase().includes('netflix') ||
          m.platforms?.some((plat) => plat.name?.toLowerCase().includes('netflix'))
        );
      }
      if (pLower === 'prime' || pLower === 'amazon') {
        return (
          m.primaryPlatform?.toLowerCase().includes('prime') ||
          m.primaryPlatform?.toLowerCase().includes('amazon') ||
          m.platforms?.some(
            (plat) =>
              plat.name?.toLowerCase().includes('prime') ||
              plat.name?.toLowerCase().includes('amazon')
          )
        );
      }
      if (pLower === 'hotstar' || pLower === 'disney') {
        return (
          m.primaryPlatform?.toLowerCase().includes('hotstar') ||
          m.primaryPlatform?.toLowerCase().includes('disney') ||
          m.platforms?.some(
            (plat) =>
              plat.name?.toLowerCase().includes('hotstar') ||
              plat.name?.toLowerCase().includes('disney')
          )
        );
      }
      if (pLower === 'jiocinema' || pLower === 'jio') {
        return (
          m.primaryPlatform?.toLowerCase().includes('jio') ||
          m.platforms?.some((plat) => plat.name?.toLowerCase().includes('jio'))
        );
      }
      return (
        m.primaryPlatform?.toLowerCase().includes(pLower) ||
        m.platforms?.some((plat) => plat.name?.toLowerCase().includes(pLower))
      );
    });
  };

  const isFreeOnly = preferences.freeOnly;
  const activeSinglePlatform = !isFreeOnly && preferences.platforms?.length === 1 && preferences.platforms[0] !== 'all' ? preferences.platforms[0] : null;

  const platformDisplayTitle = (() => {
    if (isFreeOnly) return 'FREE MOVIES — WATCH WITHOUT A SUBSCRIPTION';
    if (!activeSinglePlatform) return 'FEATURED MOVIES ACROSS ALL PLATFORMS';
    const map = {
      netflix: 'NETFLIX MOVIES — STREAM ON NETFLIX',
      prime: 'AMAZON PRIME VIDEO — STREAM ON PRIME',
      youtube: 'YOUTUBE MOVIES — WATCH ON YOUTUBE',
      hotstar: 'DISNEY+ HOTSTAR — STREAM ON HOTSTAR',
      jiocinema: 'JIOCINEMA — STREAM ON JIOCINEMA',
    };
    return map[activeSinglePlatform.toLowerCase()] || `${activeSinglePlatform.toUpperCase()} MOVIES`;
  })();

  const platformBadgeText = (() => {
    if (isFreeOnly) return '100% Free Legal Streaming';
    if (!activeSinglePlatform) return 'Multi-Platform Discovery';
    const map = {
      netflix: 'Stream on Netflix',
      prime: 'Stream on Prime Video',
      youtube: 'Watch on YouTube',
      hotstar: 'Stream on Disney+ Hotstar',
      jiocinema: 'Stream on JioCinema',
    };
    return map[activeSinglePlatform.toLowerCase()] || `Available on ${activeSinglePlatform}`;
  })();

  const platformSubtext = (() => {
    if (isFreeOnly) return 'Watch completely free legally on official YouTube channels, public domain archives, and verified free streaming networks.';
    if (!activeSinglePlatform) return 'Explore movies available across Free, YouTube, Netflix, Prime Video, Hotstar, and JioCinema.';
    return `Exclusively showing titles verified and streamable on ${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')}. Zero other platforms mixed.`;
  })();

  const handleDirectPlatformSelect = (platId) => {
    let newPref;
    if (platId === 'free-only') {
      newPref = { platforms: ['free'], freeOnly: true, answered: true };
    } else if (platId === 'all') {
      newPref = { platforms: ['all'], freeOnly: false, answered: true };
    } else {
      newPref = { platforms: [platId], freeOnly: false, answered: true };
    }
    setPreferences(newPref);
    localStorage.setItem('moodflix_platform_pref', JSON.stringify(newPref));
    localStorage.setItem('moodflix_pref_answered', 'true');
    window.dispatchEvent(new CustomEvent('platform-preferences-updated', { detail: newPref }));
  };

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

  // Fetch movies for selected mood strictly matching platform
  useEffect(() => {
    setLoadingMoodMovies(true);
    const platParam = isFreeOnly
      ? 'Free'
      : activeSinglePlatform
      ? activeSinglePlatform
      : 'All';

    api.get(`/movies/mood/${selectedMood}?limit=12&platform=${platParam}`)
      .then((res) => {
        if (res.data.success && res.data.movies?.length) {
          const matching = res.data.movies.filter(movieMatchesPlatform);
          if (matching.length > 0) {
            setMoodMovies(matching.slice(0, 6));
          } else {
            const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood) && movieMatchesPlatform(m));
            setMoodMovies(fb.slice(0, 6));
          }
          setMoodMeta(res.data.mood || moods.find((m) => m.id === selectedMood) || FALLBACK_MOODS[0]);
        } else {
          const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood) && movieMatchesPlatform(m));
          setMoodMovies(fb.slice(0, 6));
          setMoodMeta(moods.find((m) => m.id === selectedMood) || FALLBACK_MOODS[0]);
        }
      })
      .catch(() => {
        const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood) && movieMatchesPlatform(m));
        setMoodMovies(fb.slice(0, 6));
        setMoodMeta(moods.find((m) => m.id === selectedMood) || FALLBACK_MOODS[0]);
      })
      .finally(() => setLoadingMoodMovies(false));
  }, [selectedMood, moods, preferences]);

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

  // Showcase section movies strictly filtered by platform and subcategory
  const getShowcaseMovies = () => {
    let pool = fallbackMovies.filter(movieMatchesPlatform);
    if (freeSubcat === 'free-indian') {
      return pool.filter((m) => m.isIndianCinema).slice(0, 8);
    }
    if (freeSubcat === 'free-hindi') {
      return pool.filter((m) => m.languages?.includes('Hindi')).slice(0, 8);
    }
    if (freeSubcat === 'free-kannada') {
      return pool.filter((m) => m.languages?.includes('Kannada')).slice(0, 8);
    }
    if (freeSubcat === 'free-telugu') {
      return pool.filter((m) => m.languages?.includes('Telugu')).slice(0, 8);
    }
    if (freeSubcat === 'free-tamil') {
      return pool.filter((m) => m.languages?.includes('Tamil')).slice(0, 8);
    }
    if (freeSubcat === 'free-malayalam') {
      return pool.filter((m) => m.languages?.includes('Malayalam')).slice(0, 8);
    }
    if (freeSubcat === 'free-bengali') {
      return pool.filter((m) => m.languages?.includes('Bengali')).slice(0, 8);
    }
    if (freeSubcat === 'free-comedy') {
      return pool.filter((m) => m.genres?.includes('Comedy')).slice(0, 8);
    }
    if (freeSubcat === 'free-public-domain') {
      return pool.filter((m) => m.availabilityStatus === 'PUBLIC DOMAIN').slice(0, 8);
    }
    return pool.slice(0, 8);
  };

  // Section 5: Popular Indian Movies
  const popularIndianMovies = fallbackMovies
    .filter((m) => m.isIndianCinema && movieMatchesPlatform(m))
    .slice(0, 8);

  // Section 6: Language-based movies strictly on platform
  const langFiltered = fallbackMovies.filter(
    (m) =>
      (m.languages?.some((l) => l.toLowerCase() === selectedLanguageTab.toLowerCase()) ||
       m.originalLanguage?.toLowerCase() === selectedLanguageTab.toLowerCase()) &&
      movieMatchesPlatform(m)
  );
  const languageTabMovies = langFiltered.length > 0
    ? langFiltered.slice(0, 8)
    : fallbackMovies.filter((m) => m.isIndianCinema && movieMatchesPlatform(m)).slice(0, 8);

  // Section 7: Hindi Cinema
  const hindiMovies = fallbackMovies
    .filter((m) => m.languages?.includes('Hindi') && movieMatchesPlatform(m))
    .slice(0, 8);

  // Section 8: Regional Cinema
  const regionalMovies = fallbackMovies
    .filter(
      (m) =>
        m.isIndianCinema &&
        m.originalLanguage !== 'Hindi' &&
        m.languages?.some((l) => ['Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Assamese'].includes(l)) &&
        movieMatchesPlatform(m)
    )
    .slice(0, 8);

  // Section 9: Featured Platform Highlights / YouTube Movies
  const platformHighlightMovies = fallbackMovies
    .filter((m) => (m.ratings?.value >= 8.0 || m.featured) && movieMatchesPlatform(m))
    .slice(0, 8);

  // Section 10: Trending Movies
  const trendingMovies = fallbackMovies
    .filter((m) => (m.ratings?.value >= 7.8 || m.viewsCount > 10000) && movieMatchesPlatform(m))
    .slice(0, 8);

  // Section 11: Smart Recommendations
  const smartRecommendations = fallbackMovies
    .filter(movieMatchesPlatform)
    .slice(0, 8);

  const openPrefModal = () => {
    window.dispatchEvent(new CustomEvent('open-platform-preferences'));
  };

  return (
    <div className="home-page page-wrapper text-slate-100">
      {/* ── SECTION 1: HERO BANNER ─────────────────────────────────── */}
      <section className="hero-section container relative overflow-hidden py-14 md:py-24 text-center">
        {/* Animated Glow Ambient Mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-purple-600/35 via-pink-600/25 to-cyan-500/20 rounded-full blur-[110px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-purple-700/20 rounded-full blur-[90px] pointer-events-none animate-float" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-[90px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto space-y-7 animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-purple-500/40 text-pink-300 text-xs md:text-sm font-semibold tracking-wide shadow-lg shadow-purple-500/20 backdrop-blur-md">
            <Sparkles size={16} className="text-pink-400 animate-spin-slow" />
            <span>Personalized Free & Streaming Cinema Discovery</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-serif tracking-tight leading-tight">
            Find Your Next Movie <br />
            <span className="text-gradient-cinema drop-shadow-[0_10px_25px_rgba(236,72,153,0.35)]">
              Based on Your Mood.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover over 500+ legally free and streaming movies across 20+ Indian regional languages
            and world cinema. Zero subscription traps, honest verified badges.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a href="#mood-selector" className="btn btn-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-purple-600/35 hover:scale-105 transition-all">
              <Play size={16} fill="#fff" />
              <span>Explore by Mood</span>
            </a>
            <a href="#free-movies" className="btn btn-secondary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
              <span>🆓 Watch Free Movies</span>
            </a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-surprise-modal'))}
              className="btn btn-secondary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 bg-purple-500/20 text-purple-200 border border-purple-500/40 hover:bg-purple-500/30 hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
            >
              <span>🎲 Surprise Me!</span>
            </button>
            <Link to="/compare" className="btn btn-outline px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-all">
              <Compass size={16} />
              <span>Compare Movies</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-emerald-500/50 hover:bg-emerald-500/[0.08] transition-all duration-300 group">
              <span className="text-3xl font-extrabold text-emerald-400 block group-hover:scale-105 transition-transform">220+</span>
              <span className="text-xs text-gray-400 font-medium">100% Free Legal Movies</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-purple-500/50 hover:bg-purple-500/[0.08] transition-all duration-300 group">
              <span className="text-3xl font-extrabold text-purple-300 block group-hover:scale-105 transition-transform">20+</span>
              <span className="text-xs text-gray-400 font-medium">Indian Languages</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-pink-500/50 hover:bg-pink-500/[0.08] transition-all duration-300 group">
              <span className="text-3xl font-extrabold text-pink-400 block group-hover:scale-105 transition-transform">16</span>
              <span className="text-xs text-gray-400 font-medium">Emotional Moods</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-sky-500/50 hover:bg-sky-500/[0.08] transition-all duration-300 group">
              <span className="text-3xl font-extrabold text-sky-400 block group-hover:scale-105 transition-transform">507</span>
              <span className="text-xs text-gray-400 font-medium">Verified Titles</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INTERACTIVE PLATFORM PREFERENCE SELECTOR ──────── */}
      <section className="container mb-10 animate-fade-in">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#11192e] via-[#0d1322] to-[#131c33] border border-purple-500/35 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase font-extrabold tracking-wider text-pink-400">
                  Where would you prefer to watch your movies?
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Select your platform to filter the entire site. Only movies verified on your selected platform will appear.
              </p>
            </div>

            <button
              onClick={openPrefModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex-shrink-0"
            >
              <Settings size={13} />
              <span>More Preferences</span>
            </button>
          </div>

          {/* 1-Click Direct Platform Selection Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DIRECT_PLATFORMS.map((plat) => {
              const active =
                (plat.id === 'free-only' && preferences.freeOnly) ||
                (plat.id === 'all' && !preferences.freeOnly && preferences.platforms?.includes('all')) ||
                (!preferences.freeOnly && preferences.platforms?.length === 1 && preferences.platforms[0] === plat.id);

              return (
                <button
                  key={plat.id}
                  onClick={() => handleDirectPlatformSelect(plat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400 scale-105'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{plat.icon}</span>
                  <span>{plat.label}</span>
                  {active && <span className="text-[10px] ml-0.5">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DYNAMIC PLATFORM SHOWCASE ───────────────────── */}
      <section id="free-movies" className="container mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-2 ${
              isFreeOnly
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
            }`}>
              <CheckCircle size={14} />
              <span>{platformBadgeText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-white">
              {platformDisplayTitle}
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              {platformSubtext}
            </p>
          </div>
          <Link
            to={`/explore?${isFreeOnly ? 'freeOnly=true' : activeSinglePlatform ? `platform=${encodeURIComponent(activeSinglePlatform)}` : ''}`}
            className="btn btn-sm btn-outline text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20 self-start md:self-auto"
          >
            <span>Explore All Titles</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dynamic Subcategory Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {FREE_SUBCATEGORIES.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFreeSubcat(chip.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                freeSubcat === chip.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 font-bold'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Showcase Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {getShowcaseMovies().map((movie) => (
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

      {/* ── SECTION 7: HINDI CINEMA ON YOUR PLATFORM ─────────────── */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
              {isFreeOnly ? '🆓 No Subscription Required' : `🎬 Available on ${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')}`}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {isFreeOnly ? 'Free Hindi Movies' : `${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')} Hindi Cinema`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              {isFreeOnly
                ? 'Immortal Hindi classics and comedies legally available on YouTube and public platforms.'
                : `Hindi blockbusters and critically acclaimed stories streamable on ${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')}.`}
            </p>
          </div>
          <Link to={`/explore?language=Hindi&${isFreeOnly ? 'freeOnly=true' : activeSinglePlatform ? `platform=${encodeURIComponent(activeSinglePlatform)}` : ''}`} className="btn btn-sm btn-outline">
            <span>View All Hindi Titles</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {hindiMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 8: REGIONAL CINEMA ON YOUR PLATFORM ────────────── */}
      <section className="container mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
              {isFreeOnly ? '🆓 South Indian & Regional Gems' : `⭐ Regional Cinema on ${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')}`}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {isFreeOnly ? 'Free Regional Cinema' : `${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')} Regional Cinema`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              {isFreeOnly
                ? 'Explore Kannada, Tamil, Telugu, Malayalam, Bengali & Marathi cinema without paying subscriptions.'
                : `South Indian and regional masterworks available on your selected platform.`}
            </p>
          </div>
          <Link to={`/explore?isIndian=true&${isFreeOnly ? 'freeOnly=true' : activeSinglePlatform ? `platform=${encodeURIComponent(activeSinglePlatform)}` : ''}`} className="btn btn-sm btn-outline">
            <span>All Regional Titles</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {regionalMovies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── SECTION 9: PLATFORM HIGHLIGHTS / YOUTUBE MOVIES ────────── */}
      <section className="container mb-16">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black/60 border border-purple-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Play size={14} fill="currentColor" />
                <span>Verified Streaming Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                {isFreeOnly ? 'Free Full YouTube Movies' : `Top Rated on ${platformBadgeText.replace('Stream on ', '').replace('Watch on ', '')}`}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                {isFreeOnly
                  ? 'Uploaded legally by production houses and official public broadcast networks.'
                  : `Top-rated cinematic selections available on your chosen streaming service.`}
              </p>
            </div>
            <Link to={`/explore?sort=rating&${isFreeOnly ? 'freeOnly=true' : activeSinglePlatform ? `platform=${encodeURIComponent(activeSinglePlatform)}` : ''}`} className="btn btn-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold px-4 py-2 rounded-xl">
              <span>View All Highlights</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {platformHighlightMovies.map((movie) => (
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
