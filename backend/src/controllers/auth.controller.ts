import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import * as authService from '../services/auth.service';

const isProd = process.env.NODE_ENV === 'production';

function setTokenCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/auth/refresh',
  });
}

function clearTokenCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/auth/refresh' });
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const { user, tokens } = await authService.registerUser({ name, email, password });

    setTokenCookies(res, tokens);

    res.status(201).json({ success: true, message: 'Registration successful', data: { user } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const status = message === 'Email already in use' ? 409 : 500;
    res.status(status).json({ success: false, message });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.loginUser({ email, password });

    setTokenCookies(res, tokens);

    res.status(200).json({ success: true, message: 'Login successful', data: { user } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ success: false, message });
  }
}

export async function refresh(req: AuthRequest, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    const { tokens, user } = await authService.refreshTokens(refreshToken);

    setTokenCookies(res, tokens);

    res.status(200).json({ success: true, message: 'Tokens refreshed successfully', data: { user } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    clearTokenCookies(res);
    res.status(401).json({ success: false, message });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
}

export async function logoutAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    await authService.logoutAllSessions(req.user!.userId);
    res.status(200).json({ success: true, message: 'Logged out from all sessions' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.user!;
    const { prisma } = await import('../utils/prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
}