import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Plus, Play, ExternalLink, Check, Sparkles, Scale, Info, Film } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';

// Helper for watch URL
function getPlatformWatchUrl(movie, platform, rawUrl) {
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
    return rawUrl;
  }
  const cleanTitle = encodeURIComponent(movie.title);
  const year = movie.releaseYear || '';
  const plat = (platform || '').toLowerCase();

  if (plat.includes('netflix')) {
    return `https://www.netflix.com/search?q=${cleanTitle}`;
  }
  if (plat.includes('prime') || plat.includes('amazon')) {
    return `https://www.amazon.com/s?k=${cleanTitle}+movie&i=instant-video`;
  }
  if (plat.includes('hotstar') || plat.includes('disney')) {
    return `https://www.hotstar.com/in/search?q=${cleanTitle}`;
  }
  if (plat.includes('jio')) {
    return `https://www.jiocinema.com/search/${cleanTitle}`;
  }
  return `https://www.youtube.com/results?search_query=${cleanTitle}+${year}+full+movie`;
}

const PRESET_COMPARISONS = [
  { name: 'Classic Action Clash', titles: ['Sholay', 'Deewaar'] },
  { name: 'South Blockbusters', titles: ['RRR', 'Baahubali: The Beginning'] },
  { name: 'Mythological Thrillers', titles: ['Tumbbad', 'Kantara'] },
  { name: 'Evergreen Comedies', titles: ['Gol Maal', 'Chupke Chupke'] },
  { name: 'Sci-Fi & Time Loops', titles: ['Interstellar', 'Inception'] },
];

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState(fallbackMovies);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlot, setActiveSlot] = useState(null); // which slot is picking (0, 1, 2)

  // Initialize from URL params or default presets
  useEffect(() => {
    const ids = searchParams.get('movies');
    if (ids) {
      const titlesOrIds = ids.split(',').map((s) => s.trim().toLowerCase());
      const matched = catalog.filter((m) =>
        titlesOrIds.includes((m._id || '').toLowerCase()) ||
        titlesOrIds.includes((m.slug || '').toLowerCase()) ||
        titlesOrIds.includes(m.title.toLowerCase())
      );
      if (matched.length >= 2) {
        setSelectedMovies(matched.slice(0, 3));
        return;
      }
    }

    // Default: first preset
    const defaultM1 = catalog.find((m) => m.title.toLowerCase() === 'sholay') || catalog[0];
    const defaultM2 = catalog.find((m) => m.title.toLowerCase() === 'deewaar') || catalog[1];
    setSelectedMovies([defaultM1, defaultM2].filter(Boolean));
  }, []);

  // Update query params when selection changes
  const updateSelected = (newList) => {
    setSelectedMovies(newList);
    const slugs = newList.map((m) => m.slug || m.title).join(',');
    setSearchParams({ movies: slugs });
  };

  const handleSelectMovie = (movie, slotIndex) => {
    const updated = [...selectedMovies];
    if (slotIndex < updated.length) {
      updated[slotIndex] = movie;
    } else {
      updated.push(movie);
    }
    updateSelected(updated);
    setActiveSlot(null);
    setSearchQuery('');
  };

  const handleRemoveSlot = (index) => {
    const updated = selectedMovies.filter((_, i) => i !== index);
    updateSelected(updated);
  };

  const handleApplyPreset = (preset) => {
    const found = preset.titles
      .map((t) => catalog.find((m) => m.title.toLowerCase() === t.toLowerCase()))
      .filter(Boolean);
    if (found.length >= 2) {
      updateSelected(found);
    }
  };

  // Filter search candidates
  const filteredCandidates = searchQuery.trim()
    ? catalog
        .filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.languages?.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 10)
    : catalog.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#070b14] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scale size={14} />
            <span>Side-by-Side Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-purple-300">
            Compare Movies Head-to-Head
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto mt-2">
            Evaluate release years, IMDb ratings, runtimes, genres, regional Indian audio languages, and streaming availability to pick the perfect movie for tonight.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-xs text-gray-400 font-medium mr-1">Popular matchups:</span>
          {PRESET_COMPARISONS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-white transition-all font-medium"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Slot Selector Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((slotIdx) => {
            const movie = selectedMovies[slotIdx];
            const isPicking = activeSlot === slotIdx;

            if (movie && !isPicking) {
              return (
                <div
                  key={`slot-${slotIdx}`}
                  className="p-4 rounded-xl bg-[#0e1424] border border-purple-500/20 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={movie.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=120'}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                        Movie {slotIdx + 1}
                      </span>
                      <h3 className="font-bold text-white text-sm truncate">{movie.title}</h3>
                      <p className="text-xs text-gray-400">
                        {movie.releaseYear} • ⭐ {movie.ratings?.value || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSlot(slotIdx)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                    >
                      Change
                    </button>
                    {selectedMovies.length > 2 && (
                      <button
                        onClick={() => handleRemoveSlot(slotIdx)}
                        className="text-gray-400 hover:text-red-400 p-1"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            if (isPicking) {
              return (
                <div
                  key={`picking-${slotIdx}`}
                  className="p-4 rounded-xl bg-[#11192e] border-2 border-purple-500 shadow-xl relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-300">
                      Select Movie {slotIdx + 1}
                    </span>
                    <button
                      onClick={() => setActiveSlot(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search title, director, language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredCandidates.map((cand) => (
                      <button
                        key={cand._id || cand.slug || cand.title}
                        onClick={() => handleSelectMovie(cand, slotIdx)}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 text-xs transition-colors"
                      >
                        <img
                          src={cand.poster}
                          alt=""
                          className="w-6 h-8 object-cover rounded flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{cand.title}</p>
                          <p className="text-[10px] text-gray-400">
                            {cand.releaseYear} • {cand.languages?.[0] || 'Unknown'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            // Empty Slot (slotIdx === 2)
            if (slotIdx === 2 && selectedMovies.length === 2) {
              return (
                <button
                  key="slot-add"
                  onClick={() => setActiveSlot(2)}
                  className="p-4 rounded-xl border border-dashed border-white/20 hover:border-purple-500/50 bg-white/[0.02] hover:bg-purple-500/5 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-purple-300 transition-all min-h-[88px]"
                >
                  <Plus size={18} />
                  <span className="text-xs font-semibold">+ Add 3rd Movie for Comparison</span>
                </button>
              );
            }

            return null;
          })}
        </div>

        {/* Side-by-Side Comparison Matrix */}
        {selectedMovies.length >= 2 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0f1d] shadow-2xl">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-44">
                    Attribute
                  </th>
                  {selectedMovies.map((m, idx) => (
                    <th key={m._id || m.title} className="p-4 align-top min-w-[240px]">
                      <div className="space-y-3">
                        <div className="relative aspect-[2/3] w-full max-w-[200px] rounded-xl overflow-hidden shadow-lg border border-white/10 mx-auto">
                          <img
                            src={m.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400'}
                            alt={m.title}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded shadow ${
                              m.availabilityType === 'subscription'
                                ? 'bg-amber-500 text-black'
                                : 'bg-emerald-500 text-white'
                            }`}
                          >
                            {m.availabilityType === 'subscription'
                              ? 'SUBSCRIPTION'
                              : m.availabilityType === 'free-with-ads'
                              ? 'FREE WITH ADS'
                              : 'FREE TO WATCH'}
                          </span>
                        </div>
                        <div className="text-center">
                          <h2 className="font-extrabold text-base text-white">{m.title}</h2>
                          <p className="text-xs text-purple-400 font-semibold">{m.releaseYear}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 max-w-[200px] mx-auto">
                          <a
                            href={getPlatformWatchUrl(
                              m,
                              m.streamingPlatforms?.[0]?.name,
                              m.streamingPlatforms?.[0]?.url
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all"
                          >
                            <Play size={13} fill="currentColor" />
                            <span>Watch Now</span>
                            <ExternalLink size={11} className="opacity-80" />
                          </a>
                          <Link
                            to={`/movies/${m.slug || m._id}`}
                            className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold transition-all"
                          >
                            <Info size={12} />
                            <span>Full Details</span>
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {/* IMDb Rating */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">IMDb Rating</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-yellow-400 text-sm">
                        <span>⭐</span>
                        <span>{m.ratings?.value || 'N/A'}/10</span>
                        {m.ratings?.count && (
                          <span className="text-[11px] font-normal text-gray-400">
                            ({m.ratings.count.toLocaleString()} votes)
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Runtime */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Runtime</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4 text-gray-200 font-medium">
                      {m.runtime ? `${m.runtime} mins (${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m)` : 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Primary Genres */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Genres</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {m.genres?.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Original Language */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Original Language</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4 text-emerald-400 font-bold">
                      {m.originalLanguage || m.languages?.[0] || 'Unknown'}
                    </td>
                  ))}
                </tr>

                {/* Dubbed Audio Languages */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Dubbed Audio</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4">
                      {m.dubbedLanguages && m.dubbedLanguages.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.dubbedLanguages.map((l) => (
                            <span
                              key={l}
                              className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[10px]"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Original audio only</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Subtitles */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Subtitles</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4 text-gray-300">
                      {m.subtitleLanguages?.join(', ') || 'English'}
                    </td>
                  ))}
                </tr>

                {/* Mood Tags */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Mood Vibes</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {m.moodTags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[10px] capitalize font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Streaming Platforms */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Available On</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4">
                      <div className="space-y-1">
                        {m.streamingPlatforms?.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-200">
                            <Check size={12} className="text-emerald-400" />
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-[10px] text-gray-400">
                              ({p.type || (m.isFree ? 'Free' : 'Subscription')})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Director & Cast */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Director</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4 text-gray-200 font-semibold">
                      {m.director || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-300">Key Cast</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4 text-gray-300 leading-relaxed">
                      {m.cast?.slice(0, 4).join(', ') || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Story Overview */}
                <tr>
                  <td className="p-4 font-bold text-gray-300">Storyline</td>
                  {selectedMovies.map((m) => (
                    <td key={m._id || m.title} className="p-4 text-gray-400 leading-relaxed text-[11px]">
                      {m.overview}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
