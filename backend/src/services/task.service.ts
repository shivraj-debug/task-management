import { TaskStatus, Priority } from '@prisma/client';
import prisma from '../utils/prisma';
import { CreateTaskInput, UpdateTaskInput, TaskQueryParams, PaginatedResponse } from '../types';

export async function getTasks(
  userId: string,
  params: TaskQueryParams
): Promise<PaginatedResponse<object>> {
  const page = Math.max(1, parseInt(params.page || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')));
  const skip = (page - 1) * limit;

  const where: {
    userId: string;
    status?: TaskStatus;
    priority?: Priority;
    title?: { contains: string; mode: 'insensitive' };
  } = { userId };

  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.search) {
    where.title = { contains: params.search, mode: 'insensitive' };
  }

  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getTaskById(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status || 'PENDING',
      priority: input.priority || 'MEDIUM',
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      userId,
    },
  });

  return task;
}

export async function updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
    },
  });

  return task;
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  await prisma.task.delete({ where: { id: taskId } });
}

export async function toggleTaskStatus(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: 'PENDING',
  };

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: nextStatus[task.status] },
  });

  return updatedTask;
}

export async function getTaskStats(userId: string) {
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'PENDING' } }),
    prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
  ]);

  return { total, pending, inProgress, completed };
}
