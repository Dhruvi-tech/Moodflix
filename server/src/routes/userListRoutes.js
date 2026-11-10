const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavourites,
  addToFavourites,
  removeFromFavourites,
  getViewingHistory,
  addToViewingHistory,
  clearViewingHistory,
  getUserMovieStatus,
} = require('../controllers/userListController');
const { protect } = require('../middleware/authMiddleware');

// All list routes require authentication
router.use(protect);

// Watchlist endpoints
router.get('/watchlist', getWatchlist);
router.post('/watchlist/:movieId', addToWatchlist);
router.delete('/watchlist/:movieId', removeFromWatchlist);

// Favourites endpoints
router.get('/favourites', getFavourites);
router.post('/favourites/:movieId', addToFavourites);
router.delete('/favourites/:movieId', removeFromFavourites);

// History endpoints
router.get('/history', getViewingHistory);
router.post('/history/:movieId', addToViewingHistory);
router.delete('/history', clearViewingHistory);

// Status check endpoint
router.get('/user-status/:movieId', getUserMovieStatus);

module.exports = router;
