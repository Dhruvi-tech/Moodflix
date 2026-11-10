const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const seedMovies = require('../seed/seedData');

const MOODS_METADATA = [
  { id: 'happy', label: 'Happy', emoji: '☀️', accent: '#f5c518', tagline: 'Feel-good wholesome movies that lift your spirit and make you smile' },
  { id: 'sad', label: 'Sad', emoji: '🌧️', accent: '#6b9bd1', tagline: 'Deep poignant stories with emotional resonance' },
  { id: 'thriller', label: 'Thriller', emoji: '🔪', accent: '#ef4444', tagline: 'Heart-pounding suspense, mystery, and plot twists' },
  { id: 'romantic', label: 'Romantic', emoji: '💫', accent: '#f472b6', tagline: 'Cozy, heartwarming, and sweet tales of love and connection' },
  { id: 'chill', label: 'Chill', emoji: '🌙', accent: '#34d399', tagline: 'Relaxing, easy-going films to unwind after a stressful day' },
  { id: 'adventurous', label: 'Adventurous', emoji: '⚡', accent: '#fb923c', tagline: 'Epic exploration, thrilling quests, and daring journeys' },
  { id: 'horror', label: 'Horror', emoji: '👻', accent: '#a855f7', tagline: 'Spine-chilling scares, supernatural dread, and dark thrills' },
  { id: 'comedy', label: 'Comedy', emoji: '😂', accent: '#eab308', tagline: 'Laugh-out-loud humor, witty satire, and hilarious misadventures' },
  { id: 'inspirational', label: 'Inspirational', emoji: '🌟', accent: '#38bdf8', tagline: 'Triumphant true stories, courage against all odds, and hope' },
  { id: 'mystery', label: 'Mystery', emoji: '🕵️', accent: '#818cf8', tagline: 'Clever whodunits, investigative puzzles, and enigmas' },
  { id: 'feel-good', label: 'Feel-Good', emoji: '🌈', accent: '#10b981', tagline: 'Warm, comforting cinema that leaves you with a glowing heart' },
  { id: 'emotional', label: 'Emotional', emoji: '🎭', accent: '#f43f5e', tagline: 'Powerful dramatic journeys that touch the deepest soul' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦', accent: '#14b8a6', tagline: 'Wholesome entertainment suitable and beloved for all generations' },
  { id: 'motivational', label: 'Motivational', emoji: '🚀', accent: '#f97316', tagline: 'Inspiring underdog triumphs, sports grit, and dream pursuit' },
  { id: 'suspense', label: 'Suspense', emoji: '⏳', accent: '#e11d48', tagline: 'Edge-of-your-seat tension with relentless ticking clocks' },
  { id: 'relaxing', label: 'Relaxing', emoji: '🍃', accent: '#84cc16', tagline: 'Calm, scenic, meditative cinema to soothe the mind after work' },
];

const isDBReady = () => mongoose.connection.readyState === 1;

// @desc    Get all movies with filtering, sorting, pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      genre,
      mood,
      language,
      minRating,
      releaseYear,
      availabilityType,
      availabilityStatus,
      platform,
      freeOnly,
      isFree,
      isIndian,
      sort = 'popularity',
    } = req.query;

    const shouldFilterFree = freeOnly === 'true' || freeOnly === true || isFree === 'true' || isFree === true;

    if (!isDBReady()) {
      let filtered = [...seedMovies];
      if (shouldFilterFree) {
        filtered = filtered.filter((m) => m.isFree === true);
      }
      if (availabilityType) {
        filtered = filtered.filter((m) => m.freeAvailability?.type === availabilityType);
      }
      if (availabilityStatus) {
        filtered = filtered.filter((m) => m.availabilityStatus?.toLowerCase() === availabilityStatus.toLowerCase());
      }
      if (platform && platform !== 'All') {
        const pLower = platform.toLowerCase();
        if (pLower === 'free') {
          filtered = filtered.filter((m) => m.isFree === true);
        } else {
          filtered = filtered.filter((m) => 
            m.primaryPlatform?.toLowerCase().includes(pLower) ||
            m.platforms?.some((p) => p.name?.toLowerCase().includes(pLower))
          );
        }
      }
      if (isIndian !== undefined && isIndian !== '') {
        const isInd = isIndian === 'true' || isIndian === true;
        filtered = filtered.filter((m) => m.isIndianCinema === isInd);
      }
      if (genre && genre !== 'All') {
        filtered = filtered.filter((m) => m.genres?.some((g) => g.toLowerCase() === genre.toLowerCase()));
      }
      if (mood && mood !== 'All') {
        filtered = filtered.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
      }
      if (language && language !== 'All') {
        filtered = filtered.filter((m) => m.languages?.some((l) => l.toLowerCase() === language.toLowerCase()) || m.originalLanguage?.toLowerCase() === language.toLowerCase());
      }
      if (minRating) {
        filtered = filtered.filter((m) => m.ratings?.value >= Number(minRating));
      }
      if (releaseYear) {
        filtered = filtered.filter((m) => m.releaseYear === Number(releaseYear));
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.title.toLowerCase().includes(s) ||
            m.director?.toLowerCase().includes(s) ||
            m.cast?.some((c) => c.toLowerCase().includes(s))
        );
      }

      if (sort === 'rating') filtered.sort((a, b) => (b.ratings?.value || 0) - (a.ratings?.value || 0));
      else if (sort === 'year') filtered.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
      else if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
      else filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const movies = filtered.slice(skip, skip + Number(limit));

      return res.status(200).json({
        success: true,
        count: movies.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        movies,
      });
    }

    const query = {};

    if (shouldFilterFree) {
      query.isFree = true;
    }
    if (availabilityType) {
      query['freeAvailability.type'] = availabilityType;
    }
    if (availabilityStatus) {
      query.availabilityStatus = { $regex: availabilityStatus, $options: 'i' };
    }
    if (platform && platform !== 'All') {
      const pLower = platform.toLowerCase();
      if (pLower === 'free') {
        query.isFree = true;
      } else {
        query.$or = [
          { primaryPlatform: { $regex: platform, $options: 'i' } },
          { 'platforms.name': { $regex: platform, $options: 'i' } },
        ];
      }
    }
    if (isIndian !== undefined && isIndian !== '') {
      query.isIndianCinema = isIndian === 'true' || isIndian === true;
    }
    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }
    if (mood && mood !== 'All') {
      query.moodTags = { $in: [mood.toLowerCase()] };
    }
    if (language && language !== 'All') {
      query.$or = [
        { languages: { $in: [new RegExp(language, 'i')] } },
        { originalLanguage: { $regex: language, $options: 'i' } },
      ];
    }
    if (minRating) {
      query['ratings.value'] = { $gte: Number(minRating) };
    }
    if (releaseYear) {
      query.releaseYear = Number(releaseYear);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { cast: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortObj = { viewsCount: -1 };
    if (sort === 'rating') sortObj = { 'ratings.value': -1 };
    else if (sort === 'year') sortObj = { releaseYear: -1 };
    else if (sort === 'title') sortObj = { title: 1 };
    else if (sort === 'recent') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const movie = seedMovies.find((m) => m._id === req.params.id || m.slug === req.params.id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      return res.status(200).json({ success: true, movie });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by slug
// @route   GET /api/movies/slug/:slug
// @access  Public
const getMovieBySlug = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const movie = seedMovies.find((m) => m.slug === req.params.slug);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      const similar = seedMovies
        .filter((m) => m.slug !== movie.slug && m.moodTags.some((t) => movie.moodTags.includes(t)))
        .slice(0, 4);
      return res.status(200).json({ success: true, movie, similarMovies: similar });
    }

    const movie = await Movie.findOne({ slug: req.params.slug });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Increment view count asynchronously
    Movie.updateOne({ _id: movie._id }, { $inc: { viewsCount: 1 } }).exec();

    // Fetch up to 4 similar movies sharing mood tags
    const similarMovies = await Movie.find({
      _id: { $ne: movie._id },
      moodTags: { $in: movie.moodTags },
    })
      .limit(4)
      .select('title slug poster releaseYear ratings freeAvailability moodTags duration');

    res.status(200).json({
      success: true,
      movie,
      similarMovies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all 12 moods metadata
// @route   GET /api/moods
// @access  Public
const getMoods = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const moodsWithCounts = MOODS_METADATA.map((mood) => {
        const count = seedMovies.filter((m) => m.moodTags?.includes(mood.id)).length;
        return { ...mood, movieCount: count || 4 };
      });
      return res.status(200).json({ success: true, moods: moodsWithCounts });
    }

    const moodsWithCounts = await Promise.all(
      MOODS_METADATA.map(async (mood) => {
        const count = await Movie.countDocuments({ moodTags: mood.id });
        return {
          ...mood,
          movieCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      moods: moodsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie recommendations by mood
// @route   GET /api/movies/mood/:mood
// @access  Public
const getMoviesByMood = async (req, res, next) => {
  try {
    const moodId = req.params.mood.toLowerCase();
    const moodMeta = MOODS_METADATA.find((m) => m.id === moodId);

    if (!moodMeta) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood '${req.params.mood}'. Available moods: ${MOODS_METADATA.map((m) => m.id).join(', ')}`,
      });
    }

    const { limit = 10, language, genre } = req.query;

    if (!isDBReady()) {
      let filtered = seedMovies.filter((m) => m.moodTags?.includes(moodId));
      if (language && language !== 'All') {
        filtered = filtered.filter((m) => m.languages?.some((l) => l.toLowerCase() === language.toLowerCase()));
      }
      if (genre && genre !== 'All') {
        filtered = filtered.filter((m) => m.genres?.some((g) => g.toLowerCase() === genre.toLowerCase()));
      }
      return res.status(200).json({
        success: true,
        mood: moodMeta,
        count: filtered.length,
        movies: filtered.slice(0, Number(limit)),
      });
    }

    const query = { moodTags: moodId };
    if (language && language !== 'All') {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }
    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }

    const movies = await Movie.find(query)
      .sort({ 'ratings.value': -1, viewsCount: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      mood: moodMeta,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick search by title, actor or director
// @route   GET /api/movies/search
// @access  Public
const searchMovies = async (req, res, next) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, results: [] });
    }

    const term = q.trim();

    if (!isDBReady()) {
      const s = term.toLowerCase();
      const results = seedMovies
        .filter(
          (m) =>
            m.title.toLowerCase().includes(s) ||
            m.director?.toLowerCase().includes(s) ||
            m.cast?.some((c) => c.toLowerCase().includes(s))
        )
        .slice(0, Number(limit));
      return res.status(200).json({ success: true, query: term, results });
    }

    const results = await Movie.find({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { director: { $regex: term, $options: 'i' } },
        { cast: { $in: [new RegExp(term, 'i')] } },
        { genres: { $in: [new RegExp(term, 'i')] } },
      ],
    })
      .select('title slug poster releaseYear ratings genres freeAvailability')
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      query: term,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured movies for hero section
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const featured = seedMovies.slice(0, 6);
      return res.status(200).json({
        success: true,
        count: featured.length,
        movies: featured,
      });
    }

    let featured = await Movie.find({ featured: true }).limit(6);
    if (!featured.length) {
      featured = await Movie.find().sort({ 'ratings.value': -1 }).limit(6);
    }
    res.status(200).json({
      success: true,
      count: featured.length,
      movies: featured,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get free legal movies without subscription
// @route   GET /api/movies/free
// @access  Public
const getFreeMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, language, genre, mood, sort = 'popularity' } = req.query;

    if (!isDBReady()) {
      let filtered = seedMovies.filter((m) => m.isFree === true);
      if (language && language !== 'All') {
        filtered = filtered.filter((m) => m.languages?.some((l) => l.toLowerCase() === language.toLowerCase()) || m.originalLanguage?.toLowerCase() === language.toLowerCase());
      }
      if (genre && genre !== 'All') {
        filtered = filtered.filter((m) => m.genres?.some((g) => g.toLowerCase() === genre.toLowerCase()));
      }
      if (mood && mood !== 'All') {
        filtered = filtered.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
      }

      if (sort === 'rating') filtered.sort((a, b) => (b.ratings?.value || 0) - (a.ratings?.value || 0));
      else if (sort === 'year') filtered.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
      else filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const movies = filtered.slice(skip, skip + Number(limit));

      return res.status(200).json({
        success: true,
        count: movies.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        movies,
      });
    }

    const query = { isFree: true };
    if (language && language !== 'All') {
      query.$or = [
        { languages: { $in: [new RegExp(language, 'i')] } },
        { originalLanguage: { $regex: language, $options: 'i' } },
      ];
    }
    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }
    if (mood && mood !== 'All') {
      query.moodTags = { $in: [mood.toLowerCase()] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ 'ratings.value': -1, viewsCount: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by language
// @route   GET /api/movies/language/:lang
// @access  Public
const getMoviesByLanguage = async (req, res, next) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 12, freeOnly, mood } = req.query;
    const isFreeRequired = freeOnly === 'true' || freeOnly === true;

    if (!isDBReady()) {
      let filtered = seedMovies.filter(
        (m) =>
          m.languages?.some((l) => l.toLowerCase() === lang.toLowerCase()) ||
          m.originalLanguage?.toLowerCase() === lang.toLowerCase()
      );
      if (isFreeRequired) {
        filtered = filtered.filter((m) => m.isFree === true);
      }
      if (mood && mood !== 'All') {
        filtered = filtered.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
      }

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const movies = filtered.slice(skip, skip + Number(limit));

      return res.status(200).json({
        success: true,
        language: lang,
        count: movies.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        movies,
      });
    }

    const query = {
      $or: [
        { languages: { $in: [new RegExp(lang, 'i')] } },
        { originalLanguage: { $regex: lang, $options: 'i' } },
      ],
    };
    if (isFreeRequired) query.isFree = true;
    if (mood && mood !== 'All') query.moodTags = { $in: [mood.toLowerCase()] };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ 'ratings.value': -1, viewsCount: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      language: lang,
      count: movies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by platform
// @route   GET /api/movies/platform/:platform
// @access  Public
const getMoviesByPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { page = 1, limit = 12, language, mood } = req.query;
    const pLower = platform.toLowerCase();

    if (!isDBReady()) {
      let filtered = [...seedMovies];
      if (pLower === 'free') {
        filtered = filtered.filter((m) => m.isFree === true);
      } else {
        filtered = filtered.filter(
          (m) =>
            m.primaryPlatform?.toLowerCase().includes(pLower) ||
            m.platforms?.some((p) => p.name?.toLowerCase().includes(pLower))
        );
      }
      if (language && language !== 'All') {
        filtered = filtered.filter((m) => m.languages?.some((l) => l.toLowerCase() === language.toLowerCase()));
      }
      if (mood && mood !== 'All') {
        filtered = filtered.filter((m) => m.moodTags?.includes(mood.toLowerCase()));
      }

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const movies = filtered.slice(skip, skip + Number(limit));

      return res.status(200).json({
        success: true,
        platform,
        count: movies.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        movies,
      });
    }

    let query = {};
    if (pLower === 'free') {
      query.isFree = true;
    } else {
      query.$or = [
        { primaryPlatform: { $regex: platform, $options: 'i' } },
        { 'platforms.name': { $regex: platform, $options: 'i' } },
      ];
    }
    if (language && language !== 'All') {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }
    if (mood && mood !== 'All') {
      query.moodTags = { $in: [mood.toLowerCase()] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ 'ratings.value': -1, viewsCount: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      platform,
      count: movies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart deterministic movie recommendations based on user preferences
// @route   GET /api/movies/recommendations
// @access  Public
const getSmartRecommendations = async (req, res, next) => {
  try {
    const {
      mood,
      platform,
      platforms,
      language,
      languages,
      freeOnly,
      limit = 12,
    } = req.query;

    const isFree = freeOnly === 'true' || freeOnly === true;
    const langList = (languages ? languages.split(',') : (language ? [language] : [])).map((l) => l.trim().toLowerCase());
    const platList = (platforms ? platforms.split(',') : (platform ? [platform] : [])).map((p) => p.trim().toLowerCase());
    const moodTarget = mood && mood !== 'All' ? mood.toLowerCase() : null;

    let explanationParts = [];
    if (moodTarget) explanationParts.push(`Mood: ${moodTarget}`);
    if (isFree) explanationParts.push('Free to watch without subscriptions');
    if (langList.length) explanationParts.push(`Languages: ${langList.join(', ')}`);
    if (platList.length && !isFree) explanationParts.push(`Platforms: ${platList.join(', ')}`);

    const explanation = explanationParts.length
      ? `Curated because you prefer ${explanationParts.join(' • ')}.`
      : 'Top rated selections across verified free and streaming platforms.';

    if (!isDBReady()) {
      let scored = seedMovies.map((m) => {
        let score = (m.ratings?.value || 7) * 2;
        if (isFree && m.isFree) score += 20;
        else if (isFree && !m.isFree) score -= 100;

        if (moodTarget && m.moodTags?.includes(moodTarget)) score += 15;
        if (langList.length && (m.languages?.some((l) => langList.includes(l.toLowerCase())) || langList.includes(m.originalLanguage?.toLowerCase()))) {
          score += 15;
        }
        if (platList.length && (platList.includes(m.primaryPlatform?.toLowerCase()) || m.platforms?.some((p) => platList.includes(p.name?.toLowerCase())))) {
          score += 10;
        }
        return { movie: m, score };
      });

      if (isFree) {
        scored = scored.filter((item) => item.movie.isFree);
      }

      scored.sort((a, b) => b.score - a.score);
      const results = scored.slice(0, Number(limit)).map((s) => s.movie);

      return res.status(200).json({
        success: true,
        count: results.length,
        explanation,
        movies: results,
      });
    }

    const query = {};
    if (isFree) query.isFree = true;
    if (moodTarget) query.moodTags = { $in: [moodTarget] };
    if (langList.length) query.languages = { $in: langList.map((l) => new RegExp(l, 'i')) };

    let movies = await Movie.find(query)
      .sort({ 'ratings.value': -1, viewsCount: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      explanation,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getMovieBySlug,
  getMoods,
  getMoviesByMood,
  searchMovies,
  getFeaturedMovies,
  getFreeMovies,
  getMoviesByLanguage,
  getMoviesByPlatform,
  getSmartRecommendations,
};
