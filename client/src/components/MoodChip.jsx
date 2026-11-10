import React from 'react';

const MoodChip = ({ mood, active, onClick, count }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(mood.id)}
      className={`mood-chip-btn ${active ? 'is-active' : ''}`}
      style={{ '--accent-color': mood.accent || '#8b5cf6' }}
    >
      <span className="mood-chip-emoji">{mood.emoji}</span>
      <div className="mood-chip-info">
        <span className="mood-chip-label">{mood.label}</span>
        {count !== undefined && (
          <span className="mood-chip-count">{count} movies</span>
        )}
      </div>

      <style>{`
        .mood-chip-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 1.1rem;
          background: var(--surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text);
          transition: all 0.22s ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .mood-chip-btn:hover {
          background: var(--surface-2);
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }
        .mood-chip-btn.is-active {
          background: color-mix(in srgb, var(--accent-color) 20%, #101625);
          border-color: var(--accent-color);
          box-shadow: 0 0 16px color-mix(in srgb, var(--accent-color) 35%, transparent);
          transform: translateY(-2px);
        }
        .mood-chip-emoji {
          font-size: 1.3rem;
          line-height: 1;
        }
        .mood-chip-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;
        }
        .mood-chip-label {
          font-weight: 700;
          font-size: 0.92rem;
        }
        .mood-chip-count {
          font-size: 0.68rem;
          color: var(--text-dim);
          font-weight: 500;
        }
      `}</style>
    </button>
  );
};

export default MoodChip;
