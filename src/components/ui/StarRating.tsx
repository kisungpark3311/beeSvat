'use client';

import { forwardRef, useCallback } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent } from 'react';

// FEAT-1.5: Star Rating component
interface StarRatingProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange'> {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

function StarIcon({ filled, size = 32 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

const StarRating = forwardRef<HTMLDivElement, StarRatingProps>(
  ({ value, onChange, readonly = false, size = 32, className = '', ...props }, ref) => {
    const handleClick = useCallback(
      (starValue: number) => {
        if (!readonly && onChange) {
          onChange(starValue);
        }
      },
      [readonly, onChange],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>, starValue: number) => {
        if (readonly) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange?.(starValue);
        }
      },
      [readonly, onChange],
    );

    return (
      <div
        ref={ref}
        className={['inline-flex items-center gap-xs', className].filter(Boolean).join(' ')}
        role="group"
        aria-label={`Rating: ${value} out of 5 stars`}
        {...props}
      >
        {[1, 2, 3, 4, 5].map((starValue) => {
          const filled = starValue <= value;

          if (readonly) {
            return (
              <span
                key={starValue}
                className={[
                  'inline-flex items-center justify-center',
                  filled ? 'text-accent' : 'text-border',
                ].join(' ')}
                style={{ width: Math.max(size, 44), height: Math.max(size, 44) }}
              >
                <StarIcon filled={filled} size={size} />
              </span>
            );
          }

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className={[
                'inline-flex cursor-pointer items-center justify-center rounded-sm',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-light',
                'hover:scale-110',
                filled ? 'text-accent' : 'text-border',
              ].join(' ')}
              style={{ width: Math.max(size, 44), height: Math.max(size, 44) }}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <StarIcon filled={filled} size={size} />
            </button>
          );
        })}
      </div>
    );
  },
);

StarRating.displayName = 'StarRating';
export default StarRating;
