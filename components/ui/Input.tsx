'use client';

import React, { forwardRef, useState } from 'react';

export interface InputProps {
    /**
     * The label displayed above the input
     */
    label?: string;

    /**
     * The input's value
     */
    value?: string;

    /**
     * Callback fired when input value changes
     */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

    /**
     * The placeholder text
     */
    placeholder?: string;

    /**
     * Whether the input is disabled
     */
    isDisabled?: boolean;

    /**
     * Whether the input is read-only
     */
    isReadOnly?: boolean;

    /**
     * Whether the input is currently invalid
     */
    isInvalid?: boolean;

    /**
     * Error message to display when input is invalid
     */
    errorMessage?: string;

    /**
     * Description text to display below the input
     */
    description?: string;

    /**
     * Input type (text, password, email, etc.)
     */
    type?: string;

    /**
     * CSS class to apply to the input container
     */
    className?: string;

    /**
     * Content to display at the start of the input
     */
    startContent?: React.ReactNode;

    /**
     * Content to display at the end of the input
     */
    endContent?: React.ReactNode;

    /**
     * Whether the input is required
     */
    isRequired?: boolean;

    /**
     * Input variant style
     */
    variant?: 'flat' | 'bordered' | 'underlined' | 'faded';

    /**
     * Input color
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * Input size
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Additional classNames for different parts of the component
     */
    classNames?: {
        base?: string;
        label?: string;
        input?: string;
        innerWrapper?: string;
        errorMessage?: string;
        description?: string;
    };

    /**
     * Additional props to pass to the input element
     */
    [key: string]: any;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        label,
        value,
        onChange,
        placeholder,
        isDisabled,
        isReadOnly,
        isInvalid,
        errorMessage,
        description,
        type = 'text',
        className = '',
        startContent,
        endContent,
        isRequired,
        variant = 'bordered',
        color = 'default',
        size = 'md',
        classNames = {},
        ...rest
    } = props; const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';
    const showLabel = isFocused || hasValue;

    // Generate variant-specific styles
    const getVariantStyles = () => {
        switch (variant) {
            case 'flat':
                return 'bg-[color:var(--ai-card-bg)] border-transparent';
            case 'bordered':
                return 'bg-transparent border-[color:var(--ai-card-border)]';
            case 'underlined':
                return 'bg-transparent border-b-2 border-x-0 border-t-0 rounded-none px-1 border-[color:var(--ai-card-border)]';
            case 'faded':
                return 'bg-[color:var(--ai-card-bg)]/50 border-transparent';
            default:
                return 'bg-transparent border-[color:var(--ai-card-border)]';
        }
    };

    // Generate color-specific styles
    const getColorStyles = () => {
        if (isInvalid) return 'border-[color:var(--ai-danger)] focus-within:border-[color:var(--ai-danger)] focus-within:ring-red-500/20';

        switch (color) {
            case 'primary':
                return 'focus-within:border-[color:var(--ai-primary)] focus-within:ring-[color:var(--ai-primary)]/20';
            case 'secondary':
                return 'focus-within:border-[color:var(--ai-secondary)] focus-within:ring-[color:var(--ai-secondary)]/20';
            case 'success':
                return 'focus-within:border-green-500 focus-within:ring-green-500/20';
            case 'warning':
                return 'focus-within:border-yellow-500 focus-within:ring-yellow-500/20';
            case 'danger':
                return 'focus-within:border-[color:var(--ai-danger)] focus-within:ring-red-500/20';
            default:
                return 'focus-within:border-[color:var(--ai-card-border)] focus-within:ring-[color:var(--ai-foreground)]/20';
        }
    };

    // Generate size-specific styles
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'h-8 text-xs';
            case 'lg':
                return 'h-12 text-base';
            default:
                return 'h-10 text-sm';
        }
    };    // Label animation classes
    const labelClasses = `
        absolute transition-all duration-200 pointer-events-none
        ${showLabel
            ? '-top-6 left-0 text-xs font-medium'
            : `${startContent ? 'left-10' : 'left-3'} top-1/2 -translate-y-1/2 text-sm`
        }
        ${isDisabled ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'}
        ${classNames.label || ''}
    `;

    // Base container classes
    const containerClasses = `relative w-full ${className}`;

    // Inner wrapper classes
    const innerWrapperClasses = `
        flex items-center w-full border transition-all duration-200
        ${getVariantStyles()}
        ${getColorStyles()}
        ${getSizeStyles()}
        ${isFocused ? 'ring-2 ring-opacity-20' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${variant !== 'underlined' ? 'rounded-lg' : ''}
        ${classNames.innerWrapper || ''}
    `;

    // Input classes
    const inputClasses = `
        w-full bg-transparent outline-none px-3 py-2
        ${startContent ? 'pl-0' : ''}
        ${endContent ? 'pr-0' : ''}
        ${isDisabled || isReadOnly ? 'cursor-not-allowed' : ''}
        placeholder:text-[color:var(--ai-muted)] text-[color:var(--ai-foreground)]
        ${classNames.input || ''}
    `;

    return (
        <div className={containerClasses}>
            {label && (
                <label className={labelClasses}>
                    {label}
                    {isRequired && <span className="ml-1 text-[color:var(--ai-danger)]">*</span>}
                </label>)}
            <div className={innerWrapperClasses}>
                {startContent && (
                    <div className="flex items-center pl-3">
                        {startContent}
                    </div>
                )}
                { }
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={isDisabled}
                    readOnly={isReadOnly}
                    placeholder={(isFocused || !label) ? placeholder : ''}
                    className={inputClasses}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    aria-invalid={isInvalid ? 'true' : 'false'}
                    required={isRequired}
                    {...rest}
                />

                {endContent && (
                    <div className="flex items-center pr-3">{endContent}</div>
                )}
            </div>

            {errorMessage && isInvalid && (
                <p className={`mt-1 text-xs text-[color:var(--ai-danger)] ${classNames.errorMessage || ''}`}>
                    {errorMessage}
                </p>
            )}

            {description && !isInvalid && (
                <p className={`mt-1 text-xs text-[color:var(--ai-muted)] ${classNames.description || ''}`}>
                    {description}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

