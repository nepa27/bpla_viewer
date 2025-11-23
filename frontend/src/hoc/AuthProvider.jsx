import { createContext, useCallback, useMemo, useState } from 'react';

import {
  useFaceLoginMutation,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
} from '../helpers/queries';

export const UserContext = createContext(null);
export const AuthActionsContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const { mutate: signupMutate, isPending: isSignupPending } = useSignupMutation();
  const { mutate: loginMutate, isPending: isLoginPending } = useLoginMutation();
  const { mutate: faceLoginMutate, isPending: isFaceLoginPending } = useFaceLoginMutation();
  const { mutate: logoutMutate, isPending: isLogoutPending } = useLogoutMutation();

  const auth = useCallback(
    async (userData) => {
      try {
        const response = await new Promise((resolve, reject) => {
          signupMutate(userData, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error),
          });
        });

        return response;
      } catch (error) {
        setUser(null);
        throw error;
      }
    },
    [signupMutate],
  );

  const signIn = useCallback(
    async (authData) => {
      try {
        let response;
        if (authData.face_descriptor) {
          response = await new Promise((resolve, reject) => {
            faceLoginMutate(
              { face_descriptor: authData.face_descriptor },
              {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
              },
            );
          });
        } else {
          response = await new Promise((resolve, reject) => {
            loginMutate(authData, {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            });
          });
        }

        return response;
      } catch (error) {
        setUser(null);
        throw error;
      }
    },
    [loginMutate, faceLoginMutate],
  );

  const signOut = useCallback(
    async (cb) => {
      await new Promise((resolve, reject) => {
        logoutMutate(undefined, {
          onSuccess: () => {
            setUser(null);
            resolve();
          },
          onError: (error) => reject(error),
        });
      });
      cb?.();
    },
    [logoutMutate],
  );

  const userValue = useMemo(() => ({ user }), [user]);

  const actionsValue = useMemo(
    () => ({
      auth,
      signIn,
      signOut,
      isSignupPending,
      isLoginPending,
      isFaceLoginPending,
      isLogoutPending,
    }),
    [auth, signIn, signOut, isSignupPending, isLoginPending, isFaceLoginPending, isLogoutPending],
  );

  return (
    <UserContext.Provider value={userValue}>
      <AuthActionsContext.Provider value={actionsValue}>{children}</AuthActionsContext.Provider>
    </UserContext.Provider>
  );
};
