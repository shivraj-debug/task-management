'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Task, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types';
import { StatsCards } from '@/components/tasks/StatsCards';
import { TaskFiltersBar } from '@/components/tasks/TaskFiltersBar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { DeleteConfirmDialog } from '@/components/tasks/DeleteConfirmDialog';
import { PaginationBar } from '@/components/tasks/PaginationBar';
import { TaskEmptyState } from '@/components/tasks/TaskEmptyState';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    tasks,
    pagination,
    stats,
    isLoading,
    isStatsLoading,
    filters,
    updateFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refresh,
  } = useTasks();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleModalSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data as CreateTaskData);
      }
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatFilter = (status: string) => {
    updateFilters({ status: (status as TaskStatus) || undefined });
  };

  const hasActiveFilters = !!(filters.status || filters.priority || filters.search);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's on your plate today.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refresh}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-sm shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} isLoading={isStatsLoading} onFilter={handleStatFilter} />

      {/* Filters */}
      <TaskFiltersBar filters={filters} onUpdate={updateFilters} />

      {/* Task list */}
      <div>
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-card border border-border rounded-2xl animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <TaskEmptyState
            hasFilters={hasActiveFilters}
            onCreateTask={openCreateModal}
          />
        ) : (
          <div className="grid gap-3">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <TaskCard
                  task={task}
                  onEdit={openEditModal}
                  onDelete={(id) => {
                    const t = tasks.find((t) => t.id === id);
                    setDeleteTarget(t ?? null);
                    return Promise.resolve();
                  }}
                  onToggle={toggleTask}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <PaginationBar
            pagination={pagination}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        open={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        task={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        taskTitle={deleteTarget?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}
