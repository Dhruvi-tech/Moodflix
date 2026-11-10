const Review = require('../models/Review');
const Movie = require('../models/Movie');

// Helper to recalculate and sync movie average rating
const updateMovieRating = async (movieId) => {
  const stats = await Review.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const rawVal = stats[0].avgRating * 2; // scale 1-5 stars to 1-10 IMDb format
    const formatted = Math.round(rawVal * 10) / 10;
    await Movie.findByIdAndUpdate(movieId, {
      'ratings.value': formatted,
      'ratings.count': stats[0].numReviews,
    });
  }
};

// @desc    Get all reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
const getMovieReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'name avatar email')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
      : null;

    res.status(200).json({
      success: true,
      count: total,
      averageRating: avgRating,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a movie
// @route   POST /api/reviews/movie/:movieId
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const movieId = req.params.movieId;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both star rating (1-5) and written comment',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      movie: movieId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this movie. You can edit your existing review.',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      movie: movieId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await updateMovieRating(movieId);

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar email');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    if (req.body.rating) review.rating = Number(req.body.rating);
    if (req.body.comment) review.comment = req.body.comment.trim();

    await review.save();
    await updateMovieRating(review.movie);

    const updated = await Review.findById(review._id).populate('user', 'name avatar email');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const movieId = review.movie;
    await review.deleteOne();
    await updateMovieRating(movieId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
};
