/* eslint-disable no-unused-vars */
import { Suspense, lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import Layout from '../components/Layout';
import RussianMapPage from '../pages/RussianMapPage';
import ROUTES from '../utils/routes';
import './App.css';

const OneRegionMapPage = lazy(() => import('../pages/OneRegionMapPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const App = () => {
  return (
    <Routes>
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
              <RussianMapPage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.REGION_ONE}
          element={
            <Suspense fallback={<div>Загрузка...</div>}>
              <OneRegionMapPage />
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
  );
};

export default App;
