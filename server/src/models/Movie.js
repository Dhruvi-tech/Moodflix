const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    overview: {
      type: String,
      required: [true, 'Movie synopsis / overview is required'],
    },
    poster: {
      type: String,
      required: [true, 'Movie poster path/URL is required'],
    },
    backdrop: {
      type: String,
      default: '',
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: 1880,
      max: 2035,
      index: true,
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    languages: {
      type: [String],
      default: ['English'],
      index: true,
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime in minutes is required'],
      min: 1,
    },
    cast: {
      type: [String],
      default: [],
      index: true,
    },
    director: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    ratings: {
      source: {
        type: String,
        default: 'IMDb',
      },
      value: {
        type: Number,
        default: 7.0,
        min: 0,
        max: 10,
      },
      count: {
        type: Number,
        default: 100,
      },
    },
    moodTags: {
      type: [String],
      required: [true, 'At least one mood tag is required'],
      index: true,
    },
    moodExplanation: {
      type: String,
      default: 'Curated recommendation perfectly matching this emotional state.',
    },
    freeAvailability: {
      type: {
        type: String,
        enum: ['Public Domain', 'Free Official Streaming', 'Ad-Supported Free'],
        required: [true, 'Free availability type is mandatory'],
      },
      provider: {
        type: String,
        required: [true, 'Free streaming provider is required'],
      },
      region: {
        type: String,
        default: 'Global',
      },
      url: {
        type: String,
        required: [true, 'Verified viewing URL is required'],
      },
      verifiedDate: {
        type: Date,
        default: Date.now,
      },
      notes: {
        type: String,
        default: 'Officially verified legal free watch link',
      },
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for robust searching
movieSchema.index({
  title: 'text',
  overview: 'text',
  director: 'text',
  cast: 'text',
  genres: 'text',
});

module.exports = mongoose.model('Movie', movieSchema);
