'use client';

import React, { forwardRef, useState } from 'react';

export interface TextareaProps {
    /**
     * The value of the textarea
     */
    value?: string;

    /**
     * Callback fired when the value changes
     */
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

    /**
     * The number of rows to display
     */
    rows?: number;

    /**
     * The minimum height of the textarea
     */
    minRows?: number;

    /**
     * The maximum height of the textarea
     */
    maxRows?: number;

    /**
     * The placeholder text
     */
    placeholder?: string;

    /**
     * The label for the textarea
     */
    label?: string;

    /**
     * Whether the textarea is disabled
     */
    isDisabled?: boolean;

    /**
     * Whether the textarea is read-only
     */
    isReadOnly?: boolean;

    /**
     * Whether the textarea is required
     */
    isRequired?: boolean;

    /**
     * Whether the textarea is currently invalid
     */
    isInvalid?: boolean;

    /**
     * Error message to display when textarea is invalid
     */
    errorMessage?: string;

    /**
     * Description text to display below the textarea
     */
    description?: string;

    /**
     * Textarea variant style
     */
    variant?: 'flat' | 'bordered' | 'underlined' | 'faded';

    /**
     * Textarea color
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * CSS class to apply to the textarea container
     */
    className?: string;

    /**
     * Additional classNames for different parts of the component
     */
    classNames?: {
        base?: string;
        label?: string;
        textarea?: string;
        errorMessage?: string;
        description?: string;
    };

    /**
     * Additional props to pass to the textarea element
     */
    [key: string]: any;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
    const {
        value,
        onChange,
        rows = 3,
        minRows,
        maxRows,
        placeholder,
        label,
        isDisabled,
        isReadOnly,
        isRequired,
        isInvalid,
        errorMessage,
        description,
        variant = 'bordered',
        color = 'default',
        className = '',
        classNames = {},
        ...rest
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';

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
    };    // Label animation classes
    const labelClasses = `absolute transition-all duration-200 pointer-events-none ${(isFocused || hasValue)
        ? '-top-6 left-0 text-xs font-medium'
        : 'left-3 top-3 text-sm'
        } ${isDisabled ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'} ${classNames.label || ''
        }`;

    // Base container classes
    const containerClasses = `relative w-full ${className}`;

    // Textarea wrapper classes
    const textareaWrapperClasses = `
        w-full border transition-all duration-200
        ${getVariantStyles()}
        ${getColorStyles()}
        ${isFocused ? 'ring-2 ring-opacity-20' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${variant !== 'underlined' ? 'rounded-lg' : ''}
    `;

    // Textarea classes
    const textareaClasses = `
        w-full bg-transparent outline-none px-3 py-2 resize-y
        ${isDisabled || isReadOnly ? 'cursor-not-allowed' : ''}
        placeholder:text-[color:var(--ai-muted)] text-[color:var(--ai-foreground)]
        ${classNames.textarea || ''}
    `;

    return (
        <div className={containerClasses}>
            {label && (
                <label className={labelClasses}>
                    {label}
                    {isRequired && <span className="ml-1 text-[color:var(--ai-danger)]">*</span>}
                </label>
            )}

            <div className={textareaWrapperClasses}>
                { }
                <textarea
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    disabled={isDisabled}
                    readOnly={isReadOnly}
                    placeholder={isFocused || !label ? placeholder : ''}
                    className={textareaClasses}
                    rows={rows}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    aria-invalid={isInvalid ? 'true' : 'false'}
                    required={isRequired}
                    {...rest}
                />
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

Textarea.displayName = 'Textarea';

export default Textarea;

