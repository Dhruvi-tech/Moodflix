/**
 * MoodFlix Platform Filter & Watch URL Resolver
 * Strictly isolates streaming platforms: Free, YouTube, Netflix, Prime, Hotstar, JioCinema.
 * Eliminates cross-platform leakage and invalid google search links.
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
 * Resolves the direct, verified streaming URL for a movie.
 * Never redirects to google.com/search.
 */
export const getDirectMovieWatchUrl = (movie, targetPlatform = null) => {
  if (!movie) return 'https://www.youtube.com';

  const title = movie.title || '';
  const year = movie.releaseYear || '';

  // Determine platform priority
  let plat = (targetPlatform || movie.primaryPlatform || movie.freeAvailability?.provider || '').toLowerCase();

  // 1. Check if movie has verified platform entries in platforms array
  if (movie.platforms && Array.isArray(movie.platforms) && movie.platforms.length > 0) {
    // If targetPlatform specified, find that specific platform
    const matched = movie.platforms.find((p) => {
      const pName = (p.name || '').toLowerCase();
      if (!p.url || p.url.includes('google.com/search')) return false;
      if (plat) {
        if (plat.includes('netflix')) return pName.includes('netflix');
        if (plat.includes('prime') || plat.includes('amazon')) return pName.includes('prime') || pName.includes('amazon');
        if (plat.includes('youtube')) return pName.includes('youtube');
        if (plat.includes('hotstar') || plat.includes('disney')) return pName.includes('hotstar') || pName.includes('disney');
        if (plat.includes('jio')) return pName.includes('jio');
        return pName.includes(plat);
      }
      return true;
    });

    if (matched && matched.url && matched.url.startsWith('http') && !matched.url.includes('google.com')) {
      return matched.url;
    }

    // Otherwise, first verified non-google URL
    const anyVerified = movie.platforms.find(
      (p) => p.url && p.url.startsWith('http') && !p.url.includes('google.com')
    );
    if (anyVerified) {
      return anyVerified.url;
    }
  }

  // 2. Check freeAvailability URL
  if (movie.freeAvailability?.url && movie.freeAvailability.url.startsWith('http') && !movie.freeAvailability.url.includes('google.com')) {
    return movie.freeAvailability.url;
  }

  // 3. Fallback direct platform search links
  if (plat.includes('netflix')) {
    return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  }
  if (plat.includes('prime') || plat.includes('amazon')) {
    return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`;
  }
  if (plat.includes('hotstar') || plat.includes('disney')) {
    return `https://www.hotstar.com/in/search?q=${encodeURIComponent(title)}`;
  }
  if (plat.includes('jio')) {
    return `https://www.jiocinema.com/search/${encodeURIComponent(title)}`;
  }
  if (movie.availabilityStatus === 'PUBLIC DOMAIN') {
    return `https://archive.org/search?query=${encodeURIComponent(`${title} ${year}`)}`;
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} full movie`)}`;
};

/**
 * Returns user-facing label for the watch button (e.g. "Watch on Netflix")
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
