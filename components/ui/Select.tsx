'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface SelectItemProps {
    /**
     * The key for the item (used for selection)
     */
    itemKey: string;

    /**
     * The value for the item
     */
    value?: string;

    /**
     * The content to display in the item
     */
    children: React.ReactNode;

    /**
     * Content to display at the start of the item
     */
    startContent?: React.ReactNode;

    /**
     * Content to display at the end of the item
     */
    endContent?: React.ReactNode;

    /**
     * Description for the item
     */
    description?: string;

    /**
     * CSS class to apply to the item
     */
    className?: string;

    /**
     * Whether the item is disabled
     */
    isDisabled?: boolean;
}

export const SelectItem = (_props: SelectItemProps) => {
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
    } = props; const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [selectedLabel, setSelectedLabel] = useState<React.ReactNode>(''); const [dropdownPlacement, setDropdownPlacement] = useState<'bottom' | 'top'>('bottom');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLSelectElement>(null);
    const selectInputRef = ref || internalRef;// Calculate dropdown placement (above or below the select)
    const updateDropdownPlacement = () => {
        if (selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const spaceBelow = windowHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Update position for portal rendering
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });

            // If there's not enough space below and more space above, place dropdown above
            if (spaceBelow < 100 && spaceAbove > spaceBelow) {
                setDropdownPlacement('top');
            } else {
                setDropdownPlacement('bottom');
            }
        }
    };

    // Update placement when dropdown is opened
    useEffect(() => {
        if (isOpen) {
            updateDropdownPlacement();
            window.addEventListener('resize', updateDropdownPlacement);
            window.addEventListener('scroll', updateDropdownPlacement, true);
        }

        return () => {
            window.removeEventListener('resize', updateDropdownPlacement);
            window.removeEventListener('scroll', updateDropdownPlacement, true);
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only run when dropdown is open
            if (!isOpen) return;

            const target = event.target as Node;

            // Close if the click is outside both the select component and the dropdown
            if (selectRef.current && !selectRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Initialize selected value from selectedKeys or value prop
    useEffect(() => {
        if (selectedKeys && selectedKeys.length > 0) {
            const selectedKey = selectedKeys[0];

            // Find the corresponding child to get its text content
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) &&
                    child.type === SelectItem) {
                    const props = child.props as SelectItemProps;
                    if (props.itemKey === selectedKey) {
                        setSelectedValue(props.value || props.itemKey || "");
                        setSelectedLabel(props.children);
                    }
                }
            });
        } else if (value) {
            setSelectedValue(value);

            // Find the child with matching value to get its text content
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) &&
                    child.type === SelectItem) {
                    const props = child.props as SelectItemProps;
                    if (props.value === value || props.itemKey === value) {
                        setSelectedLabel(props.children);
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

    const handleSelect = (itemKey: string, itemValue: string, itemLabel: React.ReactNode, keepOpen: boolean = false) => {
        // Immediately update local state for UI responsiveness
        setSelectedValue(itemValue);
        setSelectedLabel(itemLabel);

        // Only close the dropdown if keepOpen is false
        if (!keepOpen) {
            setIsOpen(false);
        }

        // Create a properly structured event for React's synthetic event system
        if (onChange && typeof onChange === 'function') {
            // Create a mock input element to use as the target
            const fakeInput = document.createElement('select');

            // Set the value property
            Object.defineProperty(fakeInput, 'value', {
                value: itemValue,
                writable: true
            });

            // Create a synthetic change event that React components expect
            const syntheticEvent = {
                target: fakeInput,
                currentTarget: fakeInput,
                type: 'change',
                bubbles: true,
                cancelable: true,
                preventDefault: () => { },
                stopPropagation: () => { },
                // Add additional React-specific properties
                isPropagationStopped: () => false,
                isDefaultPrevented: () => false,
                nativeEvent: new Event('change'),
                persist: () => { },
            } as unknown as React.ChangeEvent<HTMLSelectElement>;

            // Call the onChange handler with our synthetic event
            onChange(syntheticEvent);
        }

        // Call onSelectionChange if provided (alternative API)
        if (onSelectionChange) {
            onSelectionChange(itemKey);
        }

        // Update the underlying native select element for form submission
        const inputRef = selectInputRef as React.RefObject<HTMLSelectElement>;
        if (inputRef && inputRef.current) {
            inputRef.current.value = itemValue;

            // Dispatch a native change event to ensure form validation works
            const changeEvent = new Event('change', { bubbles: true });
            inputRef.current.dispatchEvent(changeEvent);
        }
    };

    // Extract SelectItem children and process them correctly
    const selectItems: SelectItemProps[] = [];

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
            // Get the JSX key and use it as itemKey if not explicitly provided
            const key = child.key != null ? String(child.key).replace(/^\.\$/, '') : undefined;
            const props = child.props as SelectItemProps;

            // Make a copy of props to avoid modifying the original
            const itemProps: SelectItemProps = {
                ...props,
                itemKey: props.itemKey || key || String(Math.random()),
                value: props.value || props.itemKey || key || ''
            };

            selectItems.push(itemProps);
        }
    });

    // State to track keyboard navigation
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Handle keyboard navigation with improved scrolling
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    // Mark this as keyboard navigation
                    isKeyboardNavigationRef.current = true;
                    setFocusedIndex(prev => {
                        const nextIndex = prev < selectItems.length - 1 ? prev + 1 : 0;

                        // Schedule the auto-selection in next tick to avoid render-phase update
                        setTimeout(() => {
                            const focusedElement = dropdownRef.current?.querySelector(`[data-index="${nextIndex}"]`);
                            if (focusedElement) {
                                focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                                // Set focus on the element for better accessibility
                                (focusedElement as HTMLElement).focus({ preventScroll: true });

                                // Select the item
                                const item = selectItems[nextIndex];
                                if (!item.isDisabled) {
                                    handleSelect(item.itemKey, item.value || item.itemKey, item.children, true);
                                }
                            }
                        }, 0);

                        return nextIndex;
                    });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    // Mark this as keyboard navigation
                    isKeyboardNavigationRef.current = true;
                    setFocusedIndex(prev => {
                        const prevIndex = prev > 0 ? prev - 1 : selectItems.length - 1;

                        // Schedule the auto-selection in next tick to avoid render-phase update
                        setTimeout(() => {
                            const focusedElement = dropdownRef.current?.querySelector(`[data-index="${prevIndex}"]`);
                            if (focusedElement) {
                                focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                                // Set focus on the element for better accessibility
                                (focusedElement as HTMLElement).focus({ preventScroll: true });

                                // Select the item
                                const item = selectItems[prevIndex];
                                if (!item.isDisabled) {
                                    handleSelect(item.itemKey, item.value || item.itemKey, item.children, true);
                                }
                            }
                        }, 0);

                        return prevIndex;
                    });
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex >= 0 && focusedIndex < selectItems.length) {
                        const item = selectItems[focusedIndex];
                        if (!item.isDisabled) {
                            // Pass true to keep the dropdown open when selecting with keyboard
                            handleSelect(item.itemKey, item.value || item.itemKey, item.children, true);

                            // Keep dropdown focused for continued navigation
                            setTimeout(() => {
                                const focusedElement = dropdownRef.current?.querySelector(`[data-index="${focusedIndex}"]`);
                                if (focusedElement) {
                                    (focusedElement as HTMLElement).focus({ preventScroll: true });
                                }
                            }, 10);
                        }
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    break;
                case 'Tab':
                    setIsOpen(false);
                    break;
                case 'Home':
                    e.preventDefault();
                    if (selectItems.length > 0) {
                        setFocusedIndex(0);
                        const focusedElement = dropdownRef.current?.querySelector(`[data-index="0"]`);
                        if (focusedElement) {
                            focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                        }
                    }
                    break;
                case 'End':
                    e.preventDefault();
                    if (selectItems.length > 0) {
                        const lastIndex = selectItems.length - 1;
                        setFocusedIndex(lastIndex);
                        const focusedElement = dropdownRef.current?.querySelector(`[data-index="${lastIndex}"]`);
                        if (focusedElement) {
                            focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                        }
                    }
                    break;
            }
        };

        // Use capture phase to ensure our keyboard handler runs first
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, [isOpen, focusedIndex, selectItems]);

    // Reset focused index when dropdown opens/closes
    useEffect(() => {
        if (isOpen) {
            // Set focus to selected item if available
            const selectedIndex = selectItems.findIndex(item =>
                item.itemKey === (selectedKeys[0] || selectedValue)
            );
            setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
            setFocusedIndex(-1);
        }
    }, [isOpen, selectedKeys, selectedValue, selectItems]);

    // Keep track of previous focused index without auto-selecting on hover
    const prevFocusedIndexRef = useRef<number>(-1);

    // Add a ref to track keyboard navigation vs mouse hover
    const isKeyboardNavigationRef = useRef<boolean>(false);

    // Add a handler for keyboard arrow key navigation
    const handleKeyboardNavigation = (key: 'ArrowUp' | 'ArrowDown') => {
        isKeyboardNavigationRef.current = true;
    };

    // Create dropdown component with portal for proper z-index stacking
    const renderDropdown = () => {
        if (!isOpen) return null;

        const dropdownContent = (
            <div
                id="select-dropdown"
                ref={dropdownRef}
                style={{
                    position: 'absolute',
                    top: dropdownPlacement === 'top'
                        ? `${dropdownPosition.top - (dropdownRef.current?.offsetHeight || 0) - 4}px`
                        : `${dropdownPosition.top + 4}px`,
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                    zIndex: 99999,
                }}
                className={`
                    ${dropdownPlacement === 'top' ? 'origin-bottom' : 'origin-top'}
                    overflow-auto bg-[color:var(--ai-card-bg)] 
                    border border-[color:var(--ai-card-border)] rounded-lg shadow-xl 
                    animate-in fade-in-0 zoom-in-95 max-h-60
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
                    {selectItems.length ? (
                        selectItems.map((item, index) => {
                            const isItemSelected = item.itemKey === (selectedKeys[0] || selectedValue);
                            const isFocused = index === focusedIndex;

                            return (

                                <li
                                    key={item.itemKey}
                                    data-index={index}
                                    className={`
                                        ${sizeStyles.itemPadding} ${sizeStyles.text} cursor-pointer
                                        flex items-center transition-colors duration-150
                                        ${isItemSelected
                                            ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                                            : isFocused
                                                ? 'bg-[color:var(--ai-primary)]/5 text-[color:var(--ai-foreground)] outline-none ring-1 ring-[color:var(--ai-primary)]/30'
                                                : 'hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]'
                                        }
                                        ${item.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                        ${item.className || ''}
                                        ${classNames.item || ''}
                                    `}
                                    role="option"
                                    aria-selected={isItemSelected ? 'true' : 'false'}
                                    tabIndex={isFocused ? 0 : -1}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!item.isDisabled) {
                                            // For mouse clicks, close the dropdown after selection (keepOpen = false)
                                            handleSelect(item.itemKey, item.value || item.itemKey, item.children, false);
                                        }
                                    }}
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
        );

        // Use portal to render dropdown at document root for proper z-index stacking
        if (typeof window !== 'undefined') {
            return createPortal(dropdownContent, document.body);
        }

        return null;
    };

    return (
        <div className={`relative w-full ${className}`}>
            {label && (
                <label className={`block mb-1.5 text-sm font-medium ${isDisabled ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'
                    } ${classNames.label || ''}`}>
                    {label}
                    {isRequired && <span className="ml-1 text-[color:var(--ai-danger)]">*</span>}
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
                    {...(onChange
                        ? { value: selectedValue, onChange }
                        : { defaultValue: selectedValue }
                    )}
                    required={isRequired}
                    disabled={isDisabled}
                    aria-hidden="true"
                    {...rest}
                >
                    <option value="" disabled>{placeholder}</option>
                    {selectItems.map((item) => (
                        <option key={item.itemKey} value={item.value || item.itemKey} disabled={item.isDisabled}>
                            {item.children?.toString()}
                        </option>
                    ))}
                </select>

                {/* Custom select trigger */}
                {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
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

                {/* Render dropdown directly in the component */}
                {renderDropdown()}
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

Select.displayName = 'Select';

export default Select;

