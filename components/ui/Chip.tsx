'use client';

import React, { forwardRef } from 'react';
import { Chip as HeroChip, type ChipProps as HeroChipProps } from '@heroui/react';

export interface ChipProps {
    /**
     * The content of the chip
     */
    children?: React.ReactNode;

    /**
     * The size of the chip
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * The variant of the chip
     */
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'dot';

    /**
     * The color of the chip
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * The radius of the chip
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

    /**
     * Whether the chip is closeable
     */
    isCloseable?: boolean;

    /**
     * Callback when close button is clicked
     */
    onClose?: () => void;

    /**
     * Content to display before the chip content
     */
    startContent?: React.ReactNode;

    /**
     * Content to display after the chip content
     */
    endContent?: React.ReactNode;

    /**
     * Avatar to display in the chip
     */
    avatar?: React.ReactNode;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A versatile chip component for displaying tags, categories, or statuses
 */
const Chip = forwardRef<HTMLDivElement, ChipProps>((props, ref) => {
    const {
        children,
        size = 'md',
        variant = 'solid',
        color = 'default',
        radius = 'full',
        isCloseable = false,
        onClose,
        startContent,
        endContent,
        avatar,
        className = '',
        ...rest
    } = props;

    // Style mapping that matches the app's design system
    const getColorClass = () => {
        if (variant === 'solid') {
            switch (color) {
                case 'primary':
                    return 'bg-[color:var(--ai-primary)] text-white';
                case 'secondary':
                    return 'bg-[color:var(--ai-secondary)] text-white';
                case 'success':
                    return 'bg-[color:var(--ai-success)] text-white';
                case 'warning':
                    return 'bg-[color:var(--ai-warning)] text-white';
                case 'danger':
                    return 'bg-[color:var(--ai-danger)] text-white';
                default:
                    return '';
            }
        } else if (variant === 'bordered') {
            switch (color) {
                case 'primary':
                    return 'border-[color:var(--ai-primary)] text-[color:var(--ai-primary)]';
                case 'secondary':
                    return 'border-[color:var(--ai-secondary)] text-[color:var(--ai-secondary)]';
                case 'success':
                    return 'border-[color:var(--ai-success)] text-[color:var(--ai-success)]';
                case 'warning':
                    return 'border-[color:var(--ai-warning)] text-[color:var(--ai-warning)]';
                case 'danger':
                    return 'border-[color:var(--ai-danger)] text-[color:var(--ai-danger)]';
                default:
                    return '';
            }
        } else if (variant === 'light') {
            switch (color) {
                case 'primary':
                    return 'bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)]';
                case 'secondary':
                    return 'bg-[color:var(--ai-secondary)]/20 text-[color:var(--ai-secondary)]';
                case 'success':
                    return 'bg-[color:var(--ai-success)]/20 text-[color:var(--ai-success)]';
                case 'warning':
                    return 'bg-[color:var(--ai-warning)]/20 text-[color:var(--ai-warning)]';
                case 'danger':
                    return 'bg-[color:var(--ai-danger)]/20 text-[color:var(--ai-danger)]';
                default:
                    return 'bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]';
            }
        }

        return '';
    };

    return (
        <HeroChip
            ref={ref}
            size={size as HeroChipProps['size']}
            variant={variant as HeroChipProps['variant']}
            color={color as HeroChipProps['color']}
            radius={radius as HeroChipProps['radius']}
            isCloseable={isCloseable}
            onClose={onClose}
            startContent={startContent}
            endContent={endContent}
            avatar={avatar}
            className={`${getColorClass()} ${className}`}
            {...rest}
        >
            {children}
        </HeroChip>
    );
});

Chip.displayName = 'Chip';

export default Chip;
