'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';

export interface SelectItemProps {
    key: string;
    value?: string;
    children: React.ReactNode;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    description?: string;
    className?: string;
    isDisabled?: boolean;
}

export const SelectItem = ({
    key,
    value = key,
    children,
    startContent,
    endContent,
    description,
    className = '',
    isDisabled = false
}: SelectItemProps) => {
    // This is just a wrapper component for type-safety
    // The actual rendering happens in the Select component
    return <></>;
};

export interface SelectProps {
    /**
     * The label for the select
     */
    label?: string;

    /**
     * Array of selected keys
     */
    selectedKeys?: string[];

    /**
     * The current selected value
     */
    value?: string;

    /**
     * Callback fired when the value changes
     */
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;

    /**
     * Callback fired when a key is selected
     */
    onSelectionChange?: (key: string) => void;

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
     * The variant of the select
     */
    variant?: 'flat' | 'bordered' | 'underlined' | 'faded';

    /**
     * The color of the select
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * Content to display at the start of the select
     */
    startContent?: React.ReactNode;

    /**
     * CSS class to apply to the select container
     */
    className?: string;

    /**
     * Additional classNames for different parts of the component
     */
    classNames?: {
        base?: string;
        label?: string;
        trigger?: string;
        listbox?: string;
        listboxWrapper?: string;
        item?: string;
        errorMessage?: string;
        description?: string;
    };

    /**
     * Children components (SelectItems)
     */
    children?: React.ReactNode;

