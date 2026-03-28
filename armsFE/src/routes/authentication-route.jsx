import { lazy } from "react";

const AuthPage = lazy(() => import('views/auth/login'));

const AuthenticationRoutes = {
    path: '/',
    children: [
        {
            path: '/',
            element: <AuthPage />
        }
    ]
}
export default AuthenticationRoutes;