import api from './api';
import { ApiResponse, User } from '@/types';

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>('/auth/register', data);
  return res.data.data!.user;
}

export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>('/auth/login', data);
  return res.data.data!.user;
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMeApi(): Promise<User> {
  const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return res.data.data!.user;
}