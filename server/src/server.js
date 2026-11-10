require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const Movie = require('./models/Movie');
const { seedInitialData } = require('./seed/seed');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, auto-seed if empty, and listen
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed database on first cloud boot if movies collection is empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[AutoSeed] Empty database detected. Seeding verified free cinema catalog...');
      await seedInitialData();
      console.log('[AutoSeed] Automatic cloud database initialization complete!');
    } else {
      console.log(`[Database] Connected. Verified movie count: ${movieCount}`);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎬 MoodFlix Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
