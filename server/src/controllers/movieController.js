const Movie = require('../models/Movie');

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
];

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
      sort = 'popularity',
    } = req.query;

    const query = {};

    // Free availability filter
    if (availabilityType) {
      query['freeAvailability.type'] = availabilityType;
    }

    // Genre filter
    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }

    // Mood filter
    if (mood && mood !== 'All') {
      query.moodTags = { $in: [mood.toLowerCase()] };
    }

    // Language filter
    if (language && language !== 'All') {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }

    // Minimum rating filter
    if (minRating) {
      query['ratings.value'] = { $gte: Number(minRating) };
    }

    // Release year filter
    if (releaseYear && releaseYear !== 'All') {
      query.releaseYear = Number(releaseYear);
    }

    // Search keyword
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { overview: { $regex: term, $options: 'i' } },
        { director: { $regex: term, $options: 'i' } },
        { cast: { $in: [new RegExp(term, 'i')] } },
      ];
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'popularity') {
      sortOptions = { viewsCount: -1, 'ratings.value': -1 };
    } else if (sort === 'rating') {
      sortOptions = { 'ratings.value': -1 };
    } else if (sort === 'releaseYear' || sort === 'latest') {
      sortOptions = { releaseYear: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { releaseYear: 1 };
    } else if (sort === 'title' || sort === 'alpha') {
      sortOptions = { title: 1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNum,
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
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Fetch similar movies based on genres and mood
    const similarMovies = await Movie.find({
      _id: { $ne: movie._id },
      $or: [
        { genres: { $in: movie.genres } },
        { moodTags: { $in: movie.moodTags } },
      ],
    })
      .limit(4)
      .select('title slug poster releaseYear ratings freeAvailability genres');

    res.status(200).json({
      success: true,
      movie,
      similarMovies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by slug
// @route   GET /api/movies/slug/:slug
// @access  Public
const getMovieBySlug = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug.toLowerCase() });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const similarMovies = await Movie.find({
      _id: { $ne: movie._id },
      $or: [
        { genres: { $in: movie.genres } },
        { moodTags: { $in: movie.moodTags } },
      ],
    })
      .limit(4)
      .select('title slug poster releaseYear ratings freeAvailability genres');

    res.status(200).json({
      success: true,
      movie,
      similarMovies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available moods metadata
// @route   GET /api/moods
// @access  Public
const getMoods = async (req, res, next) => {
  try {
    // Add real count of movies for each mood from database
    const moodsWithCounts = await Promise.all(
      MOODS_METADATA.map(async (m) => {
        const count = await Movie.countDocuments({ moodTags: m.id });
        return {
          ...m,
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

// @desc    Fast search suggestions & results
// @route   GET /api/movies/search
// @access  Public
const searchMovies = async (req, res, next) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, results: [] });
    }

    const term = q.trim();
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

module.exports = {
  getMovies,
  getMovieById,
  getMovieBySlug,
  getMoods,
  getMoviesByMood,
  searchMovies,
  getFeaturedMovies,
};
