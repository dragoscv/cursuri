'use client';

import React, { forwardRef, createContext, useContext } from 'react';

// Create context for RadioGroup
type RadioGroupContextType = {
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDisabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
};

const RadioGroupContext = createContext<RadioGroupContextType>({});

export const useRadioGroup = () => useContext(RadioGroupContext);

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
     * Whether the radio group is disabled
     */
    isDisabled?: boolean;

    /**
     * The size of the radios
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * The color of the radios when checked
     */
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';

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
        description?: string;
        errorMessage?: string;
        wrapper?: string;
    };
}

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
        isDisabled = false,
        size = 'md',
        color = 'primary',
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isDisabled && onValueChange) {
            onValueChange(e.target.value);
        }
    };

    // Label size classes
    const getLabelSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'text-sm';
            case 'lg':
                return 'text-lg';
            default:
                return 'text-base';
        }
    };

    // Description size classes
    const getDescriptionSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'text-xs';
            case 'lg':
                return 'text-sm';
            default:
                return 'text-xs';
        }
    };

    return (
        <RadioGroupContext.Provider
            value={{
                name,
                value,
                onChange: handleChange,
                isDisabled,
                size,
                color
            }}
        >
            <div
                ref={ref}
                className={`w-full ${className} ${classNames.base || ''}`}
                role="radiogroup"
                aria-labelledby={label ? `${name}-label` : undefined}
                aria-describedby={description ? `${name}-description` : undefined}
                {...rest}
            >
                {label && (
                    <label
                        id={`${name}-label`}
                        className={`block mb-2 font-medium ${getLabelSizeClasses()} text-[color:var(--ai-foreground)] ${classNames.label || ''}`}
                    >
                        {label}
                    </label>
                )}

                <div
                    className={`
                        ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'}
                        ${classNames.wrapper || ''}
                    `}
                >
                    {children}
                </div>

                {description && !isInvalid && (
                    <p
                        id={`${name}-description`}
                        className={`mt-1 ${getDescriptionSizeClasses()} text-[color:var(--ai-muted)] ${classNames.description || ''}`}
                    >
                        {description}
                    </p>
                )}

                {errorMessage && isInvalid && (
                    <p
                        className={`mt-1 text-xs text-red-500 ${classNames.errorMessage || ''}`}
                    >
                        {errorMessage}
                    </p>
                )}
            </div>
        </RadioGroupContext.Provider>
    );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
