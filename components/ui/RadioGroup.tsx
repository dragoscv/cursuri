'use client';

import React, { forwardRef } from 'react';
import { RadioGroup as HeroRadioGroup, type RadioGroupProps as HeroRadioGroupProps } from '@heroui/react';

export interface RadioGroupProps {
    /**
     * The selected value
     */
    value?: string;

    /**
     * Callback fired when the value changes
     */
    onValueChange?: (value: string) => void;

    /**
     * The name of the radio group
     */
    name?: string;

    /**
     * The label for the radio group
     */
    label?: string;

    /**
     * Description text to display below the radio group
     */
    description?: string;

    /**
     * Error message to display when radio group is invalid
     */
    errorMessage?: string;

    /**
     * Whether the radio group is invalid
     */
    isInvalid?: boolean;

    /**
     * The layout direction of the radios
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * Child Radio components
     */
    children?: React.ReactNode;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the radio group
     */
    classNames?: {
        base?: string;
        label?: string;
        wrapper?: string;
        description?: string;
        errorMessage?: string;
    };

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A container for radio buttons that provides context and state management
 */
const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>((props, ref) => {
    const {
        value,
        onValueChange,
        name,
        label,
        description,
        errorMessage,
        isInvalid = false,
        orientation = 'vertical',
        children,
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Custom default classnames for theming
    const defaultClassNames = {
        base: "w-full",
        label: "text-[color:var(--ai-foreground)] font-medium mb-1.5",
        wrapper: `${orientation === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col gap-2'}`,
        description: "text-[color:var(--ai-muted)] text-sm mt-1.5",
        errorMessage: "text-[color:var(--ai-danger)] text-sm mt-1.5",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
        wrapper: `${defaultClassNames.wrapper} ${classNames.wrapper || ''}`,
        description: `${defaultClassNames.description} ${classNames.description || ''}`,
        errorMessage: `${defaultClassNames.errorMessage} ${classNames.errorMessage || ''}`,
    };

    return (
        <HeroRadioGroup
            ref={ref}
            value={value}
            onValueChange={onValueChange}
            name={name}
            label={label}
            description={description}
            errorMessage={errorMessage}
            isInvalid={isInvalid}
            orientation={orientation as HeroRadioGroupProps['orientation']}
            className={className}
            classNames={mergedClassNames}
            {...rest}
        >
            {children}
        </HeroRadioGroup>
    );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
