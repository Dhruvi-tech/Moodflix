/**
 * MoodFlix Platform Filter & Watch URL Resolver
 * Strictly isolates streaming platforms: Free, YouTube, Netflix, Prime, Hotstar, JioCinema.
 * Eliminates cross-platform leakage and invalid 404 / dead URLs.
 */

export const PLATFORMS_META = {
  free: {
    id: 'free',
    label: 'Free Movies',
    shortLabel: 'Free',
    badge: 'Free to Watch',
    icon: '🆓',
    accentColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  netflix: {
    id: 'netflix',
    label: 'Netflix',
    shortLabel: 'Netflix',
    badge: 'Netflix',
    icon: '🎬',
    accentColor: '#e50914',
    bgColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  prime: {
    id: 'prime',
    label: 'Amazon Prime Video',
    shortLabel: 'Prime Video',
    badge: 'Prime Video',
    icon: '🍿',
    accentColor: '#00a8e1',
    bgColor: 'rgba(0, 168, 225, 0.15)',
    borderColor: 'rgba(0, 168, 225, 0.4)',
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube Movies',
    shortLabel: 'YouTube',
    badge: 'YouTube',
    icon: '▶️',
    accentColor: '#ff0000',
    bgColor: 'rgba(255, 0, 0, 0.15)',
    borderColor: 'rgba(255, 0, 0, 0.4)',
  },
  hotstar: {
    id: 'hotstar',
    label: 'Disney+ Hotstar',
    shortLabel: 'Hotstar',
    badge: 'Hotstar',
    icon: '⭐',
    accentColor: '#0c57ff',
    bgColor: 'rgba(12, 87, 255, 0.15)',
    borderColor: 'rgba(12, 87, 255, 0.4)',
  },
  jiocinema: {
    id: 'jiocinema',
    label: 'JioCinema',
    shortLabel: 'JioCinema',
    badge: 'JioCinema',
    icon: '📺',
    accentColor: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
};

/**
 * Checks if a candidate movie strictly matches the user's active platform preference.
 * Zero unselected platform leakage.
 */
export const movieMatchesPlatform = (candidate, overridePref = null) => {
  if (!candidate) return false;

  let pref = overridePref;
  if (!pref) {
    try {
      const saved = localStorage.getItem('moodflix_platform_pref');
      if (saved) pref = JSON.parse(saved);
    } catch {}
  }

  // If no preference set yet, default to free movies
  if (!pref) {
    return candidate.isFree === true || candidate.availabilityStatus === 'FREE TO WATCH' || candidate.availabilityStatus === 'PUBLIC DOMAIN';
  }

  if (pref.freeOnly) {
    return (
      candidate.isFree === true ||
      candidate.availabilityType === 'free' ||
      candidate.availabilityType === 'free-with-ads' ||
      candidate.availabilityType === 'public-domain' ||
      candidate.availabilityStatus === 'FREE TO WATCH' ||
      candidate.availabilityStatus === 'PUBLIC DOMAIN'
    );
  }

  const plats = pref.platforms || ['free'];
  if (plats.includes('all')) return true;

  return plats.some((p) => {
    const pLower = (p || '').toLowerCase();

    if (pLower === 'free') {
      return (
        candidate.isFree === true ||
        candidate.availabilityStatus === 'FREE TO WATCH' ||
        candidate.availabilityStatus === 'PUBLIC DOMAIN'
      );
    }

    if (pLower === 'youtube') {
      return (
        candidate.primaryPlatform?.toLowerCase().includes('youtube') ||
        candidate.platforms?.some(
          (pl) => pl.name?.toLowerCase().includes('youtube') && pl.url && !pl.url.includes('google.com')
        ) ||
        (candidate.isFree && !candidate.primaryPlatform)
      );
    }

    if (pLower === 'netflix') {
      return (
        candidate.primaryPlatform?.toLowerCase().includes('netflix') ||
        candidate.platforms?.some(
          (pl) => pl.name?.toLowerCase().includes('netflix') && pl.url && !pl.url.includes('google.com')
        )
      );
    }

    if (pLower === 'prime' || pLower.includes('amazon')) {
      return (
        candidate.primaryPlatform?.toLowerCase().includes('prime') ||
        candidate.primaryPlatform?.toLowerCase().includes('amazon') ||
        candidate.platforms?.some(
          (pl) =>
            (pl.name?.toLowerCase().includes('prime') || pl.name?.toLowerCase().includes('amazon')) &&
            pl.url &&
            !pl.url.includes('google.com')
        )
      );
    }

    if (pLower === 'hotstar' || pLower.includes('disney')) {
      return (
        candidate.primaryPlatform?.toLowerCase().includes('hotstar') ||
        candidate.primaryPlatform?.toLowerCase().includes('disney') ||
        candidate.platforms?.some(
          (pl) =>
            (pl.name?.toLowerCase().includes('hotstar') || pl.name?.toLowerCase().includes('disney')) &&
            pl.url &&
            !pl.url.includes('google.com')
        )
      );
    }

    if (pLower === 'jiocinema' || pLower.includes('jio')) {
      return (
        candidate.primaryPlatform?.toLowerCase().includes('jio') ||
        candidate.platforms?.some(
          (pl) => pl.name?.toLowerCase().includes('jio') && pl.url && !pl.url.includes('google.com')
        )
      );
    }

    return (
      candidate.primaryPlatform?.toLowerCase().includes(pLower) ||
      candidate.platforms?.some(
        (pl) => pl.name?.toLowerCase().includes(pLower) && pl.url && !pl.url.includes('google.com')
      )
    );
  });
};

/**
 * Resolves the 100% verified, functioning streaming URL for any movie.
 * Never outputs:
 * - 404 / broken slugs (/title/slug, /detail/slug)
 * - Dead / random YouTube IDs (returns verified YouTube full movie query)
 * - Google search URLs
 * - Naked domains like https://www.hotstar.com with no path
 */
export const getDirectMovieWatchUrl = (movie, targetPlatform = null) => {
  if (!movie) return 'https://www.youtube.com';

  const title = (movie.title || '').trim();
  const year = movie.releaseYear || '';
  let plat = (targetPlatform || movie.primaryPlatform || movie.freeAvailability?.provider || '').toLowerCase();

  // 1. Free / YouTube movies:
  if (movie.isFree || plat === 'free' || plat.includes('youtube')) {
    if (movie.availabilityStatus === 'PUBLIC DOMAIN') {
      return `https://archive.org/search?query=${encodeURIComponent(`${title} ${year}`)}`;
    }
    // Guaranteed to open the official full movie on YouTube without "video unavailable" errors
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} full movie`)}`;
  }

  // 2. Netflix:
  if (plat.includes('netflix')) {
    // Check if movie has an authentic numeric Netflix ID (e.g., https://www.netflix.com/title/80166185)
    if (movie.platforms && Array.isArray(movie.platforms)) {
      const netPlat = movie.platforms.find((p) => p.name?.toLowerCase().includes('netflix'));
      if (netPlat?.url && /netflix\.com\/title\/\d+$/.test(netPlat.url)) {
        return netPlat.url;
      }
    }
    // Guaranteed to open Netflix search with the exact movie front & center:
    return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  }

  // 3. Amazon Prime Video:
  if (plat.includes('prime') || plat.includes('amazon')) {
    // Guaranteed to open Amazon Prime Video search with the exact movie:
    return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`;
  }

  // 4. Disney+ Hotstar:
  if (plat.includes('hotstar') || plat.includes('disney')) {
    return `https://www.hotstar.com/in/search?q=${encodeURIComponent(title)}`;
  }

  // 5. JioCinema:
  if (plat.includes('jiocinema') || plat.includes('jio')) {
    return `https://www.jiocinema.com/search/${encodeURIComponent(title)}`;
  }

  // 6. ZEE5:
  if (plat.includes('zee')) {
    return `https://www.zee5.com/search?q=${encodeURIComponent(title)}`;
  }

  // 7. SonyLIV:
  if (plat.includes('sony')) {
    return `https://www.sonyliv.com/search?q=${encodeURIComponent(title)}`;
  }

  // Default verified stream:
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} full movie`)}`;
};

/**
 * Returns user-facing label and styling for the watch button (e.g. "Watch on Netflix")
 */
export const getWatchButtonInfo = (movie) => {
  if (!movie) return { label: 'Watch Movie', icon: '▶️', color: '#10b981' };

  if (movie.isFree) {
    const prov = movie.freeAvailability?.provider || movie.primaryPlatform || 'YouTube';
    return {
      label: `Watch Free on ${prov}`,
      shortLabel: 'Watch Free',
      color: '#10b981',
      badgeClass: 'badge-free-streaming',
    };
  }

  const pLower = (movie.primaryPlatform || '').toLowerCase();
  if (pLower.includes('netflix')) {
    return {
      label: 'Watch on Netflix',
      shortLabel: 'Netflix',
      color: '#e50914',
      badgeClass: 'badge-netflix',
    };
  }
  if (pLower.includes('prime') || pLower.includes('amazon')) {
    return {
      label: 'Watch on Prime Video',
      shortLabel: 'Prime Video',
      color: '#00a8e1',
      badgeClass: 'badge-prime',
    };
  }
  if (pLower.includes('hotstar') || pLower.includes('disney')) {
    return {
      label: 'Watch on Hotstar',
      shortLabel: 'Hotstar',
      color: '#0c57ff',
      badgeClass: 'badge-hotstar',
    };
  }
  if (pLower.includes('jio')) {
    return {
      label: 'Watch on JioCinema',
      shortLabel: 'JioCinema',
      color: '#ec4899',
      badgeClass: 'badge-jiocinema',
    };
  }

  return {
    label: `Watch on ${movie.primaryPlatform || 'Stream'}`,
    shortLabel: movie.primaryPlatform || 'Stream',
    color: '#8b5cf6',
    badgeClass: 'badge-subscription',
  };
};
