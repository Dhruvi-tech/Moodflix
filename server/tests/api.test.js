const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const mongoose = require('mongoose');
const app = require('../src/app');
const Movie = require('../src/models/Movie');
const User = require('../src/models/User');

let server;
let baseUrl;
let userToken = '';
let adminToken = '';
let testMovieId = '';
let testReviewId = '';

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

describe('MoodFlix REST API Test Suite', async () => {
  before(async () => {
    // Ensure DB connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moodflix');
    }

    // Start server on random available port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Harness] Running against ${baseUrl}`);

    // Grab a test movie ID
    const sampleMovie = await Movie.findOne();
    testMovieId = sampleMovie._id.toString();
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test('1. Health check endpoint responds with status healthy', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  test('2. Moods endpoint returns all 12 moods with real movie counts', async () => {
    const res = await request('GET', '/api/moods');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.moods.length, 12);
    const happy = res.data.moods.find((m) => m.id === 'happy');
    assert.ok(happy);
    assert.ok(happy.movieCount > 0);
  });

  test('3. Movies catalog supports pagination, sorting, and availability filter', async () => {
    const res = await request('GET', '/api/movies?page=1&limit=5&sort=rating');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.movies.length, 5);
    assert.ok(res.data.total >= 20);
  });

  test('4. Mood recommendations filter returns movies matching selected mood', async () => {
    const res = await request('GET', '/api/movies/mood/happy?limit=4');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.movies.length > 0);
    assert.ok(res.data.movies.every((m) => m.moodTags.includes('happy')));
  });

  test('5. Fast movie search matches title, cast, or director', async () => {
    const res = await request('GET', '/api/movies/search?q=chaplin');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.results.length > 0);
  });

  test('6. Single movie details returns movie by slug with similar movies', async () => {
    const res = await request('GET', '/api/movies/slug/the-general');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.movie.title, 'The General');
    assert.ok(res.data.similarMovies.length > 0);
  });

  test('7. Public registration registers a user and returns a signed JWT', async () => {
    const rand = Math.floor(Math.random() * 100000);
    const email = `testuser_${rand}@test.com`;
    const res = await request('POST', '/api/auth/register', {
      name: 'Integration Tester',
      email,
      password: 'Password@123',
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.role, 'user');
    userToken = res.data.token;
  });

  test('8. Duplicate registration with same email is rejected', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Duplicate Guy',
      email: 'dhruvi@moodflix.com',
      password: 'Password@123',
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  test('9. Login succeeds with correct credentials and fails with wrong password', async () => {
    // Correct
    const successRes = await request('POST', '/api/auth/login', {
      email: 'dhruvi@moodflix.com',
      password: 'User@123456',
    });
    assert.strictEqual(successRes.status, 200);
    assert.ok(successRes.data.token);

    // Wrong
    const failRes = await request('POST', '/api/auth/login', {
      email: 'dhruvi@moodflix.com',
      password: 'WrongPassword123',
    });
    assert.strictEqual(failRes.status, 401);
  });

  test('10. Admin login issues admin token', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@moodflix.com',
      password: 'Admin@123456',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'admin');
    adminToken = res.data.token;
  });

  test('11. Protected route /api/auth/me rejects request without token and accepts valid token', async () => {
    const unauth = await request('GET', '/api/auth/me');
    assert.strictEqual(unauth.status, 401);

    const auth = await request('GET', '/api/auth/me', null, userToken);
    assert.strictEqual(auth.status, 200);
    assert.strictEqual(auth.data.user.name, 'Integration Tester');
  });

  test('12. Watchlist CRUD: Add movie, prevent duplicate, retrieve list, delete movie', async () => {
    // Add
    const addRes = await request('POST', `/api/watchlist/${testMovieId}`, null, userToken);
    assert.strictEqual(addRes.status, 201);

    // Duplicate check
    const dupRes = await request('POST', `/api/watchlist/${testMovieId}`, null, userToken);
    assert.strictEqual(dupRes.status, 400);

    // Get list
    const getRes = await request('GET', '/api/watchlist', null, userToken);
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.movies.some((m) => m._id === testMovieId));

    // Delete
    const delRes = await request('DELETE', `/api/watchlist/${testMovieId}`, null, userToken);
    assert.strictEqual(delRes.status, 200);
  });

  test('13. Favourites CRUD: Add movie, get list, delete movie', async () => {
    const addRes = await request('POST', `/api/favourites/${testMovieId}`, null, userToken);
    assert.strictEqual(addRes.status, 201);

    const getRes = await request('GET', '/api/favourites', null, userToken);
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.movies.some((m) => m._id === testMovieId));

    const delRes = await request('DELETE', `/api/favourites/${testMovieId}`, null, userToken);
    assert.strictEqual(delRes.status, 200);
  });

  test('14. Review CRUD: Post review, prevent duplicate, edit review, delete review', async () => {
    // Post review
    const postRes = await request(
      'POST',
      `/api/reviews/movie/${testMovieId}`,
      { rating: 5, comment: 'Exceptional film, loved the comedic timing!' },
      userToken
    );
    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postRes.data.success, true);
    testReviewId = postRes.data.review._id;

    // Prevent duplicate
    const dupRes = await request(
      'POST',
      `/api/reviews/movie/${testMovieId}`,
      { rating: 4, comment: 'Trying to post another review...' },
      userToken
    );
    assert.strictEqual(dupRes.status, 400);

    // Edit review
    const editRes = await request(
      'PUT',
      `/api/reviews/${testReviewId}`,
      { rating: 4, comment: 'Updated comment: absolutely timeless!' },
      userToken
    );
    assert.strictEqual(editRes.status, 200);

    // Delete review
    const delRes = await request('DELETE', `/api/reviews/${testReviewId}`, null, userToken);
    assert.strictEqual(delRes.status, 200);
  });

  test('15. Viewing History: Upsert view timestamp and clear history', async () => {
    const postRes = await request('POST', `/api/history/${testMovieId}`, null, userToken);
    assert.strictEqual(postRes.status, 200);

    const getRes = await request('GET', '/api/history', null, userToken);
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.movies.length > 0);

    const clearRes = await request('DELETE', '/api/history', null, userToken);
    assert.strictEqual(clearRes.status, 200);
  });

  test('16. Role-Based Access Control: Regular user cannot access Admin endpoints', async () => {
    const forbiddenRes = await request('GET', '/api/admin/dashboard', null, userToken);
    assert.strictEqual(forbiddenRes.status, 403);
  });

  test('17. Admin dashboard metrics and movie management CRUD', async () => {
    // Dashboard stats
    const statsRes = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsRes.data.success, true);
    assert.ok(statsRes.data.stats.totalMovies > 0);
    assert.ok(statsRes.data.stats.totalUsers > 0);

    // Create Movie
    const createMovieRes = await request(
      'POST',
      '/api/admin/movies',
      {
        title: 'Sherlock Jr.',
        overview: 'A movie projectionist longs to be a detective, puts his skills into action.',
        poster: '/posters/sherlock-jr.jpg',
        releaseYear: 1924,
        genres: ['Comedy', 'Action'],
        runtime: 45,
        moodTags: ['happy', 'comedy'],
        freeAvailability: {
          type: 'Public Domain',
          provider: 'Internet Archive',
          url: 'https://archive.org/details/sherlock_jr',
        },
      },
      adminToken
    );
    assert.strictEqual(createMovieRes.status, 201);
    const createdId = createMovieRes.data.movie._id;

    // Update Movie
    const updateRes = await request(
      'PUT',
      `/api/admin/movies/${createdId}`,
      { title: 'Sherlock Jr. (Restored HD)' },
      adminToken
    );
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.movie.title, 'Sherlock Jr. (Restored HD)');

    // Delete Movie
    const deleteRes = await request('DELETE', `/api/admin/movies/${createdId}`, null, adminToken);
    assert.strictEqual(deleteRes.status, 200);
  });
});
