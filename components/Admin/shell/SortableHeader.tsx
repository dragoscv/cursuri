'use client';

import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortableHeaderProps {
    /** Column id this header sorts by. */
    sortKey: string;
    /** Current active sort key (across the table). */
    activeKey: string | null;
    /** Current direction when this column is the active key. */
    direction: SortDirection;
    /** Called when the user clicks the header. Receives the next direction. */
    onSort: (key: string, direction: SortDirection) => void;
    /** Header label. */
    children: React.ReactNode;
    /** Optional class names for the underlying <th>. */
    className?: string;
    /** Right-align the label and arrow. */
    align?: 'left' | 'right' | 'center';
    /** Tooltip / aria-label override. */
    title?: string;
}

/**
 * Tri-state sortable column header (asc → desc → none → asc).
 * Renders an arrow icon that reflects the current direction.
 */
export const SortableHeader: React.FC<SortableHeaderProps> = ({
    sortKey,
    activeKey,
    direction,
    onSort,
    children,
    className = '',
    align = 'left',
    title,
}) => {
    const isActive = activeKey === sortKey && direction !== null;
    const handleClick = () => {
        if (!isActive) {
            onSort(sortKey, 'asc');
            return;
        }
        if (direction === 'asc') onSort(sortKey, 'desc');
        else if (direction === 'desc') onSort(sortKey, null);
        else onSort(sortKey, 'asc');
    };
    const ariaSort: React.AriaAttributes['aria-sort'] = !isActive
        ? 'none'
        : direction === 'asc'
            ? 'ascending'
            : direction === 'desc'
                ? 'descending'
                : 'none';
    const justify =
        align === 'right'
            ? 'justify-end'
            : align === 'center'
                ? 'justify-center'
                : 'justify-start';
    return (
        <th
            scope="col"
            aria-sort={ariaSort}
            className={['px-4 py-3 font-semibold select-none', className].join(' ')}
        >
            <button
                type="button"
                onClick={handleClick}
                title={title || `Sort by ${typeof children === 'string' ? children : sortKey}`}
                className={[
                    'inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider w-full',
                    justify,
                    'transition-colors',
                    isActive
                        ? 'text-[color:var(--ai-primary)]'
                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]',
                ].join(' ')}
            >
                <span className="truncate">{children}</span>
                <span
                    className={[
                        'inline-flex flex-col text-[8px] leading-none transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-40',
                    ].join(' ')}
                    aria-hidden="true"
                >
                    <svg
                        width="9"
                        height="6"
                        viewBox="0 0 9 6"
                        fill="none"
                        className={[
                            isActive && direction === 'asc'
                                ? 'text-[color:var(--ai-primary)]'
                                : 'text-current',
                        ].join(' ')}
                    >
                        <path
                            d="M4.5 0L9 6H0L4.5 0Z"
                            fill="currentColor"
                            opacity={isActive && direction === 'asc' ? 1 : 0.6}
                        />
                    </svg>
                    <svg
                        width="9"
                        height="6"
                        viewBox="0 0 9 6"
                        fill="none"
                        className={[
                            'mt-0.5',
                            isActive && direction === 'desc'
                                ? 'text-[color:var(--ai-primary)]'
                                : 'text-current',
                        ].join(' ')}
                    >
                        <path
                            d="M4.5 6L0 0H9L4.5 6Z"
                            fill="currentColor"
                            opacity={isActive && direction === 'desc' ? 1 : 0.6}
                        />
                    </svg>
                </span>
            </button>
        </th>
    );
};

export default SortableHeader;
