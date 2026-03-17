'use client';

import { TaskStats } from '@/types';
import { CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: TaskStats | null;
  isLoading: boolean;
  onFilter?: (status: string) => void;
}

export function StatsCards({ stats, isLoading, onFilter }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: ListTodo,
      color: 'text-primary',
      bg: 'bg-primary/10',
      filter: '',
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: Circle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      filter: 'PENDING',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      filter: 'IN_PROGRESS',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      filter: 'COMPLETED',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, filter }, i) => (
        <button
          key={label}
          onClick={() => onFilter?.(filter)}
          className={cn(
            'bg-card border border-border rounded-2xl p-4 lg:p-5 text-left transition-all duration-200',
            'hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 active:translate-y-0',
            `animate-fade-in stagger-${i + 1}`,
            isLoading && 'animate-pulse'
          )}
        >
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
            <Icon className={cn('w-4 h-4', color)} />
          </div>
          <div className={cn('text-2xl font-bold mb-0.5', isLoading ? 'text-muted' : 'text-foreground')}
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {isLoading ? '—' : value}
          </div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
        </button>
      ))}
    </div>
  );
}
