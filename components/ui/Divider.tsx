'use client';

import React, { forwardRef } from 'react';
import { Divider as HeroDivider, type DividerProps as HeroDividerProps } from '@heroui/react';

export interface DividerProps {
    /**
     * The orientation of the divider
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * The size of the divider
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Optional label to show in the middle of the divider
     */
    children?: React.ReactNode;

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
 * Divider component for separating content
 */
const Divider = forwardRef<HTMLHRElement, DividerProps>((props, ref) => {
    const {
        orientation = 'horizontal',
        size = 'md',
        children,
        className = '',
        ...rest
    } = props;

    // Default styling with theme variables
    const defaultClassName = "bg-[color:var(--ai-card-border)]/60";    // Get styling classes based on size
    const sizeClasses: Record<string, string> = {
        sm: "mx-2 my-1",
        md: "mx-3 my-2",
        lg: "mx-4 my-3"
    };
    const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || "mx-3 my-2";

    return (
        <HeroDivider
            ref={ref}
            orientation={orientation as HeroDividerProps['orientation']}
            className={`${defaultClassName} ${sizeClasses} ${className}`}
            {...rest}
        >
            {children}
        </HeroDivider>
    );
});

Divider.displayName = 'Divider';

export default Divider;
