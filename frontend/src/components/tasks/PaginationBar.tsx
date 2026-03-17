'use client';

import { Pagination } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationBarProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ pagination, onPageChange }: PaginationBarProps) {
  const { page, totalPages, total, limit, hasPrevPage, hasNextPage } = pagination;

  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Build page numbers
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const btnCls = (active?: boolean, disabled?: boolean) =>
    cn(
      'flex items-center justify-center w-8 h-8 text-sm rounded-lg transition-all font-medium',
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      disabled && 'opacity-40 pointer-events-none'
    );

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-muted-foreground">
        {from}–{to} of {total} task{total !== 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-1">
        <button className={btnCls(false, !hasPrevPage)} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              className={btnCls(p === page)}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
          )
        )}

        <button className={btnCls(false, !hasNextPage)} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
