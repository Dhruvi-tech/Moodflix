import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page page-wrapper container text-center">
      <div className="not-found-card glass-panel">
        <span className="error-code-badge">404 ERROR</span>
        <h1 className="not-found-title">Lost in the Reel</h1>
        <p className="not-found-desc">
          The scene or film reel you are looking for does not exist or has been archived.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            <span>Return Home</span>
          </Link>
          <Link to="/explore" className="btn btn-secondary">
            <Compass size={18} />
            <span>Explore Free Catalog</span>
          </Link>
        </div>
      </div>

      <style>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 75vh;
        }
        .not-found-card {
          padding: 4rem 2rem;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .error-code-badge {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--secondary);
          padding: 0.35rem 0.85rem;
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: var(--radius-full);
        }
        .not-found-title {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: #fff;
        }
        .not-found-desc {
          color: var(--text-muted);
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .not-found-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
