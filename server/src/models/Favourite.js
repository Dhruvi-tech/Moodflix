const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same user and movie
favouriteSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
