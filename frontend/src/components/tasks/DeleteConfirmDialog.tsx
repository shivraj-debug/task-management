'use client';

import { Trash2 } from 'lucide-react';

interface DeleteConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  taskTitle?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onConfirm,
  onCancel,
  taskTitle,
  isDeleting,
}: DeleteConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <h2
          className="text-lg font-bold text-foreground text-center mb-2"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Delete task?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {taskTitle ? (
            <>
              <span className="font-medium text-foreground">&ldquo;{taskTitle}&rdquo;</span> will be
              permanently deleted.
            </>
          ) : (
            'This task will be permanently deleted.'
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all border border-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-sm font-semibold bg-destructive hover:bg-destructive/90 disabled:opacity-60 text-destructive-foreground rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
