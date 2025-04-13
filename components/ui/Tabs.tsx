'use client';

import React, { forwardRef } from 'react';
import { Tabs as HeroTabs, Tab as HeroTab } from '@heroui/react';
import type { TabsProps as HeroTabsProps, TabProps as HeroTabProps } from '@heroui/react';

export interface TabsProps extends HeroTabsProps {
    /**
     * Additional CSS classes to apply
     */
    className?: string;

    /**
     * Class names for different parts of the tabs
     */
    classNames?: {
        base?: string;
        tabList?: string;
        tab?: string;
        tabContent?: string;
    };

    /**
     * Tab content
     */
    children?: React.ReactNode;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * A set of layered sections of content that display one panel at a time
 */
const Tabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
    const {
        children,
        className = '',
        classNames = {},
        ...rest
    } = props;

    const defaultClassNames = {
        base: "w-full",
        tabList: "px-0 border-b border-[color:var(--ai-card-border)] gap-4 overflow-x-auto",
        tab: "px-0 h-10 data-[selected=true]:text-[color:var(--ai-primary)] data-[selected=true]:border-b-2 data-[selected=true]:border-[color:var(--ai-primary)] font-medium",
        tabContent: "py-4",
    };

    // Merge default classNames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        tabList: `${defaultClassNames.tabList} ${classNames.tabList || ''}`,
        tab: `${defaultClassNames.tab} ${classNames.tab || ''}`,
        tabContent: `${defaultClassNames.tabContent} ${classNames.tabContent || ''}`,
    };

    return (
        <HeroTabs
            ref={ref}
            className={`text-[color:var(--ai-foreground)] ${className}`}
            classNames={mergedClassNames}
            {...rest}
        >
            {children}
        </HeroTabs>
    );
});

Tabs.displayName = 'Tabs';

export default Tabs;

export interface TabProps extends HeroTabProps {
    className?: string;
    title?: React.ReactNode;
    key?: string;
}

/**
 * A single tab item within a Tabs component
 */
export const Tab = forwardRef<HTMLDivElement, TabProps>((props, ref) => {
    const { className = '', title, ...rest } = props;

    return (
        <HeroTab
            ref={ref}
            className={className}
            title={title}
            {...rest}
        />
    );
});

Tab.displayName = 'Tab';
 */
export const Tab = forwardRef<HTMLDivElement, TabProps>((props, ref) => {
    const {
        className = '',
        ...rest
    } = props;

    return (
        <HeroTab
            // Remove explicit ref forwarding since HeroTab doesn't accept it
            className={className}
            {...rest}
        />
    );
});

Tab.displayName = 'Tab';
