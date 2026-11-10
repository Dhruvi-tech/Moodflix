const express = require('express');
const router = express.Router();
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/movie/:movieId', getMovieReviews);
router.post('/movie/:movieId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
