'use client';

import React, { forwardRef } from 'react';
import { Input as HeroInput, type InputProps as HeroInputProps } from '@heroui/react';

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
     * Content to display at the start of the input
     */
    startContent?: React.ReactNode;

    /**
     * Content to display at the end of the input
     */
    endContent?: React.ReactNode;

    /**
     * The input type (text, password, email, etc.)
     */
    type?: string;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the input
     */
    classNames?: {
        base?: string;
        label?: string;
        input?: string;
        inputWrapper?: string;
        description?: string;
        errorMessage?: string;
    };

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A modern, accessible input component that follows the design system
 */
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        label,
        isDisabled = false,
        isReadOnly = false,
        isInvalid = false,
        errorMessage,
        description,
        startContent,
        endContent,
        type = 'text',
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Custom default classnames for theming
    const defaultClassNames = {
        base: "max-w-full",
        label: "text-[color:var(--ai-foreground)] font-medium",
        inputWrapper: "bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm border-[color:var(--ai-card-border)] data-[hover=true]:border-[color:var(--ai-primary)]/70 data-[focus=true]:border-[color:var(--ai-primary)] rounded-lg transition-all duration-200 shadow-sm hover:shadow",
        input: "text-[color:var(--ai-foreground)]",
        description: "text-[color:var(--ai-muted)]",
        errorMessage: "text-[color:var(--ai-danger)]",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        label: `${defaultClassNames.label} ${classNames.label || ''}`,
        inputWrapper: `${defaultClassNames.inputWrapper} ${classNames.inputWrapper || ''}`,
        input: `${defaultClassNames.input} ${classNames.input || ''}`,
        description: `${defaultClassNames.description} ${classNames.description || ''}`,
        errorMessage: `${defaultClassNames.errorMessage} ${classNames.errorMessage || ''}`,
    };

    return (
        <HeroInput
            ref={ref}
            label={label}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            description={description}
            startContent={startContent}
            endContent={endContent}
            type={type}
            className={className}
            classNames={mergedClassNames}
            variant="bordered"
            {...rest}
        />
    );
});

Input.displayName = 'Input';

export default Input;
