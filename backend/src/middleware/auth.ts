import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest, ApiResponse } from '../types';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  // Support both cookie and Authorization header (for API clients)
  const cookieToken = req.cookies?.accessToken;
  // const headerToken = req.headers.authorization?.startsWith('Bearer ')
    // ? req.headers.authorization.split(' ')[1]
    // : null;

  const token = cookieToken 
  // || headerToken;

  if (!token) {
    const response: ApiResponse = {
      success: false,
      message: 'Access token is required',
    };
    res.status(401).json(response);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired access token',
    };
    res.status(401).json(response);
  }
}