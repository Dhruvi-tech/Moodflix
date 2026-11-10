import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, SlidersHorizontal, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    id: 'free',
    label: 'Only Free Movies',
    icon: '🆓',
    badge: '100% Free',
    desc: 'No subscription required',
    color: '#10b981',
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300',
  },
  {
    id: 'netflix',
    label: 'Only Netflix',
    icon: '🎬',
    badge: '104 Films',
    desc: 'Exclusive Netflix titles',
    color: '#e50914',
    ring: 'ring-red-500',
    bg: 'bg-red-500/15 border-red-500/50 text-red-300',
  },
  {
    id: 'prime',
    label: 'Only Prime Video',
    icon: '🍿',
    badge: '91 Films',
    desc: 'Exclusive Prime titles',
    color: '#00a8e1',
    ring: 'ring-sky-500',
    bg: 'bg-sky-500/15 border-sky-500/50 text-sky-300',
  },
  {
    id: 'youtube',
    label: 'Only YouTube',
    icon: '▶️',
    badge: '222 Films',
    desc: 'Official free YouTube films',
    color: '#ff0000',
    ring: 'ring-rose-500',
    bg: 'bg-rose-500/15 border-rose-500/50 text-rose-300',
  },
  {
    id: 'hotstar',
    label: 'Hotstar & Jio',
    icon: '⭐',
    badge: '67 Films',
    desc: 'Regional & blockbuster hits',
    color: '#a855f7',
    ring: 'ring-purple-500',
    bg: 'bg-purple-500/15 border-purple-500/50 text-purple-300',
  },
  {
    id: 'all',
    label: 'All Platforms',
    icon: '🌐',
    badge: '507 Films',
    desc: 'Explore the full catalog',
    color: '#c084fc',
    ring: 'ring-indigo-500',
    bg: 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300',
  },
];

export default function PlatformPreferenceModal({ isOpen, onClose, onSave }) {
  const { user, updatePreferences } = useAuth();
  const [selectedId, setSelectedId] = useState('free');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [customPlatforms, setCustomPlatforms] = useState(['free']);

  useEffect(() => {
    const saved = localStorage.getItem('moodflix_platform_pref');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.freeOnly) {
          setSelectedId('free');
          setCustomPlatforms(['free']);
        } else if (parsed.platforms?.length === 1) {
          setSelectedId(parsed.platforms[0]);
          setCustomPlatforms(parsed.platforms);
        } else if (parsed.platforms?.includes('all')) {
          setSelectedId('all');
          setCustomPlatforms(['all']);
        } else if (parsed.platforms?.length > 1) {
          setSelectedId('custom');
          setMultiSelectMode(true);
          setCustomPlatforms(parsed.platforms);
        }
      } catch (e) {}
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (id) => {
    setSelectedId(id);
    if (id === 'free') {
      setCustomPlatforms(['free']);
    } else if (id === 'all') {
      setCustomPlatforms(['all']);
    } else if (id === 'hotstar') {
      setCustomPlatforms(['hotstar', 'jiocinema']);
    } else {
      setCustomPlatforms([id]);
    }
  };

  const handleToggleCustom = (id) => {
    let next = [...customPlatforms];
    if (next.includes(id)) {
      next = next.filter((p) => p !== id);
    } else {
      next.push(id);
    }
    if (next.length === 0) next = ['free'];
    setCustomPlatforms(next);
  };

  const handleSave = (chosenId = selectedId, chosenPlats = customPlatforms) => {
    let prefData;
    if (chosenId === 'free') {
      prefData = {
        platforms: ['free'],
        freeOnly: true,
        answered: true,
        timestamp: Date.now(),
      };
    } else if (chosenId === 'all') {
      prefData = {
        platforms: ['all'],
        freeOnly: false,
        answered: true,
        timestamp: Date.now(),
      };
    } else if (chosenId === 'hotstar') {
      prefData = {
        platforms: ['hotstar', 'jiocinema'],
        freeOnly: false,
        answered: true,
        timestamp: Date.now(),
      };
    } else if (multiSelectMode) {
      prefData = {
        platforms: chosenPlats,
        freeOnly: chosenPlats.length === 1 && chosenPlats[0] === 'free',
        answered: true,
        timestamp: Date.now(),
      };
    } else {
      prefData = {
        platforms: [chosenId],
        freeOnly: false,
        answered: true,
        timestamp: Date.now(),
      };
    }

    localStorage.setItem('moodflix_platform_pref', JSON.stringify(prefData));
    localStorage.setItem('moodflix_pref_answered', 'true');

    if (updatePreferences) {
      updatePreferences({
        preferredPlatforms: prefData.platforms,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[390px] p-4 sm:p-5 rounded-2xl bg-[#0d1322] border border-purple-500/30 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close / Default to Free"
        >
          <X size={15} />
        </button>

        {/* Compact Header */}
        <div className="mb-3 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1">
            <Sparkles size={10} />
            <span>Platform Selection</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
            Where do you prefer to watch?
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Select one platform. Movies from other platforms are completely hidden.
          </p>
        </div>

        {/* Compact 2-Column Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {PRESETS.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPreset(item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${item.bg} ring-2 ${item.ring} shadow-lg scale-[1.02]`
                    : 'bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{item.icon}</span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight truncate">
                    {item.label}
                  </span>
                  <span className="text-[10px] opacity-75 block truncate">
                    {item.desc}
                  </span>
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] text-gray-400 hover:text-white transition-colors py-1 px-1.5 font-medium"
          >
            Skip (Free First)
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="py-1.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all"
          >
            Apply Preference
          </button>
        </div>
      </div>
    </div>
  );
}
