'use client';

import React, { forwardRef } from 'react';
import { Textarea as HeroTextarea, type TextAreaProps as HeroTextareaProps } from '@heroui/react';

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
     * Whether to disable automatic resizing
     */
    disableAutosize?: boolean;

    /**
     * Whether to disable animation
     */
    disableAnimation?: boolean;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the textarea
     */
    classNames?: {
        base?: string;
        label?: string;
        inputWrapper?: string;
        input?: string;
        description?: string;
        errorMessage?: string;
    };

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A modern, animated textarea component that follows the design system
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
    const {
        rows = 4,
        minRows,
        maxRows,
        placeholder,
        label,
        isDisabled = false,
        isReadOnly = false,
        isInvalid = false,
        errorMessage,
        description,
        disableAutosize = false,
        disableAnimation = false,
        className = '',
        classNames = {},
        ...rest
    } = props;

    // Default classnames with styling integrated with the app's color system
    const defaultClassNames = {
        base: "max-w-full",
        label: "text-[color:var(--ai-foreground)] font-medium",
        inputWrapper: "bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm border-[color:var(--ai-card-border)] data-[hover=true]:border-[color:var(--ai-primary)]/70 data-[focus=true]:border-[color:var(--ai-primary)] rounded-lg transition-all duration-200 shadow-sm hover:shadow",
        input: "text-[color:var(--ai-foreground)] resize-y",
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
        <HeroTextarea
            ref={ref}
            rows={rows}
            minRows={minRows}
            maxRows={maxRows}
            placeholder={placeholder}
            label={label}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            description={description}
            disableAutosize={disableAutosize}
            disableAnimation={disableAnimation}
            className={className}
            classNames={mergedClassNames}
            variant="bordered"
            {...rest}
        />
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
