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
    const defaultClassName = "bg-[color:var(--ai-card-border)]/60";

    return (
        <HeroDivider
            ref={ref}
            orientation={orientation as HeroDividerProps['orientation']}
            size={size as HeroDividerProps['size']}
            className={`${defaultClassName} ${className}`}
            {...rest}
        >
            {children}
        </HeroDivider>
    );
});

Divider.displayName = 'Divider';

export default Divider;
