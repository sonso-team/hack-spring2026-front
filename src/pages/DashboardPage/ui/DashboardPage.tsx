import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { getLobby } from '@/api/lobby';
import { useAuthStore } from '@/store/authStore';

import './DashboardPage.scss';

export const DashboardPage = () => {
  const admin = useAuthStore((s) => s.admin);
  const isSuperadmin = admin?.role === 'superadmin';

  const { data: lobby } = useQuery({
    queryKey: ['lobby'],
    queryFn: getLobby,
    staleTime: 30_000,
  });

  const createDisabled = !!lobby && lobby.status === 'active';

  return (
    <div className="dashboard">
      <div className={`dashboard__grid${isSuperadmin ? '' : ' dashboard__grid--two'}`}>
        {createDisabled ? (
          <div className="dashboard__card dashboard__card--main dashboard__card--disabled">
            <img
              className="dashboard__bg-icon"
              src="/assets/lightning.png"
              alt=""
              aria-hidden="true"
            />
            <div className="dashboard__card-body">
              <h2 className="dashboard__card-title">Создать мероприятие</h2>
              <p className="dashboard__card-desc">Сначала закройте текущее мероприятие</p>
            </div>
          </div>
        ) : (
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
        )}

        {lobby ? (
          <Link
            to="/lobby"
            className={`dashboard__card dashboard__card--sm${!isSuperadmin ? ' dashboard__card--sm-full' : ''}`}
          >
            <img className="dashboard__bg-icon" src="/assets/stats.png" alt="" aria-hidden="true" />
            <div className="dashboard__sm-body">
              <span className="dashboard__card-title dashboard__card-title--sm">
                Текущее мероприятие
              </span>
              <p className="dashboard__card-desc">Управление, QR‑код и результаты</p>
            </div>
          </Link>
        ) : (
          <div
            className={`dashboard__card dashboard__card--sm dashboard__card--disabled${!isSuperadmin ? ' dashboard__card--sm-full' : ''}`}
          >
            <img className="dashboard__bg-icon" src="/assets/stats.png" alt="" aria-hidden="true" />
            <div className="dashboard__sm-body">
              <span className="dashboard__card-title dashboard__card-title--sm">
                Текущее мероприятие
              </span>
              <p className="dashboard__card-desc">Нет активного мероприятия</p>
            </div>
          </div>
        )}

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
