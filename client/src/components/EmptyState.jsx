import React from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Film,
  title = 'No movies found',
  description = 'Try adjusting your filters or search term to discover more free films.',
  actionText = 'Explore Catalog',
  actionLink = '/explore',
}) => {
  return (
    <div className="empty-state-wrapper glass-panel">
      <div className="empty-state-icon">
        <Icon size={36} color="#c4b5fd" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}

      <style>{`
        .empty-state-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3.5rem 2rem;
          margin: 1.5rem 0;
          gap: 0.85rem;
          max-width: 520px;
          margin-inline: auto;
        }
        .empty-state-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid var(--border);
          display: grid;
          place-items: center;
          margin-bottom: 0.5rem;
        }
        .empty-state-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #fff;
        }
        .empty-state-desc {
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
