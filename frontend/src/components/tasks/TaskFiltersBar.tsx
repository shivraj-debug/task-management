'use client';

import { useCallback, useState } from 'react';
import { TaskFilters, TaskStatus, Priority } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onUpdate: (f: Partial<TaskFilters>) => void;
}

const selectCls =
  'bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer';

export function TaskFiltersBar({ filters, onUpdate }: TaskFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '');

  // Debounce search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      const timeout = setTimeout(() => {
        onUpdate({ search: value || undefined, page: 1 });
      }, 350);
      return () => clearTimeout(timeout);
    },
    [onUpdate]
  );

  const hasActiveFilters =
    filters.status || filters.priority || filters.search || filters.sortBy !== 'createdAt';

  const clearAll = () => {
    setSearchValue('');
    onUpdate({ status: undefined, priority: undefined, search: undefined, sortBy: 'createdAt', sortOrder: 'desc', page: 1 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search tasks…"
          className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        {searchValue && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filters.status ?? ''}
          onChange={(e) => onUpdate({ status: (e.target.value as TaskStatus) || undefined, page: 1 })}
          className={selectCls}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={filters.priority ?? ''}
          onChange={(e) => onUpdate({ priority: (e.target.value as Priority) || undefined, page: 1 })}
          className={selectCls}
        >
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={`${filters.sortBy ?? 'createdAt'}:${filters.sortOrder ?? 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':') as [TaskFilters['sortBy'], TaskFilters['sortOrder']];
            onUpdate({ sortBy, sortOrder, page: 1 });
          }}
          className={selectCls}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date (soonest)</option>
          <option value="dueDate:desc">Due date (latest)</option>
          <option value="title:asc">Title A–Z</option>
          <option value="title:desc">Title Z–A</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl',
              'text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-all'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
