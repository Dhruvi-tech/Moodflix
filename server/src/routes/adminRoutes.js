const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllUsers,
  getAllReviews,
  verifyMovieLinks,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require login and admin role
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/reviews', getAllReviews);
router.post('/verify-links', verifyMovieLinks);

// Movie management
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

module.exports = router;
