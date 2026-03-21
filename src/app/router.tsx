import { createBrowserRouter } from 'react-router-dom';

import { Wrapper } from '@/components/Wrapper';

import { HomePage } from '../pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Wrapper />, // общая обёртка с меню
    children: [
      { index: true, element: <HomePage /> },
      // { path: 'todos', element: <TodosPage /> },
    ],
  },
]);
