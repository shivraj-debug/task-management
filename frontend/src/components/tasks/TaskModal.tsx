'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, CreateTaskData, UpdateTaskData } from '@/types';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  task?: Task | null;
  isSubmitting?: boolean;
}

const selectCls = 'w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all';
const inputCls = 'w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all';

export function TaskModal({ open, onClose, onSubmit, task, isSubmitting }: TaskModalProps) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      });
    } else {
      reset({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
    }
  }, [task, reset, open]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
            {isEditing ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 overflow-y-auto"
        >
          <div className="px-6 py-5 space-y-4 flex-1">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Title <span className="text-destructive">*</span>
              </label>
              <input {...register('title')} placeholder="What needs to be done?" className={inputCls} autoFocus />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                placeholder="Add more details…"
                rows={3}
                className={cn(inputCls, 'resize-none')}
              />
            </div>

            {/* Status + Priority row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <select {...register('status')} className={selectCls}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                <select {...register('priority')} className={selectCls}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Due date <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input {...register('dueDate')} type="date" className={inputCls} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              )}
              {isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
