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
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.65rem 1.25rem;
          background: rgba(15, 22, 41, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          color: #f1f5f9;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          white-space: nowrap;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          user-select: none;
        }
        .mood-chip-btn:hover {
          background: rgba(22, 32, 58, 0.9);
          border-color: var(--accent-color);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.6), 0 0 15px color-mix(in srgb, var(--accent-color) 40%, transparent);
        }
        .mood-chip-btn.is-active {
          background: color-mix(in srgb, var(--accent-color) 25%, #0f1629);
          border-color: var(--accent-color);
          box-shadow: 0 0 25px color-mix(in srgb, var(--accent-color) 60%, transparent), 0 8px 24px -4px rgba(0, 0, 0, 0.7);
          transform: translateY(-2px) scale(1.03);
        }
        .mood-chip-btn:hover .mood-chip-emoji,
        .mood-chip-btn.is-active .mood-chip-emoji {
          transform: scale(1.2) rotate(-5deg);
        }
        .mood-chip-emoji {
          font-size: 1.35rem;
          line-height: 1;
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
          letter-spacing: -0.01em;
        }
        .mood-chip-count {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 500;
        }
      `}</style>
    </button>
  );
};

export default MoodChip;
