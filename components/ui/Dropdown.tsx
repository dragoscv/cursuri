'use client';

import React, { forwardRef } from 'react';
import {
    Dropdown as HeroDropdown,
    DropdownTrigger as HeroDropdownTrigger,
    DropdownMenu as HeroDropdownMenu,
    DropdownItem as HeroDropdownItem,
    DropdownSection as HeroDropdownSection,
    type DropdownProps as HeroDropdownProps,
    type DropdownMenuProps as HeroDropdownMenuProps,
    type DropdownItemProps as HeroDropdownItemProps,
    type DropdownSectionProps as HeroDropdownSectionProps
} from '@heroui/react';

export interface DropdownProps {
    /**
     * The content of the dropdown
     */
    children: React.ReactNode;

    /**
     * The placement of the dropdown menu
     */
    placement?: 'top' | 'bottom' | 'right' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

    /**
     * The offset of the dropdown menu
     */
    offset?: number;

    /**
     * The type of the dropdown trigger
     */
    type?: 'menu' | 'listbox';

    /**
     * Whether the dropdown is currently open
     */
    isOpen?: boolean;

    /**
     * The default open state
     */
    defaultOpen?: boolean;

    /**
     * Callback fired when the open state changes
     */
    onOpenChange?: (isOpen: boolean) => void;

    /**
     * Whether to show a backdrop
     */
    backdrop?: 'transparent' | 'blur' | 'opaque';

    /**
     * Whether to disable closing on blur
     */
    disableCloseOnBlur?: boolean;

    /**
     * Class names for different parts of the dropdown
     */
    classNames?: {
        base?: string;
        trigger?: string;
        backdrop?: string;
        menu?: string;
    };

    /**
     * Additional CSS class name
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

export interface DropdownMenuProps {
    /**
     * The content of the dropdown menu
     */
    children: React.ReactNode;

    /**
     * The variant of the dropdown menu
     */
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';

    /**
     * The color of the dropdown menu
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * ARIA label for the dropdown menu
     */
    'aria-label'?: string;

    /**
     * Whether to disable item selection animation
     */
    disableAnimation?: boolean;

    /**
     * Item class names
     */
    itemClasses?: {
        base?: string;
        description?: string;
        title?: string;
        icon?: string;
        shortcut?: string;
    };

    /**
     * Class names for different parts of the dropdown menu
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

export interface DropdownItemProps {
    /**
     * The content of the dropdown item
     */
    children?: React.ReactNode;

    /**
     * The key of the dropdown item
     */
    key?: React.Key;

    /**
     * The description for the dropdown item
     */
    description?: string;

    /**
     * The title for the dropdown item
     */
    title?: string;

    /**
     * The text value of the dropdown item
     */
    textValue?: string;

    /**
     * The start content for the dropdown item
     */
    startContent?: React.ReactNode;

    /**
     * The end content for the dropdown item
     */
    endContent?: React.ReactNode;

    /**
     * The shortcut text for the dropdown item
     */
    shortcut?: string;

    /**
     * The color of the dropdown item
     */
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

    /**
     * Whether the dropdown item has a divider
     */
    showDivider?: boolean;

    /**
     * Whether the dropdown item is disabled
     */
    isDisabled?: boolean;

    /**
     * Whether the dropdown item is read-only
     */
    isReadOnly?: boolean;

    /**
     * Whether the dropdown item is a dialog trigger
     */
    isDialogTrigger?: boolean;

    /**
     * Callback fired when the dropdown item is pressed
     */
    onPress?: () => void;

    /**
     * Additional CSS class name
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

export interface DropdownSectionProps {
    /**
     * The content of the dropdown section
     */
    children?: React.ReactNode;

    /**
     * Whether to show a divider after the section
     */
    showDivider?: boolean;

    /**
     * The title of the section
     */
    title?: string;

    /**
     * The ARIA label for the section
     */
    'aria-label'?: string;

    /**
     * Additional CSS class name
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * Dropdown component for creating dropdown menus
 */
const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const {
        children,
        placement = 'bottom',
        offset = 7,
        type = 'menu',
        isOpen,
        defaultOpen,
        onOpenChange,
        backdrop = 'transparent',
        disableCloseOnBlur = false,
        classNames = {},
        className = '',
        ...rest
    } = props;

