'use client';

import React, { forwardRef } from 'react';
import { Switch as HeroSwitch, type SwitchProps as HeroSwitchProps } from '@heroui/react';

export interface SwitchProps {
    /**
     * Whether the switch is checked
     */
    isSelected?: boolean;

    /**
     * Callback fired when the state changes
     */
    onValueChange?: (isSelected: boolean) => void;

    /**
     * The label for the switch
     */
    label?: string;

    /**
     * Whether the switch is disabled
     */
    isDisabled?: boolean;

    /**
     * Size of the switch
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Color of the switch when checked
     */
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the switch
     */
    classNames?: {
        base?: string;
        wrapper?: string;
        thumb?: string;
        label?: string;
    };

    /**
     * ARIA label for the switch
     */
    'aria-label'?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A modern, animated switch component that follows the design system
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
    const {
        isSelected,
        onValueChange,
        label,
        isDisabled = false,
        size = 'md',
        color = 'primary',
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Default classnames with animation and styling integrated with the app's color system
    const defaultClassNames = {
        base: "group",
        wrapper: `${color === 'primary'
            ? 'bg-[color:var(--ai-card-border)]/50 data-[selected=true]:bg-[color:var(--ai-primary)]'
            : color === 'success'
                ? 'bg-[color:var(--ai-card-border)]/50 data-[selected=true]:bg-[color:var(--ai-success)]'
                : color === 'danger'
                    ? 'bg-[color:var(--ai-card-border)]/50 data-[selected=true]:bg-[color:var(--ai-danger)]'
                    : color === 'warning'
                        ? 'bg-[color:var(--ai-card-border)]/50 data-[selected=true]:bg-[color:var(--ai-warning)]'
                        : 'bg-[color:var(--ai-card-border)]/50 data-[selected=true]:bg-[color:var(--ai-primary)]'
            } shadow-inner transition-all duration-200`,
        thumb: `bg-white shadow-sm group-data-[selected=true]:translate-x-full
      ${size === 'sm'
                ? 'w-3 h-3 group-data-[selected=true]:ml-0'
                : size === 'lg'
                    ? 'w-5 h-5 group-data-[selected=true]:ml-0'
                    : 'w-4 h-4 group-data-[selected=true]:ml-0'
            } transition-transform duration-200 ease-out`,
        label: "text-[color:var(--ai-foreground)]",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        wrapper: `${defaultClassNames.wrapper} ${classNames.wrapper || ''}`,
        thumb: `${defaultClassNames.thumb} ${classNames.thumb || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
    };

    return (
        <HeroSwitch
            ref={ref}
            isSelected={isSelected}
            onValueChange={onValueChange}
            isDisabled={isDisabled}
            size={size as HeroSwitchProps['size']}
            color={color as HeroSwitchProps['color']}
            className={className}
            classNames={mergedClassNames}
            {...rest}
        >
            {label}
        </HeroSwitch>
    );
});

Switch.displayName = 'Switch';

export default Switch;
