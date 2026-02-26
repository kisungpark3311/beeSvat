import { forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';

// FEAT-1.5: Common Card component
interface CardProps extends ComponentPropsWithRef<'div'> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'rounded-lg border border-border bg-surface p-md shadow-sm',
          hoverable && 'transition-shadow duration-200 hover:shadow-md',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
export default Card;
