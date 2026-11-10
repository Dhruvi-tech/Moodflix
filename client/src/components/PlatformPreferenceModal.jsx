import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check } from 'lucide-react';

const PLATFORM_OPTIONS = [
  { id: 'free', label: 'Free Movies', icon: '🆓' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'netflix', label: 'Netflix', icon: '🎬' },
  { id: 'prime', label: 'Prime Video', icon: '🍿' },
  { id: 'all', label: 'Show Everything', icon: '🌐' },
];

export default function PlatformPreferenceModal({ isOpen, onClose, onSave }) {
  const { user, updatePreferences } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState(['free']);
  const [freeOnly, setFreeOnly] = useState(false);

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
    if (id === 'all') {
      setSelectedPlatforms(['all']);
      setFreeOnly(false);
      return;
    }

    let updated = selectedPlatforms.filter((p) => p !== 'all');
    if (updated.includes(id)) {
      updated = updated.filter((p) => p !== id);
    } else {
      updated.push(id);
    }

    if (updated.length === 0) {
      updated = ['free'];
    }

    setSelectedPlatforms(updated);
    setFreeOnly(updated.length === 1 && updated.includes('free'));
  };

  const handleFreeOnlyClick = () => {
    setSelectedPlatforms(['free', 'youtube']);
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
    if (onSave) onSave(defaultData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md p-4 sm:p-5 rounded-2xl bg-[#0e1424] border border-purple-500/30 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close / Skip"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-3 text-left pr-6">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-1">
            <span>🎬</span>
            <span>Platform Filter</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
            Where would you like to watch?
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Select your platforms or choose free movies without subscriptions.
          </p>
        </div>

        {/* Free Only Option */}
        <button
          type="button"
          onClick={handleFreeOnlyClick}
          className={`w-full py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-all text-xs mb-3 ${
            freeOnly
              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/50'
              : 'bg-white/5 border-emerald-500/30 text-gray-300 hover:bg-emerald-500/10'
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            <span>💎</span>
            <span>I only want free movies (no paid subscriptions)</span>
          </span>
          {freeOnly && (
            <span className="text-[10px] bg-emerald-400 text-black font-extrabold px-1.5 py-0.5 rounded">
              ACTIVE
            </span>
          )}
        </button>

        {/* Multi-select Platform Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = selectedPlatforms.includes(plat.id) && !freeOnly;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => togglePlatform(plat.id)}
                className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-between transition-all text-xs ${
                  isSelected
                    ? 'bg-purple-600/25 border-purple-400 text-white font-semibold shadow-sm shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
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

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors py-1.5 px-2"
          >
            Skip (Free First)
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-1.5 px-4 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 hover:opacity-95 active:scale-95 transition-all"
          >
            Save Filter
          </button>
        </div>
      </div>
    </div>
  );
}
