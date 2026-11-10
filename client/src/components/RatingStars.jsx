import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, max = 5, size = 16, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className={`rating-stars-wrapper ${interactive ? 'interactive' : ''}`}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className="star-btn"
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              color={isFilled ? '#f59e0b' : '#64748b'}
              strokeWidth={1.8}
            />
          </button>
        );
      })}

      <style>{`
        .rating-stars-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
        }
        .star-btn {
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }
        .rating-stars-wrapper.interactive .star-btn:hover {
          transform: scale(1.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default RatingStars;
