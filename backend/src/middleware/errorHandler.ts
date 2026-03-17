import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err);

  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };

  res.status(500).json(response);
}

export function notFound(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  };
  res.status(404).json(response);
}
