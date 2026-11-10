import React from 'react';

const LoadingSpinner = ({ text = 'Loading free cinematic picks...' }) => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner-glow-ring"></div>
      <p className="spinner-text">{text}</p>

      <style>{`
        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          gap: 1.25rem;
        }
        .spinner-glow-ring {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-top-color: var(--primary);
          border-right-color: var(--secondary);
          animation: spin 0.85s linear infinite;
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.4);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
