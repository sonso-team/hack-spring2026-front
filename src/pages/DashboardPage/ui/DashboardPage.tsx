import { Link } from 'react-router';

import { useAuthStore } from '@/store/authStore';

import './DashboardPage.scss';

const BgIconLightning = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const BgIconChart = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M7 16V12M12 16V8M17 16V4" />
  </svg>
);

const BgIconShield = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const DashboardPage = () => {
  const admin = useAuthStore((s) => s.admin);
  const isSuperadmin = admin?.role === 'superadmin';

  return (
    <div className="dashboard">
      <div className={`dashboard__grid${isSuperadmin ? '' : ' dashboard__grid--two'}`}>
        <Link to="/lobby/create" className="dashboard__card dashboard__card--main">
          <div className="dashboard__bg-icon" aria-hidden="true">
            <BgIconLightning />
          </div>
          <div className="dashboard__card-body">
            <h2 className="dashboard__card-title">Создать мероприятие</h2>
            <p className="dashboard__card-desc">
              Запустите новое лобби, сгенерируйте QR-код и принимайте участников на стенде в
              реальном времени
            </p>
          </div>
        </Link>

        <Link
          to="/lobby"
          className={`dashboard__card dashboard__card--sm${!isSuperadmin ? ' dashboard__card--sm-full' : ''}`}
        >
          <div className="dashboard__bg-icon" aria-hidden="true">
            <BgIconChart />
          </div>
          <div className="dashboard__sm-body">
            <span className="dashboard__card-title dashboard__card-title--sm">Отчёт</span>
            <p className="dashboard__card-desc">Результаты последнего мероприятия</p>
          </div>
        </Link>

        {isSuperadmin && (
          <Link to="/admins" className="dashboard__card dashboard__card--sm">
            <div className="dashboard__bg-icon" aria-hidden="true">
              <BgIconShield />
            </div>
            <div className="dashboard__sm-body">
              <span className="dashboard__card-title dashboard__card-title--sm">
                Администрирование
              </span>
              <p className="dashboard__card-desc">Управление доступами</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
