import { Navigate, useLocation } from 'react-router';

import { useAuth } from '../hooks/useAuth';
import ROUTES from '../utils/routes';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  //@TODO !user
  if (user) {
    return <Navigate to={ROUTES.SIGN_IN} state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
