'use client';

import React, { forwardRef } from 'react';
import { Card as HeroCard, CardBody as HeroCardBody, CardHeader as HeroCardHeader, CardFooter as HeroCardFooter, type CardProps as HeroCardProps } from '@heroui/react';

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
        className = '',
        ...rest
    } = props;

    // Default styling with theme variables
    const defaultClassName = "bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm border border-[color:var(--ai-card-border)]/60 transition-all duration-200";

    return (
        <HeroCard
            ref={ref}
            isHoverable={isHoverable}
            isPressable={isPressable}
            isBlurred={isBlurred}
            shadow={shadow as HeroCardProps['shadow']}
            radius={radius as HeroCardProps['radius']}
            disableAnimation={disableAnimation}
            className={`${defaultClassName} ${className}`}
            {...rest}
        >
            {children}
        </HeroCard>
    );
});

/**
 * Card content container
 */
export const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroCardBody ref={ref} className={className} {...rest} />;
});

/**
 * Card header component
 */
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroCardHeader ref={ref} className={className} {...rest} />;
});

/**
 * Card footer component
 */
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroCardFooter ref={ref} className={className} {...rest} />;
});

Card.displayName = 'Card';
CardBody.displayName = 'CardBody';
CardHeader.displayName = 'CardHeader';
CardFooter.displayName = 'CardFooter';

export default Card;
