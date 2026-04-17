'use client';

import React from 'react';
import { Input } from '@heroui/react';
import { FiSearch } from '@/components/icons/FeatherIcons';

interface Props {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Filters / selects rendered inline */
  filters?: React.ReactNode;
  /** Right-aligned actions (eg. add button, export) */
  actions?: React.ReactNode;
  /** Selection bar shown when items are selected */
  selectionCount?: number;
  selectionActions?: React.ReactNode;
  onClearSelection?: () => void;
  className?: string;
}

const DataToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  actions,
  selectionCount = 0,
  selectionActions,
  onClearSelection,
  className = '',
}) => {
  const hasSelection = selectionCount > 0;
  return (
    <div className={['flex flex-col gap-3', className].join(' ')}>
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {onSearchChange && (
          <div className="md:max-w-xs flex-1">
            <Input
              size="sm"
              variant="flat"
              radius="lg"
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={onSearchChange}
              startContent={<FiSearch size={16} className="text-[color:var(--ai-muted)]" />}
              classNames={{
                inputWrapper:
                  'bg-[color:var(--ai-card-bg)]/70 border border-[color:var(--ai-card-border)] data-[hover=true]:border-[color:var(--ai-primary)]/40',
              }}
            />
          </div>
        )}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        {actions && <div className="flex items-center gap-2 md:ml-auto">{actions}</div>}
      </div>

      {hasSelection && (
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl border border-[color:var(--ai-primary)]/30 bg-[color:var(--ai-primary)]/8">
          <span className="text-xs font-medium text-[color:var(--ai-primary)]">
            {selectionCount} selected
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {selectionActions}
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-xs text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataToolbar;