    // Default theme-aligned styling
    const defaultClassNames = {
        base: "z-40",
        backdrop: backdrop === 'blur' ? "backdrop-blur-sm bg-black/10 dark:bg-black/30" : "",
        menu: "bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)]/70 shadow-lg",
    };

    // Merge default classnames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        trigger: classNames.trigger || '',
        backdrop: `${defaultClassNames.backdrop} ${classNames.backdrop || ''}`,
        menu: `${defaultClassNames.menu} ${classNames.menu || ''}`,
    };

    return (
        <HeroDropdown
            ref={ref}
            placement={placement as HeroDropdownProps['placement']}
            offset={offset}
            type={type as HeroDropdownProps['type']}
            isOpen={isOpen}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            backdrop={backdrop as HeroDropdownProps['backdrop']}
            disableCloseOnBlur={disableCloseOnBlur}
            classNames={mergedClassNames}
            className={className}
            {...rest}
        >
            {children}
        </HeroDropdown>
    );
});

/**
 * DropdownTrigger component for triggering the dropdown
 */
const DropdownTrigger = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroDropdownTrigger ref={ref} className={className} {...rest} />;
});

/**
 * DropdownMenu component for the dropdown content container
 */
const DropdownMenu = forwardRef<HTMLUListElement, DropdownMenuProps>((props, ref) => {
    const {
        children,
        variant = 'solid',
        color = 'default',
        'aria-label': ariaLabel,
        disableAnimation = false,
        itemClasses = {},
        className = '',
        ...rest
    } = props;

    // Default item classes with theming
    const defaultItemClasses = {
        base: "text-[color:var(--ai-foreground)] data-[hover=true]:bg-[color:var(--ai-primary)]/10 data-[hover=true]:text-[color:var(--ai-primary)]",
        title: "font-medium",
        description: "text-[color:var(--ai-muted)] text-xs",
    };

    // Merge default classes with user-provided ones
    const mergedItemClasses = {
        base: `${defaultItemClasses.base} ${itemClasses.base || ''}`,
        title: `${defaultItemClasses.title} ${itemClasses.title || ''}`,
        description: `${defaultItemClasses.description} ${itemClasses.description || ''}`,
        icon: itemClasses.icon || '',
        shortcut: itemClasses.shortcut || '',
    };

    return (
        <HeroDropdownMenu
            ref={ref}
            variant={variant as HeroDropdownMenuProps['variant']}
            color={color as HeroDropdownMenuProps['color']}
            aria-label={ariaLabel}
            disableAnimation={disableAnimation}
            itemClasses={mergedItemClasses}
            className={className}
            {...rest}
        >
            {children}
        </HeroDropdownMenu>
    );
});

/**
 * DropdownItem component for individual dropdown options
 */
const DropdownItem = forwardRef<HTMLLIElement, DropdownItemProps>((props, ref) => {
    const {
        children,
        key,
        description,
        title,
        textValue,
        startContent,
        endContent,
        shortcut,
        color = 'default',
        showDivider = false,
        isDisabled = false,
        isReadOnly = false,
        isDialogTrigger = false,
        onPress,
        className = '',
        ...rest
    } = props;

    return (
        <HeroDropdownItem
            ref={ref}
            key={key}
            description={description}
            title={title}
            textValue={textValue}
            startContent={startContent}
            endContent={endContent}
            shortcut={shortcut}
            color={color as HeroDropdownItemProps['color']}
            showDivider={showDivider}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isDialogTrigger={isDialogTrigger}
            onPress={onPress}
            className={className}
            {...rest}
        >
            {children}
        </HeroDropdownItem>
    );
});

/**
 * DropdownSection component for grouping dropdown items
 */
const DropdownSection = forwardRef<HTMLDivElement, DropdownSectionProps>((props, ref) => {
    const {
        children,
        showDivider = false,
        title,
        'aria-label': ariaLabel,
        className = '',
        ...rest
    } = props;

    return (
        <HeroDropdownSection
            ref={ref}
            showDivider={showDivider}
            title={title}
            aria-label={ariaLabel}
            className={className}
            {...rest}
        >
            {children}
        </HeroDropdownSection>
    );
});

Dropdown.displayName = 'Dropdown';
DropdownTrigger.displayName = 'DropdownTrigger';
DropdownMenu.displayName = 'DropdownMenu';
DropdownItem.displayName = 'DropdownItem';
DropdownSection.displayName = 'DropdownSection';

export { DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection };
export default Dropdown;
