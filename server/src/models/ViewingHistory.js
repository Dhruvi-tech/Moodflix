const mongoose = require('mongoose');

const viewingHistorySchema = new mongoose.Schema(
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
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique per user & movie so we upsert and keep viewing history clean
viewingHistorySchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('ViewingHistory', viewingHistorySchema);
