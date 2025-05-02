/**
 * Cursuri - TypeScript declarations for @heroui/react package
 * This file provides proper typings to make HeroUI components work with TypeScript
 */

import React from 'react';

// Define types for HeroUI Select components
declare module '@heroui/react' {
    // Base interfaces for SelectItem component
    export interface SelectItemProps {
        children?: React.ReactNode;
        key?: string;
        value: string; // This is the property that causes TypeScript issues
        textValue: string;
        className?: string;
        isDisabled?: boolean;
        isReadOnly?: boolean;
    }

    // Define SelectItem component with proper props
    export const SelectItem: React.FC<SelectItemProps>;

    // Extend Table-related components to accept proper children
    export interface TableHeaderProps<T> {
        children?: React.ReactNode;
    }

    export interface TableRowProps<T> {
        children?: React.ReactNode;
    }

    export interface TableBodyProps<T> {
        children?: React.ReactNode;
    }

    export interface TableColumnProps<T> {
        children?: React.ReactNode;
    }

    export interface TableCellProps {
        children?: React.ReactNode;
    }
}

// Define these extra types so our component wrappers can have proper typing
export type ColumnElement<T = any> = React.ReactElement<any> | null | undefined | boolean;
export type CellElement = React.ReactElement<any> | null | undefined | boolean;
