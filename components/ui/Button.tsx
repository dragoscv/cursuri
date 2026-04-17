'use client';

import React, { forwardRef, useMemo } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'flat'
    | 'light'
    | 'ghost'
    | 'outline-gradient'
    | 'shimmer'
    | 'bordered';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';
type Tone = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'default';

type MotionButtonProps = Omit<
    HTMLMotionProps<'button'>,
    | 'children'
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragEnter'
    | 'onDragLeave'
    | 'onDragOver'
    | 'onDragExit'
    | 'onDrop'
    | 'ref'
>;

export interface ButtonProps extends MotionButtonProps {
    /** Visual style of the button */
    variant?: Variant;
    /** Size of the button */
    size?: Size;
    /** Border radius of the button */
    radius?: Radius;
    /** Tonal color (works on flat/light/bordered/ghost variants) */
    color?: Tone;
    /** Whether the button is currently loading */
    isLoading?: boolean;
    /** Text to display when button is in loading state (replaces children) */
    loadingText?: string;
    /** Whether the button is an icon-only button (square) */
    isIconOnly?: boolean;
    /** Content to display before the button text */
    startContent?: React.ReactNode;
    /** Content to display after the button text */
    endContent?: React.ReactNode;
    /** Stretch button to container width */
    fullWidth?: boolean;
    /** HeroUI-compatible press handler (alias for onClick) */
    onPress?: (e: any) => void;
    /** Disabled state */
    isDisabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Button content */
    children?: React.ReactNode;
    /** Allow legacy / pass-through props without complaint */
    [key: string]: any;
}

const sizeMap: Record<
    Size,
    { h: string; px: string; text: string; gap: string; iconBox: string }
> = {
    xs: { h: 'h-7', px: 'px-2.5', text: 'text-xs', gap: 'gap-1.5', iconBox: 'w-7' },
    sm: { h: 'h-8', px: 'px-3', text: 'text-sm', gap: 'gap-1.5', iconBox: 'w-8' },
    md: { h: 'h-10', px: 'px-4', text: 'text-sm', gap: 'gap-2', iconBox: 'w-10' },
    lg: { h: 'h-12', px: 'px-5', text: 'text-base', gap: 'gap-2', iconBox: 'w-12' },
    xl: { h: 'h-14', px: 'px-6', text: 'text-base', gap: 'gap-2.5', iconBox: 'w-14' },
};

const radiusMap: Record<Radius, string> = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
};

interface ToneStyles {
    solid: string;
    flat: string;
    light: string;
    bordered: string;
}

const tones: Record<Tone, ToneStyles> = {
    primary: {
        solid:
            'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-md shadow-[color:var(--ai-primary)]/25 hover:shadow-lg hover:shadow-[color:var(--ai-primary)]/40 hover:-translate-y-px',
        flat:
            'bg-[color:var(--ai-primary)]/12 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20',
        light: 'text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/10',
        bordered:
            'border border-[color:var(--ai-primary)]/40 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/8 hover:border-[color:var(--ai-primary)]',
    },
    secondary: {
        solid:
            'bg-gradient-to-r from-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] text-white shadow-md shadow-[color:var(--ai-secondary)]/25 hover:shadow-lg hover:-translate-y-px',
        flat:
            'bg-[color:var(--ai-secondary)]/12 text-[color:var(--ai-secondary)] hover:bg-[color:var(--ai-secondary)]/20',
        light: 'text-[color:var(--ai-secondary)] hover:bg-[color:var(--ai-secondary)]/10',
        bordered:
            'border border-[color:var(--ai-secondary)]/40 text-[color:var(--ai-secondary)] hover:bg-[color:var(--ai-secondary)]/8',
    },
    success: {
        solid:
            'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:-translate-y-px',
        flat: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
        light: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10',
        bordered:
            'border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/8',
    },
    danger: {
        solid:
            'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:-translate-y-px',
        flat: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
        light: 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10',
        bordered:
            'border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/8',
    },
    warning: {
        solid:
            'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:shadow-lg hover:-translate-y-px',
        flat: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
        light: 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10',
        bordered:
            'border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/8',
    },
    default: {
        solid:
            'bg-[color:var(--ai-foreground)]/8 text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)]/14',
        flat:
            'bg-[color:var(--ai-foreground)]/8 text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)]/14',
        light: 'text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)]/8',
        bordered:
            'border border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]',
    },
};

