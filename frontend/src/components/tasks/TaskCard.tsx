'use client';

import { Task, TaskStatus, Priority } from '@/types';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING: { label: 'Pending', icon: Circle, className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, className: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Low', className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  MEDIUM: { label: 'Medium', className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  HIGH: { label: 'High', className: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400' },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
}

export function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(task.id);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch {
      toast.error('Failed to delete task');
      setIsDeleting(false);
    }
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'COMPLETED' &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-2xl p-5 transition-all duration-200',
        'hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5',
        isDeleting && 'opacity-50 pointer-events-none',
        task.status === 'COMPLETED' && 'opacity-75'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Toggle button */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-95"
            title="Toggle status"
          >
            {isToggling ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : task.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : task.status === 'IN_PROGRESS' ? (
              <ArrowUpCircle className="w-5 h-5 text-blue-500" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>

          {/* Title */}
          <h3
            className={cn(
              'text-sm font-semibold text-foreground leading-snug',
              task.status === 'COMPLETED' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>
        </div>

        {/* Kebab menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-popover border border-border rounded-xl shadow-lg py-1 min-w-[140px] animate-fade-in">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(task); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  Edit task
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 ml-8">
          {task.description}
        </p>
      )}

      {/* Footer badges */}
      <div className="flex items-center gap-2 flex-wrap ml-8">
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', status.className)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', priority.className)}>
          {priority.label}
        </span>
        {task.dueDate && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
              isOverdue
                ? 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 font-medium'
                : 'text-muted-foreground bg-muted'
            )}
          >
            <CalendarDays className="w-3 h-3" />
            {isOverdue ? 'Overdue · ' : ''}
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}
