'use client';

import React, { forwardRef } from 'react';

export interface ProgressProps {
  /**
   * The value of the progress indicator
   */
  value?: number;

  /**
   * The minimum value of the progress
   */
  minValue?: number;

  /**
   * The maximum value of the progress
   */
  maxValue?: number;

  /**
   * The progress size
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * The progress color
   */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  /**
   * The radius of the progress bar
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Whether to show the progress value label
   */
  showValueLabel?: boolean;

  /**
   * Custom formatting for the value label
   */
  formatOptions?: Intl.NumberFormatOptions;

  /**
   * Whether the progress bar is indeterminate
   */
  isIndeterminate?: boolean;

  /**
   * Whether the progress bar is striped
   */
  isStriped?: boolean;

  /**
   * Whether the stripe is animated
   */
  isAnimated?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Class names for different parts of the progress
   */
  classNames?: {
    base?: string;
    track?: string;
    indicator?: string;
    label?: string;
    value?: string;
  };

  /**
   * Additional props
   */
  [key: string]: any;
}

/**
 * Custom Progress bar component for displaying completion or loading status
 */
const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) => {
  const {
    value = 0,
    minValue = 0,
    maxValue = 100,
    size = 'md',
    color = 'primary',
    radius = 'full',
    showValueLabel = false,
    className = '',
    classNames = {},
    ...rest
  } = props;

  // Calculate percentage
  const percentage = Math.min(Math.max(((value - minValue) / (maxValue - minValue)) * 100, 0), 100);

  // Size classes
  const sizeClasses: Record<string, string> = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  // Radius classes
  const radiusClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Color classes for indicator
  const colorClasses: Record<string, string> = {
    default: 'bg-[color:var(--ai-muted)]',
    primary: 'bg-[color:var(--ai-primary)]',
    secondary: 'bg-[color:var(--ai-secondary)]',
    success: 'bg-[color:var(--ai-success)]',
    warning: 'bg-[color:var(--ai-warning)]',
    danger: 'bg-[color:var(--ai-error)]',
  };

  return (
    <div
      ref={ref}
      className={`w-full ${classNames.base || ''} ${className}`}
      {...rest}
    >
      <div
        className={`w-full ${sizeClasses[size]} ${radiusClasses[radius]} bg-[color:var(--ai-card-border)] dark:bg-[color:var(--ai-card-border)] border border-[color:var(--ai-card-border)] overflow-hidden ${classNames.track || ''}`}
      >
        <div
          className={`h-full ${radiusClasses[radius]} ${colorClasses[color]} transition-all duration-300 ease-in-out ${classNames.indicator || ''}`}
          style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '2px' : '0' }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={minValue}
          aria-valuemax={maxValue}
        />
      </div>
      {showValueLabel && (
        <div className={`mt-1 text-xs text-[color:var(--ai-foreground)] ${classNames.value || ''}`}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

export default Progress;
