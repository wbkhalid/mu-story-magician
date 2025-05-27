'use client';

import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';
import { signUp, userLogin } from 'src/apis/authentication';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------
const initialState = {
  user: null,
  loading: true,
};
const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: null,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};
// ----------------------------------------------------------------------

// const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const user = accessToken ? localStorage.getItem('user') : null;

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);
  useEffect(() => {
    initialize();
  }, [initialize]);
  // LOGIN
  const login = useCallback(async (email, password) => {
    const data = {
      email,
      password,
    };

    const response = await userLogin(data);

    const { token, user } = response;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    setSession(token);

    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
          token,
        },
      },
    });
  }, []);
  // REGISTER
  const register = useCallback(async (email, password) => {
    const data = {
      email,
      password,
    };

    const response = await signUp(data);

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          user: null,
          // accessToken,
        },
      },
    });
  }, []);
  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);
  // ----------------------------------------------------------------------
  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;
  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );
  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
AuthProvider.propTypes = {
  children: PropTypes.node,
};
