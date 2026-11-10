require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Watchlist = require('../models/Watchlist');
const Favourite = require('../models/Favourite');
const Review = require('../models/Review');
const ViewingHistory = require('../models/ViewingHistory');
const seedMovies = require('./seedData');

const seedInitialData = async () => {
  console.log('[Seed] Checking and seeding users...');
  const adminUser = await User.findOneAndUpdate(
    { email: 'admin@moodflix.com' },
    {
      name: 'MoodFlix Admin',
      email: 'admin@moodflix.com',
      password: 'Admin@123456',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      preferences: {
        favoriteMoods: ['thriller', 'adventurous'],
        preferredLanguages: ['English'],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const demoUser = await User.findOneAndUpdate(
    { email: 'dhruvi@moodflix.com' },
    {
      name: 'Dhruvi Mittal',
      email: 'dhruvi@moodflix.com',
      password: 'User@123456',
      role: 'user',
      avatar: 'https://github.com/Dhruvi-tech.png',
      preferences: {
        favoriteMoods: ['happy', 'feel-good', 'romantic'],
        preferredLanguages: ['English'],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('[Seed] Seeding movies with verified free availability...');
  const createdMovies = await Movie.insertMany(seedMovies);
  console.log(`[Seed] Inserted ${createdMovies.length} movies.`);

  // Seed sample interactions for demoUser
  const movie1 = createdMovies[0]; // The General
  const movie2 = createdMovies[1]; // The Kid
  const movie3 = createdMovies[3]; // It's a Wonderful Life
  const movie4 = createdMovies[7]; // Charade

  console.log('[Seed] Seeding sample watchlist, favourites, reviews & history...');
  await Watchlist.create([
    { user: demoUser._id, movie: movie1._id },
    { user: demoUser._id, movie: movie3._id },
  ]);

  await Favourite.create([
    { user: demoUser._id, movie: movie2._id },
    { user: demoUser._id, movie: movie4._id },
  ]);

  await Review.create([
    {
      user: demoUser._id,
      movie: movie1._id,
      rating: 5,
      comment: 'Buster Keaton does his own train stunts with zero CGI! Absolute comedic brilliance that holds up a century later.',
    },
    {
      user: demoUser._id,
      movie: movie3._id,
      rating: 5,
      comment: 'An uplifting reminder that every person matters in their community. Frank Capra at his finest.',
    },
    {
      user: adminUser._id,
      movie: movie4._id,
      rating: 4,
      comment: 'Audrey Hepburn and Cary Grant have unmatched comedic and romantic chemistry in Paris. Masterful whodunit.',
    },
  ]);

  await ViewingHistory.create([
    { user: demoUser._id, movie: movie1._id, viewedAt: new Date(Date.now() - 3600000) },
    { user: demoUser._id, movie: movie2._id, viewedAt: new Date(Date.now() - 7200000) },
    { user: demoUser._id, movie: movie4._id, viewedAt: new Date(Date.now() - 14400000) },
  ]);

  return { adminUser, demoUser, totalMovies: createdMovies.length };
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moodflix';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Cleaning old records...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Watchlist.deleteMany({}),
      Favourite.deleteMany({}),
      Review.deleteMany({}),
      ViewingHistory.deleteMany({}),
    ]);

    const result = await seedInitialData();

    console.log('====================================================');
    console.log('🎉 MOODFLIX DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`👤 Admin Account : admin@moodflix.com (Password: Admin@123456)`);
    console.log(`👤 Demo User     : dhruvi@moodflix.com (Password: User@123456)`);
    console.log(`🎬 Total Movies  : ${result.totalMovies}`);
    console.log(`⭐ Total Moods   : 12 covered`);
    console.log(`🆓 Availability  : 100% Free (Public Domain / Free Streaming)`);
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedInitialData, seedDB };
