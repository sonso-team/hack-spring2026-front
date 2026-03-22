import { api } from '@/shared/axios.config';
import type { AdminFull } from '@/shared/types';

export const getAdmins = async (): Promise<AdminFull[]> => {
  const { data } = await api.get<AdminFull[]>('/admin/admins');
  return data;
};

export const createAdmin = async (body: {
  first_name: string;
  last_name: string;
  position: string;
  email: string;
  password: string;
}): Promise<AdminFull> => {
  const { data } = await api.post<AdminFull>('/admin/admins', body);
  return data;
};

export const deleteAdmin = async (id: string): Promise<void> => {
  await api.delete(`/admin/admins/${id}`);
};
