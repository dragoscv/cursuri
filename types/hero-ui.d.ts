/**
 * Type definitions for @heroui/react package
 * This file provides proper typings for HeroUI components to work with TypeScript
 */

import React from 'react';

// Define module augmentations for @heroui/react
declare module '@heroui/react' {
    // SelectItem Component
    export interface SelectItemProps {
        key?: string;
        value: string;
        textValue: string;
        className?: string;
        children?: React.ReactNode;
        isDisabled?: boolean;
        isReadOnly?: boolean;
    }

    // Define the SelectItem component with the proper props
    export const SelectItem: React.FC<SelectItemProps>;

    // Table Components - add React.ReactNode support
    export interface TableHeaderProps<T> {
        children: React.ReactNode;
    }

    export interface TableRowProps<T> {
        children: React.ReactNode;
    }

    export interface TableBodyProps<T> {
        children: React.ReactNode;
    }

    export interface TableProps {
        children: React.ReactNode;
    }

    export interface TableColumnProps<T> {
        children?: React.ReactNode;
    }

    export interface TableCellProps {
        children?: React.ReactNode;
    }
}

// Helper types for Table components
export type ColumnElement = React.ReactElement | null | undefined | boolean;
export type CellElement = React.ReactElement | null | undefined | boolean;
