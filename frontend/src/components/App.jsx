/* eslint-disable no-unused-vars */
import { lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import RussianMapPage from '../pages/RussianMapPage';
import GoBackProvider from '../utils/GoBackProvider';
import ROUTES from '../utils/routes';
import './App.css';

const OneRegionMapPage = lazy(() => import('../pages/OneRegionMapPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const App = () => {
  return (
    <Routes>
      {/* <Route path={ROUTES.SIGN_UP} element={<SignUpForm />} />
      <Route path={ROUTES.SIGN_IN} element={<SignInForm />} /> */}

      <Route path={ROUTES.HOME} element={<RussianMapPage />} />
      <Route path={ROUTES.REGIONS} element={<RussianMapPage />} />
      <Route
        path={ROUTES.REGION_ONE}
        element={
          <GoBackProvider>
            <OneRegionMapPage />
          </GoBackProvider>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;

// /* eslint-disable no-unused-vars */
// import OneRegionMapPage from '../pages/OneRegionMapPage';
// import RussianMapPage from '../pages/RussianMapPage';
// import './App.css';

// const App = () => {
//   return <RussianMapPage />;
// };

// export default App;