function resolveVariantClasses(variant: Variant, color: Tone): string {
    // Variants that imply their own tone
    if (variant === 'primary') return tones.primary.solid;
    if (variant === 'secondary') return tones.secondary.solid;
    if (variant === 'success') return tones.success.solid;
    if (variant === 'danger') return tones.danger.solid;
    if (variant === 'warning') return tones.warning.solid;

    // Tonal variants (flat / light / ghost / bordered) honor `color`
    const t: Tone = color === 'default' ? 'primary' : color;
    if (variant === 'flat') return tones[t].flat;
    if (variant === 'light' || variant === 'ghost') return tones[t].light;
    if (variant === 'bordered') return tones[t].bordered;

    // Decorative variants
    if (variant === 'outline-gradient') {
        return [
            'bg-[color:var(--ai-background)] text-[color:var(--ai-foreground)]',
            'border border-transparent',
            '[background:linear-gradient(var(--ai-background),var(--ai-background))_padding-box,linear-gradient(135deg,var(--ai-primary),var(--ai-secondary))_border-box]',
            'hover:[background:linear-gradient(var(--ai-background),var(--ai-background))_padding-box,linear-gradient(135deg,var(--ai-secondary),var(--ai-primary))_border-box]',
        ].join(' ');
    }
    if (variant === 'shimmer') {
        return [
            'text-white shadow-md shadow-[color:var(--ai-primary)]/25 hover:shadow-lg hover:-translate-y-px',
            'bg-[linear-gradient(110deg,var(--ai-primary),45%,var(--ai-secondary),55%,var(--ai-primary))]',
            'bg-[length:200%_100%]',
            'transition-[background-position,box-shadow,transform] duration-500',
            'hover:bg-[position:200%_0]',
        ].join(' ');
    }

    return tones.primary.solid;
}

const Spinner: React.FC<{ size: Size }> = ({ size }) => {
    const dim =
        size === 'xs' || size === 'sm'
            ? 'w-3.5 h-3.5'
            : size === 'md'
                ? 'w-4 h-4'
                : 'w-5 h-5';
    return (
        <span className={`relative inline-block ${dim}`} aria-hidden>
            <span className="absolute inset-0 rounded-full border-2 border-current opacity-25" />
            <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin" />
        </span>
    );
};

/**
 * A modern, animated, theme-aware button. Self-contained (no UI-library
 * dependency), uses CSS theme variables and framer-motion press feedback.
 *
 * Variants: primary | secondary | success | danger | warning | flat |
 * light | ghost | bordered | outline-gradient | shimmer
 *
 * Accepts both `onClick` and `onPress` (HeroUI-compatible).
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const {
        variant = 'primary',
        size = 'md',
        radius = 'lg',
        color = 'default',
        isLoading = false,
        loadingText,
        isIconOnly = false,
        startContent,
        endContent,
        fullWidth = false,
        className = '',
        children,
        onClick,
        onPress,
        isDisabled,
        disabled,
        type = 'button',
        // Strip HeroUI-only / unknown props that should not reach the DOM
        disableRipple: _disableRipple,
        disableAnimation: _disableAnimation,
        spinner: _spinner,
        spinnerPlacement: _spinnerPlacement,
        as: _as,
        ...rest
    } = props;

    const sz = sizeMap[size as Size];
    const variantClasses = useMemo(
        () => resolveVariantClasses(variant as Variant, color as Tone),
        [variant, color]
    );

    const isInactive = isLoading || isDisabled || disabled;

    const baseClasses = [
        'relative inline-flex items-center justify-center select-none whitespace-nowrap font-medium overflow-hidden',
        'transition-[background-color,color,box-shadow,transform,border-color,opacity] duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-background)]',
        sz.text,
        sz.gap,
        radiusMap[radius as Radius],
        isIconOnly ? `${sz.iconBox} ${sz.h} p-0 shrink-0` : `${sz.h} ${sz.px}`,
        fullWidth ? 'w-full' : '',
        isInactive ? 'opacity-60 pointer-events-none' : 'cursor-pointer active:translate-y-0',
        variantClasses,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        if (isInactive) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
        onPress?.(e);
    };

    return (
        <motion.button
            ref={ref}
            type={type as 'button' | 'submit' | 'reset'}
            className={baseClasses}
            whileTap={isInactive ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            disabled={isInactive}
            aria-busy={isLoading || undefined}
            aria-disabled={isInactive || undefined}
            onClick={handleClick}
            {...rest}
        >
            {isLoading ? (
                <>
                    <Spinner size={size} />
                    {!isIconOnly && (loadingText || typeof children === 'string') && (
                        <span className="truncate">{loadingText ?? children}</span>
                    )}
                </>
            ) : (
                <>
                    {startContent && (
                        <span className="inline-flex items-center shrink-0">{startContent}</span>
                    )}
                    {children}
                    {endContent && (
                        <span className="inline-flex items-center shrink-0">{endContent}</span>
                    )}
                </>
            )}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
