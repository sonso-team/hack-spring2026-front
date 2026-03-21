import { Navigate, Outlet } from 'react-router';

import { useAuthStore } from '@/store/authStore';

export const PublicRoute = () => {
  const token = useAuthStore((s) => s.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
