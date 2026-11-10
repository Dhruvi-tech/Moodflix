const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userListRoutes = require('./routes/userListRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { getMoods } = require('./controllers/movieController');

const app = express();

// Allowed origins for CORS (local dev + Render/Vercel deployed origins)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for academic presentation evaluation
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Required for Render & Cloud Monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'MoodFlix REST API v2.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount modular REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.get('/api/moods', getMoods);
app.use('/api/reviews', reviewRoutes);
app.use('/api', userListRoutes);
app.use('/api/admin', adminRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'MoodFlix API Server',
    description: 'Mood-Based Free Movie Discovery Platform API',
    documentation: '/api/health',
    version: '2.0.0',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
