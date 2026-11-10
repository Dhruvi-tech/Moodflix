import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import MoodChip from '../components/MoodChip';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Sparkles, SlidersHorizontal, Info, CheckCircle } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';
import { FALLBACK_MOODS } from '../data/fallbackMoods';

const Moods = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVibe = searchParams.get('vibe') || 'happy';

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('moodflix_platform_pref');
      return saved ? JSON.parse(saved) : { platforms: ['free'], freeOnly: true };
    } catch {
      return { platforms: ['free'], freeOnly: true };
    }
  });

  const [moods, setMoods] = useState(FALLBACK_MOODS);
  const [selectedMoodId, setSelectedMoodId] = useState(initialVibe);
  const [currentMood, setCurrentMood] = useState(
    () => FALLBACK_MOODS.find((m) => m.id === initialVibe) || FALLBACK_MOODS[0]
  );
  const [movies, setMovies] = useState([]);
  const [genreFilter, setGenreFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [loading, setLoading] = useState(false);

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

  // Strict movie matcher: only shows movies available on the selected platform
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

  // Fetch all moods
  useEffect(() => {
    api.get('/moods').then((res) => {
      if (res.data.success && res.data.moods?.length) {
        setMoods(res.data.moods);
        const match = res.data.moods.find((m) => m.id === selectedMoodId) || res.data.moods[0];
        setCurrentMood(match);
      }
    }).catch(() => {});
  }, []);

  // Fetch movies for active mood strictly matching platform
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const platParam = preferences.freeOnly
          ? 'Free'
          : preferences.platforms?.length === 1 && preferences.platforms[0] !== 'all'
          ? preferences.platforms[0]
          : 'All';

        const params = { limit: 24, platform: platParam };
        if (genreFilter !== 'All') params.genre = genreFilter;
        if (languageFilter !== 'All') params.language = languageFilter;

        const res = await api.get(`/movies/mood/${selectedMoodId}`, { params });
        if (res.data.success && res.data.movies?.length) {
          const matched = res.data.movies.filter(movieMatchesPlatform);
          if (matched.length > 0) {
            setMovies(matched);
          } else {
            const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMoodId) && movieMatchesPlatform(m));
            setMovies(fb);
          }
          setCurrentMood(res.data.mood || FALLBACK_MOODS.find((m) => m.id === selectedMoodId));
        } else {
          const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMoodId) && movieMatchesPlatform(m));
          setMovies(fb);
        }
      } catch (err) {
        const fb = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMoodId) && movieMatchesPlatform(m));
        setMovies(fb);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
    setSearchParams({ vibe: selectedMoodId });
  }, [selectedMoodId, genreFilter, languageFilter, preferences]);

  const handleMoodClick = (id) => {
    setSelectedMoodId(id);
    setGenreFilter('All');
    setLanguageFilter('All');
  };

  return (
    <div className="moods-page page-wrapper container text-slate-100">
      {/* ── Section Header ───────────────────────────────── */}
      <div className="section-head text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#f72585] px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 inline-block mb-2">
          16 Emotional Palettes
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Curated Mood Engine</h2>
        <p className="text-sm text-gray-300 max-w-xl mx-auto mt-1">
          Explore curated emotional palettes designed to find the exact films matching your mood on your selected platform.
        </p>
      </div>

      {/* ── Active Platform Filter Status (No unselected platforms shown on top) ── */}
      <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-8 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-gray-400 font-medium">Platform Filter:</span>
          <span className="font-extrabold text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10">
            {preferences.freeOnly
              ? '🆓 Free Movies Only'
              : preferences.platforms?.map((p) => p.toUpperCase()).join(', ')}
          </span>
          <span className="text-gray-400 hidden sm:inline">
            • Mood recommendations strictly tailored to your active platform. Unselected platforms are hidden.
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

      {/* ── 16 Mood Grid ─────────────────────────────────── */}
      <div className="all-moods-grid mb-8">
        {moods.map((m) => (
          <MoodChip
            key={m.id}
            mood={m}
            count={m.movieCount}
            active={selectedMoodId === m.id}
            onClick={handleMoodClick}
          />
        ))}
      </div>

      {/* ── Selected Mood Detail Banner ──────────────────── */}
      {currentMood && (
        <div
          className="selected-mood-banner glass-panel mb-8 p-6 rounded-2xl border border-white/10"
          style={{ '--accent-color': currentMood.accent || '#8b5cf6' }}
        >
          <div className="mood-banner-content">
            <span className="mood-banner-emoji text-4xl">{currentMood.emoji}</span>
            <div className="mood-banner-text">
              <h3 className="text-2xl font-bold font-serif text-white">{currentMood.label} Cinema</h3>
              <p className="text-sm text-gray-300 mt-1">{currentMood.tagline}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-purple-300">
                  Showing <strong>{movies.length}</strong> matching titles on your active platform
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Movie Results Grid ───────────────────────────── */}
      {loading ? (
        <LoadingSpinner text={`Finding ${currentMood?.label || ''} titles on your platform...`} />
      ) : movies.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={`No ${currentMood?.label || ''} movies on this platform`}
          description="Try selecting another platform or explore our free movies collection."
          actionText="Switch Platform"
          actionLink="/"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Moods;
