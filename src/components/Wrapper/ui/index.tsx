import { Link, Outlet, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

import './wrapper.scss';

export const Wrapper = () => {
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__logo">
          <img src="/assets/logo.svg" alt="DDoS-Guard" className="layout__logo-img" />
        </Link>

        <div className="layout__actions">
          {admin && (
            <span className="layout__admin-name">
              {admin.first_name} {admin.last_name}
            </span>
          )}
          <Button variant="outline" onClick={handleLogout}>
            Выход
          </Button>
        </div>
      </header>

      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
};
