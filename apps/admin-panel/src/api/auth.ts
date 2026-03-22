import { api } from '@/shared/axios.config';
import type { Admin } from '@/shared/types';

interface LoginResponse {
  token: string;
  admin: Admin;
}

export const loginRequest = (email: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data);
