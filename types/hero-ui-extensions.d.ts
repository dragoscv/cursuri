// Extended types for HeroUI components to correctly handle conditional rendering
import {
    TableHeaderProps,
    TableColumnProps,
    TableRowProps,
    TableProps,
    TableBodyProps,
    TableCellProps
} from '@heroui/react';
import React, { ReactElement, ReactNode } from 'react';

// Correct typing for conditional elements in HeroUI tables
declare module '@heroui/react' {
    interface TableHeaderProps<T> {
        children?: React.ReactNode;
    }

    interface TableBodyProps<T> {
        children?: React.ReactNode;
    }

    interface TableRowProps<T> {
        children?: React.ReactNode;
    }
}

// Utility types for our wrapper components
export type ColumnElement<T = any> = ReactElement<TableColumnProps<T>> | null | undefined | boolean;
export type CellElement = ReactElement<TableCellProps> | null | undefined | boolean;
