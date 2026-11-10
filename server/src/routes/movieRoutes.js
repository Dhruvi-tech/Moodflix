const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getMovieBySlug,
  getMoods,
  getMoviesByMood,
  searchMovies,
  getFeaturedMovies,
} = require('../controllers/movieController');

router.get('/featured', getFeaturedMovies);
router.get('/search', searchMovies);
router.get('/mood/:mood', getMoviesByMood);
router.get('/slug/:slug', getMovieBySlug);
router.get('/:id', getMovieById);
router.get('/', getMovies);

module.exports = router;
