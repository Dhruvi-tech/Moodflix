import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, RefreshCw, Play, Info, ExternalLink, Dices } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';
import { movieMatchesPlatform, getDirectMovieWatchUrl } from '../utils/platformFilter';

const QUICK_MOODS = ['Any', 'happy', 'thriller', 'romantic', 'chill', 'comedy', 'inspirational', 'adventurous'];
const QUICK_LANGS = ['Any', 'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 'Bengali', 'English'];
const QUICK_PLATFORMS = [
  { id: 'free', label: '🆓 Free Only' },
  { id: 'youtube', label: '▶️ YouTube' },
  { id: 'netflix', label: '🎬 Netflix' },
  { id: 'prime', label: '🍿 Prime Video' },
  { id: 'hotstar', label: '⭐ Hotstar' },
  { id: 'jiocinema', label: '📺 JioCinema' },
  { id: 'all', label: '🌐 All Platforms' },
];

export default function SurpriseModal({ isOpen, onClose }) {
  const [mood, setMood] = useState('Any');
  const [language, setLanguage] = useState('Any');
  const [platform, setPlatform] = useState(() => {
    try {
      const saved = localStorage.getItem('moodflix_platform_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.freeOnly) return 'free';
        if (parsed.platforms?.length === 1 && parsed.platforms[0] !== 'all') {
          return parsed.platforms[0].toLowerCase();
        }
      }
    } catch {}
    return 'free';
  });
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinIndex, setSpinIndex] = useState(0);

  // Pick a candidate pool strictly matching the chosen platform
  const getCandidates = () => {
    const prefOverride = {
      platforms: platform === 'all' ? ['all'] : [platform],
      freeOnly: platform === 'free',
    };
    return fallbackMovies.filter((m) => {
      if (!movieMatchesPlatform(m, prefOverride)) return false;
      if (mood !== 'Any' && !m.moodTags?.includes(mood.toLowerCase())) return false;
      if (language !== 'Any') {
        const hasLang =
          m.originalLanguage?.toLowerCase() === language.toLowerCase() ||
          m.languages?.some((l) => l.toLowerCase() === language.toLowerCase()) ||
          m.dubbedLanguages?.some((l) => l.toLowerCase() === language.toLowerCase());
        if (!hasLang) return false;
      }
      return true;
    });
  };

  const handleSpin = () => {
    let pool = getCandidates();
    if (pool.length === 0) {
      pool = fallbackMovies; // fallback to entire catalog
    }

    setIsSpinning(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * pool.length);
      setSelectedMovie(pool[randIdx]);
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        const finalMovie = pool[Math.floor(Math.random() * pool.length)];
        setSelectedMovie(finalMovie);
        setIsSpinning(false);
      }
    }, 80);
  };

  useEffect(() => {
    if (isOpen && !selectedMovie) {
      handleSpin();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-5 rounded-2xl bg-[#0d1322] border border-purple-500/30 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Dices size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white leading-none">
              Surprise Movie Picker
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Can't decide? Let MoodFlix spin the wheel for you!
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-2 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Mood:</span>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-[#151c30] border border-white/10 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400"
            >
              {QUICK_MOODS.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#151c30] border border-white/10 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400"
            >
              {QUICK_LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Platform:</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-[#151c30] border border-white/10 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400"
            >
              {QUICK_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roulette Movie Card Display */}
        {selectedMovie && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 flex gap-3 items-center transition-all ${
              isSpinning ? 'scale-[0.98] blur-[0.5px] opacity-75' : 'scale-100 shadow-xl'
            }`}
          >
            <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md border border-white/10">
              <img
                src={selectedMovie.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200'}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[9px] font-black px-1 rounded bg-black/80 text-yellow-400">
                ⭐ {selectedMovie.ratings?.value || 'N/A'}
              </span>
            </div>

            <div className="flex-1 min-w-0 text-left">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1 ${
                  selectedMovie.availabilityType === 'subscription'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {selectedMovie.availabilityType === 'subscription' ? 'Subscription' : 'Free to Watch'}
              </span>
              <h3 className="text-sm font-extrabold text-white truncate">{selectedMovie.title}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {selectedMovie.releaseYear} • {selectedMovie.originalLanguage || selectedMovie.languages?.[0]} • {selectedMovie.runtime}m
              </p>
              <p className="text-[11px] text-gray-300 line-clamp-2 mt-1 leading-snug">
                {selectedMovie.overview}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          {selectedMovie && !isSpinning && (
            <div className="grid grid-cols-2 gap-2">
              <a
                href={getDirectMovieWatchUrl(selectedMovie, platform)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:opacity-95 transition-all"
              >
                <Play size={13} fill="currentColor" />
                <span>Watch Stream</span>
                <ExternalLink size={11} className="opacity-80" />
              </a>
              <Link
                to={`/movies/${selectedMovie.slug || selectedMovie._id}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold transition-all"
              >
                <Info size={13} />
                <span>Full Details</span>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isSpinning ? 'animate-spin' : ''} />
            <span>{isSpinning ? 'Selecting...' : '🎲 Spin Again (Surprise Me)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
