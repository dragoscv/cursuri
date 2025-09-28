'use client';

import React, { forwardRef } from 'react';

export interface SwitchProps {
    /**
     * Whether the switch is checked
     */
    isSelected?: boolean;

    /**
     * Callback fired when the state changes
     */
    onValueChange?: (isSelected: boolean) => void;

    /**
     * The label for the switch
     */
    children?: React.ReactNode;

    /**
     * Whether the switch is disabled
     */
    isDisabled?: boolean;

    /**
     * Size of the switch
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Color of the switch when checked
     */
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Class names for different parts of the switch
     */
    classNames?: {
        base?: string;
        wrapper?: string;
        thumb?: string;
        label?: string;
    };

    /**
     * The icon to display when the switch is checked
     */
    thumbIcon?: React.ReactNode;

    /**
     * The id for the switch
     */
    id?: string;

    /**
     * The name for the switch
     */
    name?: string;

    /**
     * Whether the switch is required
     */
    isRequired?: boolean;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
    const {
        isSelected = false,
        onValueChange,
        children,
        isDisabled = false,
        size = 'md',
        color = 'primary',
        className = '',
        classNames = {},
        thumbIcon,
        id,
        name,
        isRequired = false,
        ...rest
    } = props;

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isDisabled && onValueChange) {
            onValueChange(e.target.checked);
        }
    };

    // Size specific styles
    const getSwitchSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    wrapper: 'w-8 h-4',
                    thumb: 'w-3 h-3',
                    thumbTranslate: 'translate-x-4',
                    labelText: 'text-xs',
                };
            case 'lg':
                return {
                    wrapper: 'w-14 h-7',
                    thumb: 'w-6 h-6',
                    thumbTranslate: 'translate-x-7',
                    labelText: 'text-base',
                };
            default:
                return {
                    wrapper: 'w-11 h-6',
                    thumb: 'w-5 h-5',
                    thumbTranslate: 'translate-x-5',
                    labelText: 'text-sm',
                };
        }
    };

    // Color specific styles
    const getColorStyles = () => {
        switch (color) {
            case 'primary':
                return 'bg-[color:var(--ai-primary)]';
            case 'success':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'danger':
                return 'bg-red-500';
            default:
                return 'bg-[color:var(--ai-foreground)]';
        }
    };

    const uniqueId = id || `switch-${Math.random().toString(36).substring(2, 9)}`;
    const sizeStyles = getSwitchSizeStyles();

    return (
        <div className={`inline-flex items-center ${className} ${classNames.base || ''}`}>
            <label
                htmlFor={uniqueId}
                className={`
                    relative inline-flex items-center cursor-pointer
                    ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}
                `}
            >
                <input
                    ref={ref}
                    type="checkbox"
                    id={uniqueId}
                    name={name}
                    checked={isSelected}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="sr-only"
                    required={isRequired}
                    {...rest}
                />
                <div
                    className={`
                        ${sizeStyles.wrapper}
                        relative rounded-full transition-colors duration-200 ease-in-out
                        ${isSelected ? getColorStyles() : 'bg-[color:var(--ai-card-border)]'}
                        ${!isDisabled && !isSelected ? 'hover:bg-[color:var(--ai-card-border)]/80' : ''}
                        ${classNames.wrapper || ''}
                    `}
                >
                    <div
                        className={`
                            ${sizeStyles.thumb}
                            absolute left-0.5 top-1/2 -translate-y-1/2
                            rounded-full bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-foreground)] shadow-sm
                            transition-all duration-200 ease-in-out
                            ${isSelected ? sizeStyles.thumbTranslate : ''}
                            ${classNames.thumb || ''}
                        `}
                    >
                        {thumbIcon && isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center text-[0.6rem]">
                                {thumbIcon}
                            </div>
                        )}
                    </div>
                </div>
                {children && (
                    <span
                        className={`
                            ml-2 ${sizeStyles.labelText} 
                            ${isDisabled ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'}
                            ${classNames.label || ''}
                        `}
                    >
                        {children}
                    </span>
                )}
            </label>
        </div>
    );
});

Switch.displayName = 'Switch';

export default Switch;
