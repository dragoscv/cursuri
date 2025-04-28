'use client';

import React, { forwardRef } from 'react';
import { Badge as HeroBadge, BadgeProps as HeroBadgeProps } from '@heroui/react';

export interface BadgeProps extends Omit<HeroBadgeProps, 'variant'> {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * Content to display inside the badge
     */
    children: React.ReactNode;

    /**
     * The color of the badge
     */
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';

    /**
     * The variant of the badge
     */
    variant?: 'solid' | 'flat' | 'bordered' | 'dot';

    /**
     * Position of the badge (when used as a counter on other elements)
     */
    placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Component for showing counts, labels, or status indicators
 */
const Badge = forwardRef<HTMLDivElement, BadgeProps>((props, ref) => {
    const {
        children,
        className = '',
        color = 'primary',
        variant = 'solid',
        placement,
        ...rest
    } = props;

    // Map our variant to HeroUI's variant
    const getHeroVariant = (): HeroBadgeProps['variant'] => {
        switch (variant) {
            case 'bordered':
            case 'dot':
                return 'solid'; // HeroUI doesn't have bordered or dot variants
            case 'flat':
                return 'flat';
            case 'solid':
                return 'solid';
            default:
                return 'solid';
        }
    };

    // Custom color classes based on variant and color
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
                    return 'bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)]';
            }
        } else if (variant === 'flat') {
            switch (color) {
                case 'primary':
                    return 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]';
                case 'secondary':
                    return 'bg-[color:var(--ai-secondary)]/10 text-[color:var(--ai-secondary)]';
                case 'success':
                    return 'bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)]';
                case 'warning':
                    return 'bg-[color:var(--ai-warning)]/10 text-[color:var(--ai-warning)]';
                case 'danger':
                    return 'bg-[color:var(--ai-danger)]/10 text-[color:var(--ai-danger)]';
                default:
                    return 'bg-[color:var(--ai-foreground)]/10 text-[color:var(--ai-foreground)]';
            }
        } else if (variant === 'bordered') {
            switch (color) {
                case 'primary':
                    return 'border border-[color:var(--ai-primary)] text-[color:var(--ai-primary)] bg-transparent';
                case 'secondary':
                    return 'border border-[color:var(--ai-secondary)] text-[color:var(--ai-secondary)] bg-transparent';
                case 'success':
                    return 'border border-[color:var(--ai-success)] text-[color:var(--ai-success)] bg-transparent';
                case 'warning':
                    return 'border border-[color:var(--ai-warning)] text-[color:var(--ai-warning)] bg-transparent';
                case 'danger':
                    return 'border border-[color:var(--ai-danger)] text-[color:var(--ai-danger)] bg-transparent';
                default:
                    return 'border border-[color:var(--ai-foreground)] text-[color:var(--ai-foreground)] bg-transparent';
            }
        } else if (variant === 'dot') {
            switch (color) {
                case 'primary':
                    return 'text-[color:var(--ai-primary)]';
                case 'secondary':
                    return 'text-[color:var(--ai-secondary)]';
                case 'success':
                    return 'text-[color:var(--ai-success)]';
                case 'warning':
                    return 'text-[color:var(--ai-warning)]';
                case 'danger':
                    return 'text-[color:var(--ai-danger)]';
                default:
                    return 'text-[color:var(--ai-foreground)]';
            }
        }
        return '';
    };

    return (
        <HeroBadge
            ref={ref}
            color={color}
            variant={getHeroVariant()}
            placement={placement}
            className={`${getColorClass()} ${className}`}
            {...rest}
        >
            {children}
        </HeroBadge>
    );
});

Badge.displayName = 'Badge';

export default Badge;
