import { Link } from 'react-router';

import { useAuthStore } from '@/store/authStore';

import './DashboardPage.scss';

export const DashboardPage = () => {
  const admin = useAuthStore((s) => s.admin);
  const isSuperadmin = admin?.role === 'superadmin';

  return (
    <div className="dashboard">
      <div className={`dashboard__grid${isSuperadmin ? '' : ' dashboard__grid--two'}`}>
        <Link to="/lobby/create" className="dashboard__card dashboard__card--main">
          <img
            className="dashboard__bg-icon"
            src="/assets/lightning.png"
            alt=""
            aria-hidden="true"
          />
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
          <img className="dashboard__bg-icon" src="/assets/stats.png" alt="" aria-hidden="true" />
          <div className="dashboard__sm-body">
            <span className="dashboard__card-title dashboard__card-title--sm">Отчёт</span>
            <p className="dashboard__card-desc">Результаты последнего мероприятия</p>
          </div>
        </Link>

        {isSuperadmin && (
          <Link to="/admins" className="dashboard__card dashboard__card--sm">
            <img
              className="dashboard__bg-icon"
              src="/assets/shield.png"
              alt=""
              aria-hidden="true"
            />
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
