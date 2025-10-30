'use client';

import React, { useState, useEffect } from 'react';
import { FiStar } from '../icons/FeatherIcons';

interface RatingStarsProps {
  defaultValue?: number;
  value?: number;
  initialRating?: number;
  rating?: number;
  maxStars?: number;
  size?: number | 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
  classNames?: {
    base?: string;
    item?: string;
  };
}

const RatingStars: React.FC<RatingStarsProps> = ({
  defaultValue = 0,
  value,
  initialRating,
  rating: ratingProp,
  maxStars = 5,
  size = 20,
  onChange,
  readOnly = false,
  className = '',
  classNames = { base: '', item: '' },
}) => {
  const initialValue = value ?? ratingProp ?? defaultValue ?? initialRating ?? 0;
  const [internalRating, setInternalRating] = useState(initialValue);
  const [hoverRating, setHoverRating] = useState(0);

  // Sync internal state with value prop
  useEffect(() => {
    if (value !== undefined) {
      setInternalRating(value);
    }
  }, [value]);

  // Use value prop if provided, otherwise use internal rating
  const displayRating = value !== undefined ? value : internalRating;

  const handleClick = (index: number) => {
    if (readOnly) return;
    const newRating = index + 1;

    // Update internal state (for uncontrolled mode)
    if (value === undefined) {
      setInternalRating(newRating);
    }

    // Always call onChange callback
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className={`flex ${classNames?.base || ''} ${className}`}>
      {[...Array(maxStars)].map((_, index) => {
        const filled = (hoverRating || displayRating) > index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
            className={`inline-flex items-center justify-center p-0.5 transition-all duration-200 select-none touch-manipulation ${
              readOnly
                ? 'cursor-default opacity-70'
                : 'cursor-pointer hover:scale-110 active:scale-95'
            } ${classNames?.item || ''}`}
            aria-label={`Rate ${index + 1} out of ${maxStars} stars`}
          >
            <FiStar
              size={
                typeof size === 'string' ? (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : size
              }
              className={`transition-colors duration-200 ${
                filled
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-[color:var(--ai-muted)] dark:text-[color:var(--ai-muted-foreground)]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
