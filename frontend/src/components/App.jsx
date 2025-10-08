/* eslint-disable no-unused-vars */
import { Suspense, lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import Layout from '../components/Layout';
import { AuthProvider } from '../hoc/AuthProvider';
import RequireAuth from '../hoc/RequireAuth';
import RussianMapPage from '../pages/RussianMapPage';
import ROUTES from '../utils/routes';
import './App.css';
import SignInForm from './SignInForm/SignInForm';
import SignUpForm from './SignUpForm/SignUpForm';

const OneRegionMapPage = lazy(() => import('../pages/OneRegionMapPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path={ROUTES.SIGN_IN}
          element={
            <Suspense fallback={<div>Загрузка...</div>}>
              <SignInForm />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.SIGN_UP}
          element={
            <Suspense fallback={<div>Загрузка...</div>}>
              <SignUpForm />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route
            path={ROUTES.HOME}
            element={
              <Suspense fallback={<div>Загрузка...</div>}>
                <RussianMapPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.REGIONS}
            element={
              <Suspense fallback={<div>Загрузка...</div>}>
                <RequireAuth>
                  <RussianMapPage />
                </RequireAuth>
              </Suspense>
            }
          />
          <Route
            path={ROUTES.REGION_ONE}
            element={
              <Suspense fallback={<div>Загрузка...</div>}>
                <RequireAuth>
                  <OneRegionMapPage />
                </RequireAuth>
              </Suspense>
            }
          />

          <Route
            path="*"
            element={
              <Suspense fallback={<div>Загрузка...</div>}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
