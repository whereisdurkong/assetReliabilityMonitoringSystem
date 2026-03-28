import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
const AuthenticationRoutes = lazy(() => import('./authentication-route'));

// render - landing page
const AuthPage = lazy(() => import('../views/auth/login'));
// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    AuthenticationRoutes,
    {
      path: '/',
      element: <AuthPage />,
    },
    MainRoutes
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
