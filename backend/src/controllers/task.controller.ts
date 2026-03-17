import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import * as taskService from '../services/task.service';

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await taskService.getTasks(req.user!.userId, req.query as never);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
}

export async function getTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task';
    const status = message === 'Task not found' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await taskService.createTask(req.user!.userId, req.body);
    res.status(201).json({ success: true, message: 'Task created successfully', data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await taskService.updateTask(req.params.id, req.user!.userId, req.body);
    res.status(200).json({ success: true, message: 'Task updated successfully', data: { task } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    const status = message === 'Task not found' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    await taskService.deleteTask(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    const status = message === 'Task not found' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
}

export async function toggleTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await taskService.toggleTaskStatus(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, message: 'Task status updated', data: { task } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle task';
    const status = message === 'Task not found' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
}

export async function getTaskStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await taskService.getTaskStats(req.user!.userId);
    res.status(200).json({ success: true, data: { stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
}
