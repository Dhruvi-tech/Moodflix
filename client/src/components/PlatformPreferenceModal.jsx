import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PLATFORM_OPTIONS = [
  { id: 'free', label: 'Free Movies — No subscription required', icon: '🆓', desc: 'YouTube Free, Public Domain & Legal Web Cinema' },
  { id: 'netflix', label: 'Netflix', icon: '🎬', desc: 'Subscription required' },
  { id: 'prime', label: 'Amazon Prime Video', icon: '🍿', desc: 'Subscription required' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', desc: 'Free official movies & public uploads' },
  { id: 'all', label: 'Show Me Everything', icon: '🌐', desc: 'Full hybrid catalog across free & subscription platforms' },
];

export default function PlatformPreferenceModal({ isOpen, onClose, onSave }) {
  const { user, updatePreferences } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState(['free']);
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    // Initialize from user preferences or local storage
    const saved = localStorage.getItem('moodflix_platform_pref');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.platforms) setSelectedPlatforms(parsed.platforms);
        if (parsed.freeOnly !== undefined) setFreeOnly(parsed.freeOnly);
      } catch (e) {
        // Fallback default
      }
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
    // Default: Free Movies First
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-[#130f24]/95 border border-[#9d4edd]/30 shadow-2xl shadow-[#7b2cbf]/30 text-white overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#9d4edd]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#f72585]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
          title="Close / Skip"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f72585] bg-[#f72585]/10 border border-[#f72585]/30 rounded-full mb-3">
            🎬 Platform Preference
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white mb-2">
            Where would you prefer to watch your movies?
          </h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto">
            Not everyone has paid streaming subscriptions. Tell us what you have, and we will prioritize movies you can watch immediately.
          </p>
        </div>

        {/* Dedicated "I don't have subscriptions" option */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleFreeOnlyClick}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all duration-300 ${
              freeOnly
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                : 'bg-white/5 border-emerald-500/40 hover:bg-emerald-500/10 hover:border-emerald-400'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl flex-shrink-0">
              💎
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-300 text-base">
                  "I don't have any paid subscriptions. Show me only free movies."
                </span>
                {freeOnly && (
                  <span className="text-xs bg-emerald-500 text-black font-bold px-2 py-0.5 rounded-full">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Instantly prioritize YouTube official uploads, public domain, and verified legal free streams.
              </p>
            </div>
          </button>
        </div>

        {/* Multi-select Platforms List */}
        <div className="space-y-2.5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Or select multiple platforms you have access to:
          </p>
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = selectedPlatforms.includes(plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => togglePlatform(plat.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7b2cbf]/30 to-[#f72585]/20 border-[#9d4edd] shadow-md shadow-[#9d4edd]/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{plat.icon}</span>
                  <div>
                    <span className="font-medium text-sm text-white block">{plat.label}</span>
                    <span className="text-xs text-gray-400">{plat.desc}</span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#9d4edd] border-[#9d4edd] text-white'
                      : 'border-gray-500 bg-transparent'
                  }`}
                >
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors order-2 sm:order-1"
          >
            Skip (Default to Free Movies First)
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:flex-1 py-2.5 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#f72585] text-white shadow-lg shadow-[#9d4edd]/30 hover:opacity-95 active:scale-98 transition-all order-1 sm:order-2"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
