'use client';

import React, { forwardRef } from 'react';
import { Checkbox as HeroCheckbox, type CheckboxProps as HeroCheckboxProps } from '@heroui/react';

export interface CheckboxProps {
    /**
     * Whether the checkbox is checked
     */
    isSelected?: boolean;

    /**
     * Callback fired when the state changes
     */
    onValueChange?: (isSelected: boolean) => void;

    /**
     * The label for the checkbox
     */
    children?: React.ReactNode;

    /**
     * Whether the checkbox is disabled
     */
    isDisabled?: boolean;

    /**
     * Whether the checkbox is indeterminate
     */
    isIndeterminate?: boolean;

    /**
     * The color of the checkbox when checked
     */
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';

    /**
     * The size of the checkbox
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * The radius of the checkbox
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the checkbox
     */
    classNames?: {
        base?: string;
        wrapper?: string;
        icon?: string;
        label?: string;
    };

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A modern, animated checkbox component that follows the design system
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
    const {
        isSelected,
        onValueChange,
        children,
        isDisabled = false,
        isIndeterminate = false,
        color = 'primary',
        size = 'md',
        radius = 'md',
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Custom default classnames for theming
    const defaultClassNames = {
        base: "group",
        wrapper: `${color === 'primary'
            ? 'border-[color:var(--ai-card-border)] data-[selected=true]:bg-[color:var(--ai-primary)] data-[selected=true]:border-[color:var(--ai-primary)]'
            : color === 'success'
                ? 'border-[color:var(--ai-card-border)] data-[selected=true]:bg-[color:var(--ai-success)] data-[selected=true]:border-[color:var(--ai-success)]'
                : color === 'danger'
                    ? 'border-[color:var(--ai-card-border)] data-[selected=true]:bg-[color:var(--ai-danger)] data-[selected=true]:border-[color:var(--ai-danger)]'
                    : color === 'warning'
                        ? 'border-[color:var(--ai-card-border)] data-[selected=true]:bg-[color:var(--ai-warning)] data-[selected=true]:border-[color:var(--ai-warning)]'
                        : 'border-[color:var(--ai-card-border)] data-[selected=true]:bg-[color:var(--ai-primary)] data-[selected=true]:border-[color:var(--ai-primary)]'
            } bg-[color:var(--ai-card-bg)]/70 hover:bg-[color:var(--ai-card-bg)] transition-all duration-200 shadow-sm`,
        icon: "opacity-0 group-data-[selected=true]:opacity-100 transition-opacity",
        label: "text-[color:var(--ai-foreground)] pl-2"
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        wrapper: `${defaultClassNames.wrapper} ${classNames.wrapper || ''}`,
        icon: `${defaultClassNames.icon} ${classNames.icon || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
    };

    return (
        <HeroCheckbox
            ref={ref}
            isSelected={isSelected}
            onValueChange={onValueChange}
            isDisabled={isDisabled}
            isIndeterminate={isIndeterminate}
            color={color as HeroCheckboxProps['color']}
            size={size as HeroCheckboxProps['size']}
            radius={radius as HeroCheckboxProps['radius']}
            className={className}
            classNames={mergedClassNames}
            {...rest}
        >
            {children}
        </HeroCheckbox>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
