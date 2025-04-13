'use client';

import React, { forwardRef, useEffect, useRef } from 'react';

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
     * Id for the input element
     */
    id?: string;

    /**
     * Name for the input element
     */
    name?: string;

    /**
     * Value for the input element
     */
    value?: string;

    /**
     * Line position of the label
     */
    lineThrough?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
    const {
        isSelected = false,
        onValueChange,
        children,
        isDisabled = false,
        isIndeterminate = false,
        color = 'primary',
        size = 'md',
        radius = 'sm',
        className = '',
        id,
        name,
        value,
        lineThrough = false,
        ...rest
    } = props;

    const internalRef = useRef<HTMLInputElement>(null);
    const checkboxRef = ref || internalRef;

    useEffect(() => {
        if (typeof checkboxRef === 'object' && checkboxRef?.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate, checkboxRef]);

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isDisabled && onValueChange) {
            onValueChange(e.target.checked);
        }
    };

    // Size specific classes
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-4 h-4';
            case 'lg':
                return 'w-6 h-6';
            default:
                return 'w-5 h-5';
        }
    };

    // Color specific classes for the checked state
    const getColorClasses = () => {
        switch (color) {
            case 'primary':
                return 'bg-[color:var(--ai-primary)] border-[color:var(--ai-primary)]';
            case 'success':
                return 'bg-green-500 border-green-500';
            case 'warning':
                return 'bg-yellow-500 border-yellow-500';
            case 'danger':
                return 'bg-red-500 border-red-500';
            default:
                return 'bg-[color:var(--ai-foreground)] border-[color:var(--ai-foreground)]';
        }
    };

    // Border radius classes
    const getRadiusClasses = () => {
        switch (radius) {
            case 'none':
                return 'rounded-none';
            case 'sm':
                return 'rounded-sm';
            case 'lg':
                return 'rounded-lg';
            case 'full':
                return 'rounded-full';
            default:
                return 'rounded-md';
        }
    };

    // Label size classes
    const getLabelSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'text-xs';
            case 'lg':
                return 'text-base';
            default:
                return 'text-sm';
        }
    };

    const uniqueId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className={`inline-flex items-center ${className}`}>
            <div className="relative flex items-center">
                <input
                    ref={checkboxRef}
                    type="checkbox"
                    id={uniqueId}
                    name={name}
                    value={value}
                    checked={isSelected}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="absolute w-0 h-0 opacity-0"
                    {...rest}
                />
                <label
                    htmlFor={uniqueId}
                    className={`
                        relative flex items-center cursor-pointer
                        ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}
                    `}
                >
                    <div
                        className={`
                            relative inline-flex items-center justify-center
                            border-2 transition-all duration-200 ease-in-out
                            ${getSizeClasses()} ${getRadiusClasses()}
                            ${isSelected || isIndeterminate
                                ? getColorClasses()
                                : 'border-[color:var(--ai-card-border)] bg-transparent'
                            }
                            ${!isDisabled && !isSelected && !isIndeterminate
                                ? 'hover:border-[color:var(--ai-primary)]/60 hover:bg-[color:var(--ai-primary)]/5'
                                : ''
                            }
                        `}
                    >
                        <div
                            className={`
                                absolute inset-0 flex items-center justify-center
                                text-white transition-opacity duration-200 ease-in-out
                                ${isSelected && !isIndeterminate ? 'opacity-100' : 'opacity-0'}
                            `}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`
                                    ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}
                                `}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div
                            className={`
                                absolute inset-0 flex items-center justify-center
                                text-white transition-opacity duration-200 ease-in-out
                                ${isIndeterminate ? 'opacity-100' : 'opacity-0'}
                            `}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`
                                    ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}
                                `}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                    {children && (
                        <span
                            className={`
                                ml-2 ${getLabelSizeClasses()} 
                                ${isDisabled ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'}
                                ${lineThrough && isSelected ? 'line-through text-[color:var(--ai-muted)]' : ''}
                                transition-all duration-200
                            `}
                        >
                            {children}
                        </span>
                    )}
                </label>
            </div>
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
