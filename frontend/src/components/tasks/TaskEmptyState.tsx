'use client';

import { ClipboardList, Plus } from 'lucide-react';

interface TaskEmptyStateProps {
  hasFilters: boolean;
  onCreateTask: () => void;
}

export function TaskEmptyState({ hasFilters, onCreateTask }: TaskEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <ClipboardList className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3
        className="text-lg font-bold text-foreground mb-2"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {hasFilters ? 'No matching tasks' : 'No tasks yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {hasFilters
          ? 'Try adjusting your filters or search to find what you are looking for.'
          : 'Create your first task to get started tracking your work.'}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreateTask}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New task
        </button>
      )}
    </div>
  );
}
