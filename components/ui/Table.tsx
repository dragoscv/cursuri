'use client'

import React, { ReactNode } from 'react';
import {
    Table as HUTable,
    TableHeader as HUTableHeader,
    TableColumn as HUTableColumn,
    TableBody as HUTableBody,
    TableRow as HUTableRow,
    TableCell as HUTableCell
} from '@heroui/react';

// Define custom prop types for our wrapper components
export interface CustomTableProps {
    children?: ReactNode;
    'aria-label'?: string;
    className?: string;
}

export interface CustomColumnProps {
    children?: ReactNode;
    key?: string;
    className?: string;
}

export interface CustomCellProps {
    children?: ReactNode;
    key?: string;
    className?: string;
    colSpan?: number;
}

// Create simple wrapper components that take standard React props
// and bypass the strict typing of the original components

/**
 * Custom Table component
 */
export const Table: React.FC<CustomTableProps> = (props) => {
    return <HUTable {...props as any} />;
};

/**
 * Custom TableHeader component
 */
export const TableHeader: React.FC<{ children?: ReactNode }> = ({ children }) => {
    return <HUTableHeader>{children as any}</HUTableHeader>;
};

/**
 * Custom TableColumn component
 */
export const TableColumn: React.FC<CustomColumnProps> = (props) => {
    return <HUTableColumn {...props as any} />;
};

/**
 * Custom TableBody component
 */
export const TableBody: React.FC<{ children?: ReactNode }> = ({ children }) => {
    return <HUTableBody>{children as any}</HUTableBody>;
};

/**
 * Custom TableRow component
 */
export const TableRow: React.FC<{ children?: ReactNode, key?: string }> = (props) => {
    return <HUTableRow {...props as any} />;
};

/**
 * Custom TableCell component
 */
export const TableCell: React.FC<CustomCellProps> = (props) => {
    return <HUTableCell {...props as any} />;
};
