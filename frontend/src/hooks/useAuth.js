import { useContext } from 'react';

import { AuthActionsContext, UserContext } from '../hoc/AuthProvider';

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = () => {
  const user = useUser();
  const actions = useAuthActions();
  return { ...user, ...actions };
};
