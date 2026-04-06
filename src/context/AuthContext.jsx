import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiLogin, apiSignUp } from '../utils/api.js';

const TOKEN_KEY = 'potense_admin_token';
const USER_KEY = 'potense_admin_user';
const ACCESS_TOKEN_KEY = 'potense_admin_access_token';
const USER_ID_KEY = 'potense_admin_user_id';

// ─── State shape ────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true while we rehydrate from localStorage
};

// ─── Reducer ────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'LOADING_DONE':
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

// ─── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const persistSession = useCallback((user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, user?.id || '');
  }, []);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (token && user) {
        dispatch({ type: 'RESTORE_SESSION', payload: { token, user } });
      } else {
        dispatch({ type: 'LOADING_DONE' });
      }
    } catch {
      dispatch({ type: 'LOADING_DONE' });
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { user, token } = await apiLogin({ email, password });
    persistSession(user, token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return user;
  }, [persistSession]);

  const signUp = useCallback(async ({ fullName, email, phone, password, confirmPassword }) => {
    const { user, token } = await apiSignUp({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    });
    persistSession(user, token);
    dispatch({ type: 'SIGNUP_SUCCESS', payload: { user, token } });
    return user;
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;
