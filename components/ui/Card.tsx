'use client';

import React, { forwardRef } from 'react';

export interface CardProps {
    /**
     * Card content
     */
    children?: React.ReactNode;

    /**
     * Whether the card is hoverable
     */
    isHoverable?: boolean;

    /**
     * Whether the card is pressable/clickable
     */
    isPressable?: boolean;

    /**
     * Whether the card has a shadow
     */
    isBlurred?: boolean;

    /**
     * Whether the card has a border
     */
    shadow?: 'none' | 'sm' | 'md' | 'lg';

    /**
     * The radius of the card
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

    /**
     * The background disabling the card background
     */
    disableAnimation?: boolean;

    /**
     * Whether to allow content like dropdowns to overflow the card boundaries
     */
    allowContentOverflow?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A versatile card component with customizable styling
 */
const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
    const {
        children,
        isHoverable = false,
        isPressable = false,
        isBlurred = false,
        shadow = 'md',
        radius = 'lg',
        disableAnimation = false,
        allowContentOverflow = true,
        className = '',
        ...rest
    } = props;

    // Default styling with theme variables
    const defaultClassName = "bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm border border-[color:var(--ai-card-border)]/60 transition-all duration-200";    // Generate shadow classes
    const shadowClasses = shadow === 'none' ? '' :
        shadow === 'sm' ? 'shadow-sm' :
            shadow === 'md' ? 'shadow-md' :
                shadow === 'lg' ? 'shadow-lg' : '';    // Generate radius classes
    const radiusClasses = radius === 'none' ? 'rounded-none' :
        radius === 'sm' ? 'rounded-sm' :
            radius === 'md' ? 'rounded-md' :
                radius === 'lg' ? 'rounded-lg' :
                    radius === 'xl' ? 'rounded-xl' :
                        radius === '2xl' ? 'rounded-2xl' :
                            radius === 'full' ? 'rounded-full' : 'rounded-lg';

    // Generate conditional classes
    const hoverableClass = isHoverable ? 'hover:translate-y-[-2px] hover:shadow-lg' : '';
    const pressableClass = isPressable ? 'cursor-pointer active:scale-[0.98]' : '';
    const blurredClass = isBlurred ? 'backdrop-blur-md bg-opacity-80' : '';
    const animationClass = !disableAnimation ? 'transition-all duration-200' : '';    // Generate overflow classes    
    const overflowClasses = allowContentOverflow
        ? 'overflow-visible relative z-[40]'
        : 'overflow-hidden';

    return (
        <div
            ref={ref}
            className={`${defaultClassName} ${shadowClasses} ${radiusClasses} ${hoverableClass} ${pressableClass} ${blurredClass} ${animationClass} ${overflowClasses} ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
});

/**
 * Card content container
 */
export const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <div
        ref={ref}
        className={`p-4 relative overflow-visible z-[50] ${className}`}
        {...rest}
    />;
});

/**
 * Card header component
 */
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <div
        ref={ref}
        className={`px-4 pt-4 pb-2 flex items-center gap-3 z-20 ${className}`}
        {...rest}
    />;
});

/**
 * Card footer component
 */
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <div
        ref={ref}
        className={`px-4 pt-2 pb-4 flex flex-wrap gap-3 items-center ${className}`}
        {...rest}
    />;
});

Card.displayName = 'Card';
CardBody.displayName = 'CardBody';
CardHeader.displayName = 'CardHeader';
CardFooter.displayName = 'CardFooter';

export default Card;
