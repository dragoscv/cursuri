'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DataTableAlign = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Render the cell value for a row. */
  cell: (row: T, rowIndex: number) => React.ReactNode;
  /** Optional click-to-sort accessor. Provide a comparable value. */
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
  align?: DataTableAlign;
  width?: string; // CSS width value, e.g. '120px' or '20%'
  className?: string;
  headerClassName?: string;
  /** Hide on smaller breakpoints; uses Tailwind responsive prefix like 'md' (showed at md and up). */
  responsiveFrom?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Stable key per row. */
  rowKey: (row: T, index: number) => string;
  /** Optional row click handler — gives the row a hover/cursor affordance. */
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
  /** Make header sticky inside a scrollable parent. */
  stickyHeader?: boolean;
  /** Default sort. */
  initialSort?: { key: string; direction: 'asc' | 'desc' };
}

const alignClass: Record<DataTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const responsiveHide: Record<NonNullable<DataTableColumn<unknown>['responsiveFrom']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  isLoading,
  loadingRows = 5,
  emptyState,
  caption,
  className = '',
  stickyHeader = false,
  initialSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    initialSort ?? null
  );

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortAccessor) return data;
    const accessor = col.sortAccessor;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [data, sort, columns]);

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortAccessor) return;
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: col.key, direction: 'desc' };
      return null;
    });
  };

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)]',
        'bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl shadow-sm',
        className,
      ].join(' ')}
    >
      {caption && (
        <div className="px-5 py-3 border-b border-[color:var(--ai-card-border)]/60 text-sm text-[color:var(--ai-muted)]">
          {caption}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead
            className={[
              stickyHeader ? 'sticky top-0 z-10' : '',
              'bg-[color:var(--ai-background)]/80 backdrop-blur-sm',
            ].join(' ')}
          >
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const sortable = !!col.sortAccessor;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      'px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-semibold',
                      'text-[color:var(--ai-muted)] border-b border-[color:var(--ai-card-border)]',
                      alignClass[col.align ?? 'left'],
                      col.responsiveFrom ? responsiveHide[col.responsiveFrom] : '',
                      sortable ? 'cursor-pointer select-none hover:text-[color:var(--ai-foreground)]' : '',
                      col.headerClassName ?? '',
                    ].join(' ')}
                    onClick={sortable ? () => toggleSort(col) : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {sortable && (
                        <span
                          className={[
                            'inline-flex flex-col leading-none',
                            isSorted ? 'text-[color:var(--ai-primary)]' : 'opacity-40',
                          ].join(' ')}
                          aria-hidden
                        >
                          <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor">
                            <path
                              d="M4 0L8 5H0z"
                              opacity={!isSorted || sort?.direction === 'asc' ? 1 : 0.3}
                            />
                          </svg>
                          <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className="mt-0.5">
                            <path
                              d="M4 5L0 0h8z"
                              opacity={!isSorted || sort?.direction === 'desc' ? 1 : 0.3}
                            />
                          </svg>
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-[color:var(--ai-card-border)]/40">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        'px-4 py-3',
                        col.responsiveFrom ? responsiveHide[col.responsiveFrom] : '',
                      ].join(' ')}
                    >
                      <span className="block h-3.5 rounded bg-[color:var(--ai-card-border)]/60 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14">
                  {emptyState ?? (
                    <div className="text-center text-sm text-[color:var(--ai-muted)]">
                      No items to display
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {sorted.map((row, rowIndex) => {
                  const key = rowKey(row, rowIndex);
                  return (
                    <motion.tr
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, delay: Math.min(rowIndex * 0.015, 0.12) }}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={[
                        'group border-b border-[color:var(--ai-card-border)]/40 last:border-b-0',
                        'transition-colors hover:bg-[color:var(--ai-primary)]/[0.04]',
                        onRowClick ? 'cursor-pointer' : '',
                      ].join(' ')}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={[
                            'px-4 py-3 align-middle text-[color:var(--ai-foreground)]',
                            alignClass[col.align ?? 'left'],
                            col.responsiveFrom ? responsiveHide[col.responsiveFrom] : '',
                            col.className ?? '',
                          ].join(' ')}
                        >
                          {col.cell(row, rowIndex)}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
