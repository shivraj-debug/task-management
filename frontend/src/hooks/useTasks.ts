'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, PaginatedTasks, TaskStats, TaskFilters, CreateTaskData, UpdateTaskData } from '@/types';
import {
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  toggleTaskApi,
  getTaskStatsApi,
} from '@/lib/tasks-api';
import { toast } from 'sonner';

const DEFAULT_FILTERS: TaskFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useTasks(initialFilters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginatedTasks['pagination'] | null>(null);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({ ...DEFAULT_FILTERS, ...initialFilters });

  const fetchTasks = useCallback(async (f: TaskFilters) => {
    setIsLoading(true);
    try {
      const result = await getTasksApi(f);
      setTasks(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load tasks';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const s = await getTaskStatsApi();
      setStats(s);
    } catch {
      // silent
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  }, []);

  const createTask = useCallback(
    async (data: CreateTaskData): Promise<Task> => {
      const task = await createTaskApi(data);
      toast.success('Task created successfully');
      await Promise.all([fetchTasks(filters), fetchStats()]);
      return task;
    },
    [filters, fetchTasks, fetchStats]
  );

  const updateTask = useCallback(
    async (id: string, data: UpdateTaskData): Promise<Task> => {
      const task = await updateTaskApi(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      toast.success('Task updated successfully');
      fetchStats();
      return task;
    },
    [fetchStats]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted');
      fetchStats();
      // If last item on page, go back one page
      if (tasks.length === 1 && filters.page && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page! - 1 }));
      } else {
        fetchTasks(filters);
      }
    },
    [tasks.length, filters, fetchTasks, fetchStats]
  );

  const toggleTask = useCallback(
    async (id: string): Promise<void> => {
      const task = await toggleTaskApi(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      fetchStats();
    },
    [fetchStats]
  );

  const refresh = useCallback(() => {
    fetchTasks(filters);
    fetchStats();
  }, [filters, fetchTasks, fetchStats]);

  return {
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
  };
}
