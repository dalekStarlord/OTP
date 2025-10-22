/**
 * Button component with accessibility and affordances
 */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-600',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-700',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:border-gray-300 disabled:text-gray-300 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950 dark:disabled:border-gray-600 dark:disabled:text-gray-500',
      ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:text-gray-300 dark:text-blue-400 dark:hover:bg-blue-950 dark:disabled:text-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300 dark:disabled:bg-gray-600',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'inline-flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

