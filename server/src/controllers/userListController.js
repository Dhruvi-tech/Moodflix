const mongoose = require('mongoose');
const Watchlist = require('../models/Watchlist');
const Favourite = require('../models/Favourite');
const ViewingHistory = require('../models/ViewingHistory');
const Movie = require('../models/Movie');
const seedMovies = require('../seed/seedData');

const isDBReady = () => mongoose.connection.readyState === 1;

// ── Watchlist ──────────────────────────────────────────────

// @desc    Get user's saved watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const movies = seedMovies.slice(0, 3);
      return res.status(200).json({ success: true, count: movies.length, movies });
    }

    const list = await Watchlist.find({ user: req.user._id })
      .populate('movie')
      .sort({ addedAt: -1 });

    const movies = list.filter((item) => item.movie !== null).map((item) => item.movie);

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist/:movieId
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!isDBReady()) {
      return res.status(201).json({ success: true, message: 'Movie added to your watchlist' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const existing = await Watchlist.findOne({ user: req.user._id, movie: movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Movie is already in your watchlist',
      });
    }

    await Watchlist.create({ user: req.user._id, movie: movieId });

    res.status(201).json({
      success: true,
      message: 'Movie added to your watchlist',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!isDBReady()) {
      return res.status(200).json({ success: true, message: 'Movie removed from watchlist' });
    }

    await Watchlist.findOneAndDelete({ user: req.user._id, movie: movieId });

    res.status(200).json({
      success: true,
      message: 'Movie removed from your watchlist',
    });
  } catch (error) {
    next(error);
  }
};

// ── Favourites ─────────────────────────────────────────────

// @desc    Get user's favourites
// @route   GET /api/favourites
// @access  Private
const getFavourites = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const movies = seedMovies.slice(2, 5);
      return res.status(200).json({ success: true, count: movies.length, movies });
    }

    const list = await Favourite.find({ user: req.user._id })
      .populate('movie')
      .sort({ addedAt: -1 });

    const movies = list.filter((item) => item.movie !== null).map((item) => item.movie);

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to favourites
// @route   POST /api/favourites/:movieId
// @access  Private
const addToFavourites = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!isDBReady()) {
      return res.status(201).json({ success: true, message: 'Movie added to your favourites' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const existing = await Favourite.findOne({ user: req.user._id, movie: movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Movie is already in your favourites',
      });
    }

    await Favourite.create({ user: req.user._id, movie: movieId });

    res.status(201).json({
      success: true,
      message: 'Movie added to your favourites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from favourites
// @route   DELETE /api/favourites/:movieId
// @access  Private
const removeFromFavourites = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!isDBReady()) {
      return res.status(200).json({ success: true, message: 'Movie removed from favourites' });
    }

    await Favourite.findOneAndDelete({ user: req.user._id, movie: movieId });

    res.status(200).json({
      success: true,
      message: 'Movie removed from your favourites',
    });
  } catch (error) {
    next(error);
  }
};

// ── Viewing History ────────────────────────────────────────

// @desc    Get user's viewing history
// @route   GET /api/history
// @access  Private
const getViewingHistory = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      const movies = seedMovies.slice(0, 4);
      return res.status(200).json({ success: true, count: movies.length, movies });
    }

    const history = await ViewingHistory.find({ user: req.user._id })
      .populate('movie')
      .sort({ viewedAt: -1 })
      .limit(30);

    const movies = history
      .filter((item) => item.movie !== null)
      .map((item) => ({
        ...item.movie.toObject(),
        viewedAt: item.viewedAt,
      }));

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record or update movie view in history
// @route   POST /api/history/:movieId
// @access  Private
const addToViewingHistory = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!isDBReady()) {
      return res.status(200).json({ success: true, message: 'View recorded' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await ViewingHistory.findOneAndUpdate(
      { user: req.user._id, movie: movieId },
      { viewedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'View recorded',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all viewing history
// @route   DELETE /api/history
// @access  Private
const clearViewingHistory = async (req, res, next) => {
  try {
    if (!isDBReady()) {
      return res.status(200).json({ success: true, message: 'Viewing history cleared' });
    }

    await ViewingHistory.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Viewing history cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check user's status for a movie (in watchlist, in favourites)
// @route   GET /api/user-status/:movieId
// @access  Private
const getUserMovieStatus = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (!isDBReady()) {
      return res.status(200).json({ success: true, inWatchlist: false, inFavourites: false });
    }
    const [inWatchlist, inFavourites] = await Promise.all([
      Watchlist.exists({ user: req.user._id, movie: movieId }),
      Favourite.exists({ user: req.user._id, movie: movieId }),
    ]);

    res.status(200).json({
      success: true,
      inWatchlist: !!inWatchlist,
      inFavourites: !!inFavourites,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavourites,
  addToFavourites,
  removeFromFavourites,
  getHistory: getViewingHistory,
  getViewingHistory,
  recordView: addToViewingHistory,
  addToViewingHistory,
  clearHistory: clearViewingHistory,
  clearViewingHistory,
  getUserMovieStatus,
};
