import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import MoodChip from '../components/MoodChip';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, Film, Compass, ArrowRight, Play, Star } from 'lucide-react';
import fallbackMovies from '../data/fallbackMovies';
import { FALLBACK_MOODS } from '../data/fallbackMoods';

const Home = () => {
  const { user } = useAuth();
  const [moods, setMoods] = useState(FALLBACK_MOODS);
  const [selectedMood, setSelectedMood] = useState('happy');
  const [moodMovies, setMoodMovies] = useState(() =>
    fallbackMovies.filter((m) => m.moodTags?.includes('happy')).slice(0, 6)
  );
  const [moodMeta, setMoodMeta] = useState(FALLBACK_MOODS[0]);
  const [featuredMovies, setFeaturedMovies] = useState(() => fallbackMovies.slice(0, 6));
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingMoodMovies, setLoadingMoodMovies] = useState(false);

  // Load initial moods and featured
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [moodsRes, featRes] = await Promise.all([
          api.get('/moods'),
          api.get('/movies/featured'),
        ]);

        if (moodsRes.data.success && moodsRes.data.moods?.length) {
          setMoods(moodsRes.data.moods);
        }
        if (featRes.data.success && featRes.data.movies?.length) {
          setFeaturedMovies(featRes.data.movies);
        }
      } catch (err) {
        console.warn('API sync fallback active:', err.message);
      }
    };

    fetchInitial();
  }, []);

  // Fetch movies for selected mood
  useEffect(() => {
    const fetchMoodMovies = async () => {
      setLoadingMoodMovies(true);
      try {
        const res = await api.get(`/movies/mood/${selectedMood}?limit=6`);
        if (res.data.success && res.data.movies?.length) {
          setMoodMovies(res.data.movies);
          setMoodMeta(res.data.mood || FALLBACK_MOODS.find((m) => m.id === selectedMood));
        } else {
          const fallback = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood));
          setMoodMovies(fallback.slice(0, 6));
        }
      } catch (err) {
        const fallback = fallbackMovies.filter((m) => m.moodTags?.includes(selectedMood));
        setMoodMovies(fallback.slice(0, 6));
        setMoodMeta(FALLBACK_MOODS.find((m) => m.id === selectedMood));
      } finally {
        setLoadingMoodMovies(false);
      }
    };

    if (selectedMood) {
      fetchMoodMovies();
    }
  }, [selectedMood]);

  // Fetch viewing history for logged-in user
  useEffect(() => {
    if (user) {
      api.get('/history')
        .then((res) => {
          if (res.data.success) setRecentHistory(res.data.movies.slice(0, 4));
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="home-page page-wrapper">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="hero-section container">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Sparkles size={16} />
            <span>100% Legal & Free Movie Discovery</span>
          </div>

          <h1 className="hero-headline">
            Cinema that matches <br />
            <span className="text-gradient">how you feel tonight.</span>
          </h1>

          <p className="hero-subtext">
            No subscription traps, no paywalls. MoodFlix curates legally free-to-watch cinema
            across Public Domain treasures and authorized free streaming platforms tailored to your emotional state.
          </p>

          <div className="hero-actions">
            <a href="#mood-selector" className="btn btn-primary">
              <span>Find My Vibe</span>
              <ArrowRight size={18} />
            </a>
            <Link to="/explore" className="btn btn-secondary">
              <Compass size={18} />
              <span>Explore All Free Movies</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="hero-badges">
            <div className="hero-badge-item">
              <ShieldCheck size={18} className="badge-icon-green" />
              <span>Zero Subscription Badges</span>
            </div>
            <div className="hero-badge-item">
              <Film size={18} className="badge-icon-purple" />
              <span>12 Emotional Palettes</span>
            </div>
            <div className="hero-badge-item">
              <Star size={18} className="badge-icon-amber" />
              <span>Public Domain & Ad-Free Classics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mood Selector Section ──────────────────────── */}
      <section className="mood-showcase-section container" id="mood-selector">
        <div className="section-head">
          <span className="step-tag">STEP 1</span>
          <h2>Select Your Mood Tonight</h2>
          <p>Click any vibe below to generate an instant shortlist of curated free movies.</p>
        </div>

        {/* Mood Chips Grid */}
        <div className="mood-chips-scroll">
          {moods.map((m) => (
            <MoodChip
              key={m.id}
              mood={m}
              count={m.movieCount}
              active={selectedMood === m.id}
              onClick={(id) => setSelectedMood(id)}
            />
          ))}
        </div>

        {/* Dynamic Recommendations Box */}
        <div className="mood-results-box glass-panel">
          <div className="mood-results-header">
            <div>
              <h3 className="mood-active-title">
                {moodMeta ? `${moodMeta.emoji} ${moodMeta.label} Recommendations` : 'Loading...'}
              </h3>
              <p className="mood-active-tagline">{moodMeta?.tagline}</p>
            </div>
            <Link to={`/moods?vibe=${selectedMood}`} className="btn btn-sm btn-outline">
              <span>View Full {moodMeta?.label} Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingMoodMovies ? (
            <LoadingSpinner text={`Finding ${moodMeta?.label || ''} films...`} />
          ) : (
            <div className="movie-grid animate-fade-in">
              {moodMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Free Classics ─────────────────────── */}
      <section className="featured-section container">
        <div className="section-head">
          <h2>Trending Free Cinema</h2>
          <p>Hand-picked community favorites available to watch completely free right now.</p>
        </div>

        <div className="movie-grid">
          {featuredMovies.slice(0, 6).map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── Recently Viewed (If Logged In) ─────────────── */}
      {user && recentHistory.length > 0 && (
        <section className="history-preview-section container">
          <div className="section-head">
            <h2>Jump Back In</h2>
            <p>Movies you recently explored on MoodFlix.</p>
          </div>

          <div className="movie-grid">
            {recentHistory.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* ── Free Streaming Ethics Banner ────────────────── */}
      <section className="ethics-section container">
        <div className="ethics-card glass-panel">
          <div className="ethics-badge">THE MOODFLIX PLEDGE</div>
          <h3>100% Free. 100% Legal. No Hidden Paywalls.</h3>
          <p>
            Unlike commercial platforms that lure users with recommendations only to demand a $15/month subscription,
            MoodFlix operates on a strictly legal free-to-watch index. We catalog public domain treasures,
            educational releases, and authorized ad-supported digital broadcasts.
          </p>
          <div className="ethics-grid">
            <div className="ethics-item">
              <span className="ethics-number">01</span>
              <h4>Public Domain Treasures</h4>
              <p>Preserved film heritage legally accessible to every citizen on Earth via cultural archives.</p>
            </div>
            <div className="ethics-item">
              <span className="ethics-number">02</span>
              <h4>Authorized Free Streams</h4>
              <p>Official studio channels on YouTube and verified digital distributors offering free access.</p>
            </div>
            <div className="ethics-item">
              <span className="ethics-number">03</span>
              <h4>Zero Piracy</h4>
              <p>We never link to illegal hosts, torrents, or unverified streams. Every single link is verified.</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          padding: 3rem 0 4rem;
        }
        .hero-content {
          max-width: 820px;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.85rem;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          color: #c4b5fd;
          margin-bottom: 1.5rem;
        }
        .hero-headline {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 5.5vw, 4.2rem);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }
        .text-gradient {
          background: linear-gradient(135deg, #c4b5fd 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtext {
          font-size: 1.15rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 720px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .hero-badges {
          display: flex;
          align-items: center;
          gap: 1.75rem;
          flex-wrap: wrap;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        .hero-badge-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .badge-icon-green { color: #34d399; }
        .badge-icon-purple { color: #a78bfa; }
        .badge-icon-amber { color: #fbbf24; }
        .mood-showcase-section {
          margin: 3rem auto;
        }
        .step-tag {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--primary);
          text-transform: uppercase;
        }
        .mood-chips-scroll {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .mood-results-box {
          padding: 2rem;
        }
        .mood-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .mood-active-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: #fff;
        }
        .mood-active-tagline {
          color: var(--text-muted);
          font-size: 0.92rem;
          margin-top: 0.2rem;
        }
        .featured-section, .history-preview-section {
          margin: 4.5rem auto;
        }
        .ethics-section {
          margin: 5rem auto 2rem;
        }
        .ethics-card {
          padding: 3.5rem 2.5rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(16, 22, 37, 0.9), rgba(30, 27, 75, 0.6));
        }
        .ethics-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          color: #38bdf8;
          margin-bottom: 1rem;
        }
        .ethics-card h3 {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: #fff;
          margin-bottom: 1rem;
        }
        .ethics-card > p {
          max-width: 700px;
          margin: 0 auto 3rem;
          color: var(--text-muted);
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .ethics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          text-align: left;
        }
        .ethics-item {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .ethics-number {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          display: block;
          margin-bottom: 0.5rem;
        }
        .ethics-item h4 {
          font-size: 1.1rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }
        .ethics-item p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        @media (max-width: 768px) {
          .ethics-grid {
            grid-template-columns: 1fr;
          }
          .mood-results-box {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
