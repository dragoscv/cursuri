'use client';

import React, { forwardRef } from 'react';
import { Radio as HeroRadio, type RadioProps as HeroRadioProps } from '@heroui/react';

export interface RadioProps extends Omit<HeroRadioProps, 'isSelected' | 'onValueChange' | 'value'> {
    /**
     * Whether the radio is checked
     */
    isSelected?: boolean;

    /**
     * The name of the radio group
     */
    name?: string;

    /**
     * The value of the radio button
     */
    value: string;

    /**
     * The label for the radio
     */
    children?: React.ReactNode;

    /**
     * Whether the radio is disabled
     */
    isDisabled?: boolean;

    /**
     * The size of the radio
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * The color of the radio when checked
     */
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the radio
     */
    classNames?: {
        base?: string;
        wrapper?: string;
        control?: string;
        label?: string;
    };

    /**
     * Callback fired when the state changes
     */
    onValueChange?: (isSelected: boolean) => void;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A modern, animated radio button component that follows the design system
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
    const {
        isSelected,
        name,
        value,
        children,
        isDisabled = false,
        size = 'md',
        color = 'primary',
        className = '',
        classNames = {},
        onValueChange,
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
        control: "opacity-0 group-data-[selected=true]:opacity-100 transition-opacity",
        label: "text-[color:var(--ai-foreground)] pl-2",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        wrapper: `${defaultClassNames.wrapper} ${classNames.wrapper || ''}`,
        control: `${defaultClassNames.control} ${classNames.control || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
    };

    // Create a handler for value changes if needed
    const handleChange = onValueChange ? (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange(e.target.checked);
    } : undefined;

    // Properties that HeroRadio accepts
    const heroProps = {
        ref,
        name,
        value,
        disabled: isDisabled,
        checked: isSelected,
        onChange: handleChange,
        className,
        classNames: mergedClassNames,
        ...rest
    };

    return (
        <HeroRadio {...heroProps}>
            {children}
        </HeroRadio>
    );
});

Radio.displayName = 'Radio';

export default Radio;
