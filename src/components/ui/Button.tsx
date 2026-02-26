import { forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';

// FEAT-1.5: Common Button component
interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-primary text-primary hover:bg-primary-light',
  ghost: 'text-primary hover:underline',
} as const;

const sizeStyles = {
  sm: 'h-8 min-w-[44px] px-3 text-sm',
  md: 'h-10 min-w-[44px] px-4 text-sm',
  lg: 'h-12 min-w-[44px] px-6 text-base',
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-md font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <span
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            role="status"
            aria-label="loading"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
