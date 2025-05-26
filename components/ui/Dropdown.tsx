'use client';

import React, { forwardRef } from 'react';
import {
    Dropdown as HeroDropdown, DropdownProps as HeroDropdownProps,
    DropdownTrigger as HeroDropdownTrigger,
    DropdownMenu as HeroDropdownMenu,
    DropdownItem as HeroDropdownItem,
    DropdownSection as HeroDropdownSection
} from '@heroui/react';

export interface DropdownProps extends Omit<HeroDropdownProps, 'children'> {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * The content of the dropdown
     */
    children?: React.ReactNode;

    /**
     * Class names for different parts of the dropdown
     */
    classNames?: {
        base?: string;
        trigger?: string;
        menu?: string;
        arrow?: string;
        content?: string;
        backdrop?: string;
    };
}

/**
 * A dropdown menu for displaying lists of links and actions
 */
const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const {
        children,
        className = '',
        classNames = {},
        placement = 'bottom',
        ...rest
    } = props;

    // Default theme-specific class names
    const defaultClassNames = {
        base: "z-40",
        menu: "bg-[color:var(--ai-card-bg)] backdrop-blur-md border border-[color:var(--ai-card-border)]/50 shadow-md",
        arrow: "bg-[color:var(--ai-card-bg)]",
        backdrop: "backdrop-blur-sm bg-black/20"
    };

    // Merge default class names with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        menu: `${defaultClassNames.menu} ${classNames.menu || ''}`,
        arrow: `${defaultClassNames.arrow} ${classNames.arrow || ''}`,
        backdrop: `${defaultClassNames.backdrop} ${classNames.backdrop || ''}`,
        content: classNames.content,
        trigger: classNames.trigger
    };

    return (
        <HeroDropdown
            ref={ref}
            className={className}
            classNames={mergedClassNames}
            placement={placement}
            {...rest}
        >
            {/* Wrap children in React Fragment to handle HeroUI's expectation of multiple children */}
            {React.Children.toArray(children)}
        </HeroDropdown>
    );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;

/**
 * The trigger element that toggles the dropdown
 */
export interface DropdownTriggerProps {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * The content of the trigger
     */
    children?: React.ReactNode;
}

export const DropdownTrigger = forwardRef<HTMLDivElement, DropdownTriggerProps>((props, ref) => {
    const {
        children,
        className = '',
        ...rest
    } = props;

    return (
        <HeroDropdownTrigger
            className={className}
            {...rest}
        >
            {children}
        </HeroDropdownTrigger>
    );
});

DropdownTrigger.displayName = 'DropdownTrigger';

/**
 * The menu that contains dropdown items
 */
export interface DropdownMenuProps {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * The content of the menu
     */
    children?: React.ReactNode;

    /**
     * Accessibility label for the menu
     */
    'aria-label'?: string;

    /**
     * Class names object for styling different parts
     */
    classNames?: {
        base?: string;
        list?: string;
    };

    /**
     * Item rendering variants
     */
    variant?: 'flat' | 'faded' | 'solid' | 'bordered';
}

export const DropdownMenu = forwardRef<HTMLUListElement, DropdownMenuProps>((props, ref) => {
    const {
        children,
        className = '',
        variant = 'flat',
        classNames = {},
        ...rest
    } = props;

    // Default class names for menu items
    const defaultClassNames = {
        base: "p-1 gap-0.5",
        list: "outline-none"
    };

    // Merge with provided class names
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        list: `${defaultClassNames.list} ${classNames.list || ''}`
    };

    return (
        <HeroDropdownMenu
            className={className}
            variant={variant}
            classNames={mergedClassNames}
            {...rest}        >
            {children as any}
        </HeroDropdownMenu>
    );
});

DropdownMenu.displayName = 'DropdownMenu';

/**
 * Individual item within a dropdown menu
 */
export interface DropdownItemProps {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * The content of the item
     */
    children?: React.ReactNode;

    /**
     * A unique key for the item
     */
    key?: string;

    /**
     * Whether the item is currently selected
     */
    isSelected?: boolean;

    /**
     * Whether the item is disabled
     */
    isDisabled?: boolean;

    /**
     * Click handler for the item
     */
    onPress?: () => void;

    /**
     * Text value for accessibility
     */
    textValue?: string;

    /**
     * Color variant of the item
     */
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
}

export const DropdownItem = forwardRef<HTMLLIElement, DropdownItemProps>((props, ref) => {
    const {
        children,
        className = '',
        isSelected = false,
        isDisabled = false,
        color = 'default',
        onPress,
        textValue,
        ...rest
    } = props;

    // Color classes based on the color prop
    const getColorClass = () => {
        if (isDisabled) return 'text-[color:var(--ai-foreground)]/40';

        switch (color) {
            case 'primary':
                return 'data-[hover=true]:text-[color:var(--ai-primary)] data-[hover=true]:bg-[color:var(--ai-primary)]/10';
            case 'secondary':
                return 'data-[hover=true]:text-[color:var(--ai-secondary)] data-[hover=true]:bg-[color:var(--ai-secondary)]/10';
            case 'success':
                return 'data-[hover=true]:text-[color:var(--ai-success)] data-[hover=true]:bg-[color:var(--ai-success)]/10';
            case 'warning':
                return 'data-[hover=true]:text-[color:var(--ai-warning)] data-[hover=true]:bg-[color:var(--ai-warning)]/10';
            case 'danger':
                return 'data-[hover=true]:text-[color:var(--ai-danger)] data-[hover=true]:bg-[color:var(--ai-danger)]/10';
            default:
                return 'data-[hover=true]:bg-[color:var(--ai-card-border)]/40';
        }
    };    // Convert our props to what HeroDropdownItem expects
    const heroProps = {
        key: props.key,
        className: `text-[color:var(--ai-foreground)] rounded-md transition-colors ${getColorClass()} ${className}`,
        isDisabled: isDisabled,
        onPress: onPress,
        textValue: textValue,
        ...rest
    } as any; // Type assertion to work around HeroUI type compatibility

    return (
        <HeroDropdownItem {...heroProps}>
            {children}
        </HeroDropdownItem>
    );
});

DropdownItem.displayName = 'DropdownItem';

/**
 * Section to group dropdown items
 */
export interface DropdownSectionProps {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * The content of the section
     */
    children?: React.ReactNode;

    /**
     * Whether to show a divider after this section
     */
    showDivider?: boolean;

    /**
     * Accessibility label for the section
     */
    'aria-label'?: string;

    /**
     * Title of the section
     */
    title?: string;
}

export const DropdownSection = forwardRef<HTMLDivElement, DropdownSectionProps>((props, ref) => {
    const {
        children,
        className = '',
        showDivider = false,
        title,
        ...rest
    } = props;

    // Convert title to string if needed
    const titleString = title ? String(title) : undefined;

    return (
        <HeroDropdownSection
            className={className}
            showDivider={showDivider}
            title={titleString}
            {...rest}        >
            {children as any}
        </HeroDropdownSection>
    );
});

DropdownSection.displayName = 'DropdownSection';
