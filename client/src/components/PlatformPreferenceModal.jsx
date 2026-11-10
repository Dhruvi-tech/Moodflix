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
  const [selectedPlatforms, setSelectedPlatforms] = useState(['free', 'youtube']);
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
  }, [user]);

  if (!isOpen) return null;

  const togglePlatform = (id) => {
    let updated = [...selectedPlatforms];
    if (updated.includes(id)) {
      updated = updated.filter((p) => p !== id);
    } else {
      updated.push(id);
    }

    if (updated.length === 0) {
      updated = ['free'];
    }

    setSelectedPlatforms(updated);
    if (!updated.includes('free') && !updated.includes('youtube')) {
      setFreeOnly(false);
    }
  };

  const selectAll = () => {
    setSelectedPlatforms(PLATFORM_OPTIONS.map((p) => p.id));
    setFreeOnly(false);
  };

  const clearSelection = () => {
    setSelectedPlatforms(['free']);
    setFreeOnly(true);
  };

  const handleSave = () => {
    const prefData = {
      platforms: selectedPlatforms,
      freeOnly,
      answered: true,
      timestamp: Date.now(),
    };

    localStorage.setItem('moodflix_platform_pref', JSON.stringify(prefData));
    if (updatePreferences) {
      updatePreferences({
        preferredPlatforms: selectedPlatforms,
        freeOnly,
      });
    }

    window.dispatchEvent(new CustomEvent('platform-preferences-updated', { detail: prefData }));
    if (onSave) onSave(prefData);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    const defaultData = {
      platforms: ['free', 'youtube'],
      freeOnly: true,
      answered: true,
      timestamp: Date.now(),
    };

    localStorage.setItem('moodflix_platform_pref', JSON.stringify(defaultData));
    window.dispatchEvent(new CustomEvent('platform-preferences-updated', { detail: defaultData }));
    if (onSave) onSave(defaultData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md p-5 rounded-2xl bg-[#0e1424] border border-purple-500/30 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close / Skip"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-3.5 text-left pr-6">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-1">
            <span>🎬</span>
            <span>Platform Preference</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
            Which streaming platforms do you use?
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Select what you have access to. We prioritize movies you can watch immediately.
          </p>
        </div>

        {/* Quick controls: Select All / Clear */}
        <div className="flex items-center justify-between mb-2 text-[11px]">
          <span className="text-gray-400 font-medium">Select platforms:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Select All
            </button>
            <span className="text-gray-600">•</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-300 font-semibold transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Multi-select Platform Pills */}
        <div className="grid grid-cols-2 gap-2 mb-3.5">
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

        {/* Question 2: Free Only Choice */}
        <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
          <label className="font-semibold text-gray-200 block mb-2">
            Do you want to see only free movies?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setFreeOnly(true);
                setSelectedPlatforms(['free', 'youtube']);
              }}
              className={`py-2 px-2 rounded-lg border text-center transition-all ${
                freeOnly
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>💎 Yes, only free</span>
            </button>
            <button
              type="button"
              onClick={() => setFreeOnly(false)}
              className={`py-2 px-2 rounded-lg border text-center transition-all ${
                !freeOnly
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-sm shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>🌐 Free + Subscriptions</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10 text-xs">
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
            className="py-2 px-5 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 hover:opacity-95 active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
