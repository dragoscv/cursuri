'use client';

import React, { forwardRef } from 'react';
import { Select as HeroSelect, type SelectProps as HeroSelectProps } from '@heroui/react';

export interface SelectProps {
    /**
     * The label for the select
     */
    label?: string;

    /**
     * The current selected value
     */
    value?: string;

    /**
     * Callback fired when the value changes
     */
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;

    /**
     * The placeholder text when no option is selected
     */
    placeholder?: string;

    /**
     * Whether the select is disabled
     */
    isDisabled?: boolean;

    /**
     * Whether the select is invalid
     */
    isInvalid?: boolean;

    /**
     * Error message to display when select is invalid
     */
    errorMessage?: string;

    /**
     * Description text to display below the select
     */
    description?: string;

    /**
     * The size of the select
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * The radius of the select
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

    /**
     * The variant of the select
     */
    variant?: 'flat' | 'bordered' | 'underlined' | 'faded';

    /**
     * The color of the select
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * Selectable options
     */
    children?: React.ReactNode;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the select
     */
    classNames?: {
        base?: string;
        label?: string;
        trigger?: string;
        value?: string;
        innerWrapper?: string;
        selectorIcon?: string;
        popover?: string;
        listbox?: string;
        listboxWrapper?: string;
        description?: string;
        errorMessage?: string;
    };

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A modern, animated select component that follows the design system
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
    const {
        label,
        value,
        onChange,
        placeholder,
        isDisabled = false,
        isInvalid = false,
        errorMessage,
        description,
        size = 'md',
        radius = 'md',
        variant = 'bordered',
        color = 'default',
        children,
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Default classnames with styling integrated with the app's color system
    const defaultClassNames = {
        base: "max-w-full",
        label: "text-[color:var(--ai-foreground)] font-medium",
        trigger: `bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm border-[color:var(--ai-card-border)] 
      data-[hover=true]:border-[color:var(--ai-primary)]/70 
      data-[focus=true]:border-[color:var(--ai-primary)] 
      transition-all duration-200 shadow-sm hover:shadow`,
        value: "text-[color:var(--ai-foreground)]",
        innerWrapper: "group",
        selectorIcon: "text-[color:var(--ai-foreground)]/60 group-data-[open=true]:rotate-180 transition-transform",
        popover: "bg-[color:var(--ai-card-bg)]/95 backdrop-blur-md border border-[color:var(--ai-card-border)]/70 shadow-lg",
        listbox: "gap-0.5 p-1",
        listboxWrapper: "",
        description: "text-[color:var(--ai-muted)]",
        errorMessage: "text-[color:var(--ai-danger)]",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
        trigger: `${defaultClassNames.trigger} ${classNames.trigger || ''}`,
        value: `${defaultClassNames.value} ${classNames.value || ''}`,
        innerWrapper: `${defaultClassNames.innerWrapper} ${classNames.innerWrapper || ''}`,
        selectorIcon: `${defaultClassNames.selectorIcon} ${classNames.selectorIcon || ''}`,
        popover: `${defaultClassNames.popover} ${classNames.popover || ''}`,
        listbox: `${defaultClassNames.listbox} ${classNames.listbox || ''}`,
        listboxWrapper: `${defaultClassNames.listboxWrapper} ${classNames.listboxWrapper || ''}`,
        description: `${defaultClassNames.description} ${classNames.description || ''}`,
        errorMessage: `${defaultClassNames.errorMessage} ${classNames.errorMessage || ''}`,
    };

    return (
        <HeroSelect
            ref={ref}
            label={label}
            selectedKeys={value ? [value] : []}
            onChange={onChange as any}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            description={description}
            size={size as HeroSelectProps['size']}
            radius={radius as HeroSelectProps['radius']}
            variant={variant as HeroSelectProps['variant']}
            color={color as HeroSelectProps['color']}
            className={className}
            classNames={mergedClassNames}
            {...rest}
        >
            {children}
        </HeroSelect>
    );
});

Select.displayName = 'Select';

export default Select;
