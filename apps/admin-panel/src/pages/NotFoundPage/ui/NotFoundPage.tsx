import { Link } from 'react-router';

import './NotFoundPage.scss';

export const NotFoundPage = () => (
  <div className="not-found">
    <p className="not-found__code">404</p>
    <h1 className="not-found__title">Страница в разработке</h1>
    <p className="not-found__desc">Этот раздел ещё не готов. Скоро появится.</p>
    <Link to="/" className="not-found__back">
      ← На главную
    </Link>
  </div>
);
