'use client';

import React, { forwardRef } from 'react';
import { Progress as HeroProgress, type ProgressProps as HeroProgressProps } from '@heroui/react';

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
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';    /**
     * Whether to show the progress value label
     */
    showValueLabel?: boolean;    /**
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
 * Progress bar component for displaying completion or loading status
 */
const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) => {
    const {
        value,
        minValue = 0,
        maxValue = 100,
        size = 'md',
        color = 'primary',
        radius = 'full',
        showValueLabel = false,
        formatOptions,
        isIndeterminate = false,
        isStriped = false,
        isAnimated = false,
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Default classnames with custom theming
    const defaultClassNames = {
        base: "w-full",
        track: "bg-[color:var(--ai-card-border)]",
        indicator: `${color === 'primary'
            ? 'bg-[color:var(--ai-primary)]'
            : color === 'secondary'
                ? 'bg-[color:var(--ai-secondary)]'
                : color === 'success'
                    ? 'bg-[color:var(--ai-success)]'
                    : color === 'warning'
                        ? 'bg-[color:var(--ai-warning)]'
                        : color === 'danger'
                            ? 'bg-[color:var(--ai-danger)]'
                            : 'bg-[color:var(--ai-primary)]'
            }`,
        label: "text-[color:var(--ai-foreground)]",
        value: "text-[color:var(--ai-foreground-inverse)]",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        track: `${defaultClassNames.track} ${classNames.track || ''}`,
        indicator: `${defaultClassNames.indicator} ${classNames.indicator || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
        value: `${defaultClassNames.value} ${classNames.value || ''}`,
    }; return (
        // @ts-ignore - HeroUI component props mismatch
        <HeroProgress
            value={value}
            minValue={minValue}
            maxValue={maxValue}
            size={size as HeroProgressProps['size']}
            color={color as HeroProgressProps['color']}
            radius={radius as HeroProgressProps['radius']} showValueLabel={showValueLabel}
            formatOptions={formatOptions}
            isIndeterminate={isIndeterminate}
            isStriped={isStriped && !isAnimated ? true : isStriped}
            className={`${className} ${isAnimated ? 'animate-progress-stripe' : ''}`}
            classNames={mergedClassNames}
            {...rest}
        />
    );
});

Progress.displayName = 'Progress';

export default Progress;