    /**
     * Whether the field is required
     */
    isRequired?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
    const {
        label,
        selectedKeys = [],
        value,
        onChange,
        onSelectionChange,
        placeholder = 'Select an option',
        isDisabled = false,
        isInvalid = false,
        errorMessage,
        description,
        size = 'md',
        variant = 'bordered',
        color = 'default',
        startContent,
        className = '',
        classNames = {},
        children,
        isRequired = false,
        ...rest
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [selectedLabel, setSelectedLabel] = useState<React.ReactNode>('');
    const selectRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLSelectElement>(null);
    const selectInputRef = ref || internalRef;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);    // Initialize selected value from selectedKeys or value prop
    useEffect(() => {
        if (selectedKeys && selectedKeys.length > 0) {
            const selectedKey = selectedKeys[0];

            // Find the corresponding child to get its text content
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) &&
                    child.type === SelectItem &&
                    child.props) {
                    const childProps = child.props as { key?: string; value?: string; children?: React.ReactNode };
                    if (childProps.key === selectedKey) {
                        setSelectedValue(childProps.value || childProps.key || "");
                        setSelectedLabel(childProps.children);
                    }
                }
            });
        } else if (value) {
            setSelectedValue(value);

            // Find the child with matching value to get its text content
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) &&
                    child.type === SelectItem &&
                    child.props) {
                    const childProps = child.props as { key?: string; value?: string; children?: React.ReactNode };
                    if (childProps.value === value || childProps.key === value) {
                        setSelectedLabel(childProps.children);
                    }
                }
            });
        } else {
            setSelectedValue('');
            setSelectedLabel('');
        }
    }, [selectedKeys, value, children]);

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
        if (isInvalid) return 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20';

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
                return 'focus-within:border-red-500 focus-within:ring-red-500/20';
            default:
                return 'focus-within:border-[color:var(--ai-card-border)] focus-within:ring-[color:var(--ai-foreground)]/20';
        }
    };

    // Size specific styles
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    height: 'h-8',
                    text: 'text-xs',
                    padding: 'px-2 py-1',
                    itemPadding: 'px-2 py-1',
                };
            case 'lg':
                return {
                    height: 'h-12',
                    text: 'text-base',
                    padding: 'px-4 py-3',
                    itemPadding: 'px-4 py-3',
                };
            default:
                return {
                    height: 'h-10',
                    text: 'text-sm',
                    padding: 'px-3 py-2',
                    itemPadding: 'px-3 py-2',
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const handleSelect = (itemKey: string, itemValue: string, itemLabel: React.ReactNode) => {
        setSelectedValue(itemValue);
        setSelectedLabel(itemLabel);
        setIsOpen(false);

        // Update underlying select for form submission
        const inputRef = selectInputRef as React.RefObject<HTMLSelectElement>;
        if (inputRef && inputRef.current) {
            inputRef.current.value = itemValue;

            // Create and dispatch change event
            const event = new Event('change', { bubbles: true });
            inputRef.current.dispatchEvent(event);

            // Call onChange if provided
            if (onChange) {
                const changeEvent = {
                    target: { value: itemValue }
                } as unknown as React.ChangeEvent<HTMLSelectElement>;
                onChange(changeEvent);
            }
        }

        // Call onSelectionChange if provided
        if (onSelectionChange) {
            onSelectionChange(itemKey);
        }
    };

    // Extract SelectItem children
    const selectItems = React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
            return child.props;
        }
        return null;
    })?.filter(Boolean) as SelectItemProps[];

    return (
        <div className={`relative w-full ${className}`}>
            {label && (
                <label className={`block mb-1.5 text-sm font-medium ${isDisabled ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'
                    } ${classNames.label || ''}`}>
                    {label}
                    {isRequired && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}

            <div
                ref={selectRef}
                className="relative w-full"
            >
                {/* Hidden native select for form submission */}
                <select
                    ref={selectInputRef as React.RefObject<HTMLSelectElement>}
                    className="sr-only"
                    value={selectedValue}
                    onChange={onChange}
                    required={isRequired}
                    disabled={isDisabled}
                    aria-hidden="true"
                    {...rest}
                >
                    <option value="" disabled>{placeholder}</option>
                    {selectItems?.map((item: SelectItemProps) => (
                        <option key={item.key} value={item.value || item.key} disabled={item.isDisabled}>
                            {item.children?.toString()}
                        </option>
                    ))}
                </select>

                {/* Custom select trigger */}
                <button
                    type="button"
                    className={`
                        w-full ${sizeStyles.height} flex items-center justify-between
                        border transition-all duration-200 focus:outline-none
                        ${getVariantStyles()}
                        ${isOpen ? getColorStyles() + ' ring-2 ring-opacity-20' : ''}
                        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        ${variant !== 'underlined' ? 'rounded-lg' : ''}
                        ${classNames.trigger || ''}
                    `}
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    aria-haspopup="listbox"
                >
                    <div className="flex items-center flex-grow overflow-hidden">
                        {startContent && (
                            <div className="flex-shrink-0 ml-2 mr-2">
                                {startContent}
                            </div>
                        )}
                        <span className={`block truncate ${sizeStyles.text} ${sizeStyles.padding} ${selectedValue ? 'text-[color:var(--ai-foreground)]' : 'text-[color:var(--ai-muted)]'
                            }`}>
                            {selectedValue ? selectedLabel : placeholder}
                        </span>
                    </div>
                    <span className="flex-shrink-0 mr-2 transition-transform duration-200 text-[color:var(--ai-muted)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </button>

                {/* Dropdown menu */}
                <div
                    className={`
                        absolute z-10 w-full mt-1 overflow-auto bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)]
                        rounded-lg shadow-lg transition-all duration-200 max-h-60 scrollbar-thin
                        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 invisible translate-y-1'}
                        ${classNames.listboxWrapper || ''}
                    `}
                >
                    <ul
                        className={`py-1 ${classNames.listbox || ''}`}
                        role="listbox"
                        aria-labelledby={label ? `${label}-label` : undefined}
                        title={label || "Options"}
                        tabIndex={-1}
                    >
                        {selectItems?.length ? (
                            selectItems.map((item: SelectItemProps) => {
                                const isItemSelected = item.key === (selectedKeys[0] || selectedValue);

                                return (
                                    <li
                                        key={item.key}
                                        className={`
                                            ${sizeStyles.itemPadding} ${sizeStyles.text} cursor-pointer
                                            flex items-center transition-colors duration-150
                                            ${isItemSelected
                                                ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                                                : 'hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]'
                                            }
                                            ${item.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                            ${item.className || ''}
                                            ${classNames.item || ''}
                                        `}
                                        role="option"
                                        aria-selected={isItemSelected ? 'true' : 'false'}
                                        onClick={() => !item.isDisabled && handleSelect(item.key, item.value || item.key, item.children)}
                                    >
                                        {item.startContent && (
                                            <span className="mr-2 flex-shrink-0">
                                                {item.startContent}
                                            </span>
                                        )}
                                        <div className="flex flex-col flex-grow">
                                            <span>{item.children}</span>
                                            {item.description && (
                                                <span className="text-[color:var(--ai-muted)] text-xs mt-0.5">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                        {item.endContent && (
                                            <span className="ml-auto flex-shrink-0">
                                                {item.endContent}
                                            </span>
                                        )}
                                        {isItemSelected && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-[color:var(--ai-primary)]" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li role="presentation" className={`${sizeStyles.itemPadding} ${sizeStyles.text} text-[color:var(--ai-muted)] text-center`}>
                                No options available
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {errorMessage && isInvalid && (
                <p className={`mt-1 text-xs text-red-500 ${classNames.errorMessage || ''}`}>
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

Select.displayName = 'Select';

export default Select;
