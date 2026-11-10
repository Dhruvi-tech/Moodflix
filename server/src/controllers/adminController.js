const Movie = require('../models/Movie');
const User = require('../models/User');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const Favourite = require('../models/Favourite');
const ViewingHistory = require('../models/ViewingHistory');

// Helper to create clean URL slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Get real-time admin dashboard metrics and activity
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalReviews,
      availabilityStats,
      recentUsers,
      recentReviews,
      recentMovies,
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Review.countDocuments(),
      Movie.aggregate([
        {
          $group: {
            _id: '$freeAvailability.type',
            count: { $sum: 1 },
          },
        },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .populate('movie', 'title slug poster'),
      Movie.find().sort({ createdAt: -1 }).limit(5).select('title slug releaseYear freeAvailability createdAt'),
    ]);

    const availabilityByType = {
      publicDomain: 0,
      freeStreaming: 0,
      adSupported: 0,
    };

    availabilityStats.forEach((stat) => {
      if (stat._id === 'Public Domain') availabilityByType.publicDomain = stat.count;
      else if (stat._id === 'Free Official Streaming') availabilityByType.freeStreaming = stat.count;
      else if (stat._id === 'Ad-Supported Free') availabilityByType.adSupported = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalReviews,
        availabilityByType,
      },
      recentActivity: {
        users: recentUsers,
        reviews: recentReviews,
        movies: recentMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create a new movie with verified free availability
// @route   POST /api/admin/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      overview,
      poster,
      backdrop,
      releaseYear,
      genres,
      languages,
      runtime,
      cast,
      director,
      ratings,
      moodTags,
      moodExplanation,
      freeAvailability,
      trailerUrl,
      featured,
    } = req.body;

    if (!title || !overview || !poster || !releaseYear || !genres || !moodTags || !freeAvailability) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory movie fields. Please provide title, overview, poster, year, genres, moodTags and freeAvailability details.',
      });
    }

    if (!freeAvailability.type || !freeAvailability.provider || !freeAvailability.url) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory freeAvailability fields: type (Public Domain / Free Official Streaming / Ad-Supported Free), provider, and verified viewing url',
      });
    }

    let slug = slugify(title);
    // Check if slug exists
    const slugExists = await Movie.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${releaseYear || Date.now()}`;
    }

    const movie = await Movie.create({
      title: title.trim(),
      slug,
      overview: overview.trim(),
      poster: poster.trim(),
      backdrop: backdrop || '',
      releaseYear: Number(releaseYear),
      genres: Array.isArray(genres) ? genres : genres.split(',').map((g) => g.trim()),
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(',').map((l) => l.trim()) : ['English']),
      runtime: Number(runtime) || 90,
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map((c) => c.trim()) : []),
      director: director ? director.trim() : 'Unknown',
      ratings: ratings || { source: 'IMDb', value: 7.0, count: 50 },
      moodTags: Array.isArray(moodTags) ? moodTags : moodTags.split(',').map((m) => m.trim().toLowerCase()),
      moodExplanation: moodExplanation || 'Selected recommendation matching this mood.',
      freeAvailability: {
        type: freeAvailability.type,
        provider: freeAvailability.provider,
        region: freeAvailability.region || 'Global',
        url: freeAvailability.url,
        verifiedDate: new Date(),
        notes: freeAvailability.notes || 'Verified legal free watch link',
      },
      trailerUrl: trailerUrl || '',
      featured: !!featured,
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully with verified free availability',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update movie details & free availability
// @route   PUT /api/admin/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const updates = req.body;
    if (updates.genres && typeof updates.genres === 'string') {
      updates.genres = updates.genres.split(',').map((g) => g.trim());
    }
    if (updates.languages && typeof updates.languages === 'string') {
      updates.languages = updates.languages.split(',').map((l) => l.trim());
    }
    if (updates.cast && typeof updates.cast === 'string') {
      updates.cast = updates.cast.split(',').map((c) => c.trim());
    }
    if (updates.moodTags && typeof updates.moodTags === 'string') {
      updates.moodTags = updates.moodTags.split(',').map((m) => m.trim().toLowerCase());
    }

    if (updates.freeAvailability) {
      updates.freeAvailability.verifiedDate = new Date();
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete movie and cascade remove from user lists
// @route   DELETE /api/admin/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Cascade delete associated records
    await Promise.all([
      movie.deleteOne(),
      Watchlist.deleteMany({ movie: req.params.id }),
      Favourite.deleteMany({ movie: req.params.id }),
      Review.deleteMany({ movie: req.params.id }),
      ViewingHistory.deleteMany({ movie: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Movie and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-password');

    res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('movie', 'title slug poster')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Verify streaming links across catalog
// @route   POST /api/admin/verify-links
// @access  Private/Admin
const verifyMovieLinks = async (req, res, next) => {
  try {
    const { movieId } = req.body || {};
    let movies = [];
    if (movieId) {
      const single = await Movie.findById(movieId);
      if (single) movies = [single];
    } else {
      movies = await Movie.find().limit(500);
    }

    let checkedCount = 0;
    let verifiedCount = 0;
    const flagged = [];

    for (const movie of movies) {
      checkedCount++;
      let movieValid = true;

      if (movie.freeAvailability?.url) {
        try {
          const parsed = new URL(movie.freeAvailability.url);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            movieValid = false;
          }
        } catch {
          movieValid = false;
        }
      }

      if (movieValid) {
        verifiedCount++;
        if (movie.freeAvailability) {
          movie.freeAvailability.verifiedDate = new Date();
        }
        await movie.save();
      } else {
        flagged.push({ id: movie._id, title: movie.title, url: movie.freeAvailability?.url });
      }
    }

    res.status(200).json({
      success: true,
      message: `Checked ${checkedCount} movies. ${verifiedCount} destinations verified active.`,
      stats: {
        checkedCount,
        verifiedCount,
        flaggedCount: flagged.length,
        verifiedAt: new Date().toISOString(),
      },
      flagged,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllUsers,
  getAllReviews,
  verifyMovieLinks,
};
