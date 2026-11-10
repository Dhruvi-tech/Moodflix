import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Film, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Col 1: Brand */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-icon">🎬</span>
              <span className="brand-text">MoodFlix</span>
            </Link>
            <p className="footer-desc">
              MoodFlix is a mood-based legal free movie discovery platform. We recommend only
              officially verified Public Domain, Ad-Supported, and Authorized Free Streaming films.
            </p>
            <div className="compliance-badge">
              <ShieldCheck size={16} className="compliance-icon" />
              <span>100% Legal & Free Viewing Links</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-col">
            <h4 className="footer-title">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">All Free Movies</Link></li>
              <li><Link to="/moods">Mood Recommender</Link></li>
              <li><Link to="/explore?availabilityType=Public+Domain">Public Domain Classics</Link></li>
              <li><Link to="/explore?availabilityType=Free+Official+Streaming">Free Streaming Hits</Link></li>
            </ul>
          </div>

          {/* Col 3: Moods */}
          <div className="footer-col">
            <h4 className="footer-title">Popular Vibes</h4>
            <ul className="footer-links">
              <li><Link to="/moods?vibe=happy">☀️ Happy & Uplifting</Link></li>
              <li><Link to="/moods?vibe=thriller">🔪 Thriller & Suspense</Link></li>
              <li><Link to="/moods?vibe=romantic">💫 Romantic & Cozy</Link></li>
              <li><Link to="/moods?vibe=chill">🌙 Chill & Relaxing</Link></li>
              <li><Link to="/moods?vibe=inspirational">🌟 Inspirational Stories</Link></li>
            </ul>
          </div>

          {/* Col 4: Project Info */}
          <div className="footer-col">
            <h4 className="footer-title">Academic Project</h4>
            <p className="footer-academic-text">
              <strong>Course:</strong> CS3301 Full Stack Development<br />
              <strong>Evaluation:</strong> CIE-3 Capstone Transformation<br />
              <strong>Stack:</strong> React, Node.js, Express, MongoDB Atlas
            </p>
            <a
              href="https://github.com/Dhruvi-tech/Moodflix"
              target="_blank"
              rel="noreferrer"
              className="github-footer-link"
            >
              <span>GitHub Repository</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MoodFlix. Built for CS3301 Full Stack Development.</p>
          <p className="footer-disclaimer">
            All streaming badges reflect verified free access providers. No paid platform affiliations.
          </p>
        </div>
      </div>

      <style>{`
        .footer-container {
          background: rgba(9, 12, 21, 0.95);
          border-top: 1px solid var(--border-subtle);
          padding: 4rem 0 2rem;
          margin-top: 4rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 2.5rem;
          margin-bottom: 3rem;
        }
        .brand-col {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 800;
        }
        .footer-desc {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.6;
          max-width: 320px;
        }
        .compliance-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          color: #34d399;
          font-weight: 600;
          width: fit-content;
        }
        .footer-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .footer-links a {
          color: var(--text-muted);
          font-size: 0.88rem;
          transition: color 0.2s ease;
        }
        .footer-links a:hover {
          color: #c4b5fd;
        }
        .footer-academic-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .github-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #c4b5fd;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .github-footer-link:hover {
          color: #e9d5ff;
        }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.75rem;
          color: var(--text-dim);
          font-size: 0.82rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
