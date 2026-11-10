import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check } from 'lucide-react';

const PLATFORM_OPTIONS = [
  { id: 'free', label: 'Free Movies', icon: '🆓' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'netflix', label: 'Netflix', icon: '🎬' },
  { id: 'prime', label: 'Amazon Prime', icon: '🍿' },
  { id: 'hotstar', label: 'Disney+ Hotstar', icon: '⭐' },
  { id: 'jiocinema', label: 'JioCinema', icon: '📺' },
];

export default function PlatformPreferenceModal({ isOpen, onClose, onSave }) {
  const { user, updatePreferences } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState(['free']);
  const [freeOnly, setFreeOnly] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('moodflix_platform_pref');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.platforms) setSelectedPlatforms(parsed.platforms);
        if (parsed.freeOnly !== undefined) setFreeOnly(parsed.freeOnly);
      } catch (e) {}
    } else if (user?.preferences?.preferredPlatforms?.length) {
      setSelectedPlatforms(user.preferences.preferredPlatforms);
      if (user.preferences.freeOnly !== undefined) {
        setFreeOnly(user.preferences.freeOnly);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Single-platform exclusive select (e.g. "I only have Netflix")
  const selectExclusive = (id) => {
    if (id === 'free') {
      setSelectedPlatforms(['free']);
      setFreeOnly(true);
    } else if (id === 'all') {
      setSelectedPlatforms(['free', 'youtube', 'netflix', 'prime', 'hotstar', 'jiocinema']);
      setFreeOnly(false);
    } else {
      setSelectedPlatforms([id]);
      setFreeOnly(false);
    }
  };

  const togglePlatform = (id) => {
    let updated = [...selectedPlatforms];
    if (updated.includes(id)) {
      updated = updated.filter((p) => p !== id);
    } else {
      updated.push(id);
    }

    if (updated.length === 0) {
      updated = ['free'];
      setFreeOnly(true);
    }

    setSelectedPlatforms(updated);
    if (!updated.includes('free') && !updated.includes('youtube')) {
      setFreeOnly(false);
    }
  };

  const handleSave = () => {
    const prefData = {
      platforms: selectedPlatforms,
      freeOnly: freeOnly && (selectedPlatforms.includes('free') || selectedPlatforms.includes('youtube')),
      answered: true,
      timestamp: Date.now(),
    };

    localStorage.setItem('moodflix_platform_pref', JSON.stringify(prefData));
    localStorage.setItem('moodflix_pref_answered', 'true');
    if (updatePreferences) {
      updatePreferences({
        preferredPlatforms: selectedPlatforms,
        freeOnly: prefData.freeOnly,
      });
    }

    window.dispatchEvent(new CustomEvent('platform-preferences-updated', { detail: prefData }));
    if (onSave) onSave(prefData);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    const defaultData = {
      platforms: ['free'],
      freeOnly: true,
      answered: true,
      timestamp: Date.now(),
    };

    localStorage.setItem('moodflix_platform_pref', JSON.stringify(defaultData));
    localStorage.setItem('moodflix_pref_answered', 'true');
    window.dispatchEvent(new CustomEvent('platform-preferences-updated', { detail: defaultData }));
    if (onSave) onSave(defaultData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md p-5 rounded-2xl bg-[#0e1424] border border-purple-500/40 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close / Skip"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-3 text-left pr-6">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-1">
            <span>🎬</span>
            <span>Platform Preference</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
            Where would you prefer to watch your movies?
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            If you select one platform, only that platform's movies will show.
          </p>
        </div>

        {/* 1-Click Exclusive Quick Picks */}
        <div className="mb-3 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
          <span className="text-[11px] font-bold text-purple-300 block mb-1.5 uppercase tracking-wider">
            Quick 1-Click Select:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => selectExclusive('free')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                freeOnly && selectedPlatforms.length === 1 && selectedPlatforms[0] === 'free'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              🆓 Only Free
            </button>
            <button
              type="button"
              onClick={() => selectExclusive('netflix')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                !freeOnly && selectedPlatforms.length === 1 && selectedPlatforms[0] === 'netflix'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              🎬 Only Netflix
            </button>
            <button
              type="button"
              onClick={() => selectExclusive('prime')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                !freeOnly && selectedPlatforms.length === 1 && selectedPlatforms[0] === 'prime'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              🍿 Only Prime
            </button>
            <button
              type="button"
              onClick={() => selectExclusive('youtube')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              ▶️ Only YouTube
            </button>
            <button
              type="button"
              onClick={() => selectExclusive('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedPlatforms.length > 2 && !freeOnly
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              🌐 Show All
            </button>
          </div>
        </div>

        {/* Multi-select Platform Pills */}
        <div className="mb-3">
          <span className="text-[11px] text-gray-400 font-medium block mb-1.5">
            Or customize multiple platforms:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORM_OPTIONS.map((plat) => {
              const isSelected = selectedPlatforms.includes(plat.id);
              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => togglePlatform(plat.id)}
                  className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all text-xs ${
                    isSelected
                      ? 'bg-purple-600/25 border-purple-400 text-white font-semibold shadow-sm shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{plat.icon}</span>
                    <span className="truncate">{plat.label}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ml-1.5 transition-colors ${
                      isSelected
                        ? 'bg-purple-500 border-purple-400 text-white'
                        : 'border-white/20 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Free Only Choice */}
        <div className="mb-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
          <label className="font-semibold text-gray-200 block mb-1.5">
            Do you want to see only free movies?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setFreeOnly(true);
                setSelectedPlatforms(['free']);
              }}
              className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                freeOnly
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm ring-1 ring-emerald-400/40'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>💎 Yes, only free</span>
            </button>
            <button
              type="button"
              onClick={() => setFreeOnly(false)}
              className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                !freeOnly
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-sm ring-1 ring-purple-400/40'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>🌐 Selected Platforms</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors py-1.5 px-2 font-medium"
          >
            Skip (Free First)
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 hover:opacity-95 active:scale-95 transition-all"
          >
            Apply Preference
          </button>
        </div>
      </div>
    </div>
  );
}
