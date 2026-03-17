import api from './api';
import {
  ApiResponse,
  Task,
  PaginatedTasks,
  TaskStats,
  TaskFilters,
  CreateTaskData,
  UpdateTaskData,
} from '@/types';

export async function getTasksApi(filters: TaskFilters = {}): Promise<PaginatedTasks> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const res = await api.get<ApiResponse<PaginatedTasks>>(`/tasks?${params.toString()}`);
  return res.data.data!;
}

export async function getTaskApi(id: string): Promise<Task> {
  const res = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
  return res.data.data!.task;
}

export async function createTaskApi(data: CreateTaskData): Promise<Task> {
  const res = await api.post<ApiResponse<{ task: Task }>>('/tasks', data);
  return res.data.data!.task;
}

export async function updateTaskApi(id: string, data: UpdateTaskData): Promise<Task> {
  const res = await api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
  return res.data.data!.task;
}

export async function deleteTaskApi(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function toggleTaskApi(id: string): Promise<Task> {
  const res = await api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/toggle`);
  return res.data.data!.task;
}

export async function getTaskStatsApi(): Promise<TaskStats> {
  const res = await api.get<ApiResponse<{ stats: TaskStats }>>('/tasks/stats');
  return res.data.data!.stats;
}
