const app = require('../src/app');
const connectDB = require('../src/config/db');
const Movie = require('../src/models/Movie');
const { seedInitialData } = require('../src/seed/seed');

let isInitialized = false;

module.exports = async (req, res) => {
  try {
    await connectDB();
    if (!isInitialized) {
      const count = await Movie.countDocuments();
      if (count === 0) {
        console.log('[Vercel Serverless] Initializing seed data in cloud database...');
        await seedInitialData();
      }
      isInitialized = true;
    }
  } catch (err) {
    console.error('[Vercel Serverless] DB connection error:', err);
  }
  return app(req, res);
};
