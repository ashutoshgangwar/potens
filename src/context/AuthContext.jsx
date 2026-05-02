import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiLogin, apiSignUp, apiLogout, apiOnboard, apiGetAuthProfile } from '../utils/api.js';

const TOKEN_KEY = 'POTENS_admin_token';
const USER_KEY = 'POTENS_admin_user';
const ACCESS_TOKEN_KEY = 'POTENS_admin_access_token';
const USER_ID_KEY = 'POTENS_admin_user_id';
const USER_ROLE_KEY = 'POTENS_admin_user_role';

const normalizeRoleValue = (roleValue) => {
  if (!roleValue) {
    return '';
  }

  if (typeof roleValue === 'string') {
    return roleValue.trim();
  }

  if (typeof roleValue === 'object') {
    return (
      roleValue.name ||
      roleValue.code ||
      roleValue.slug ||
      roleValue.display_name ||
      roleValue.label ||
      roleValue._id ||
      roleValue.id ||
      ''
    )
      .toString()
      .trim();
  }

  return `${roleValue}`.trim();
};

// Derive simple capability flags from a user's role/roles for UI decisions
const deriveRoleCapabilities = (roleOrRoles) => {
  const roles = [];
  if (!roleOrRoles) return {};
  if (Array.isArray(roleOrRoles)) {
    for (const r of roleOrRoles) {
      if (r) roles.push(String(r).toLowerCase());
    }
  } else if (typeof roleOrRoles === 'string') {
    roles.push(roleOrRoles.toLowerCase());
  } else if (typeof roleOrRoles === 'object') {
    const maybe = roleOrRoles.name || roleOrRoles.slug || roleOrRoles.code || roleOrRoles.label;
    if (maybe) roles.push(String(maybe).toLowerCase());
  }

  const has = (candidates) => roles.some((r) => candidates.includes(r));

  const capability = {
    isAdmin: has(['admin', 'super-admin', 'sub-admin']),
    isManager: has(['logistics-manager', 'ops-manager']),
    isAccount: has(['account-executive', 'accountant']),
    isField: has(['field-officer', 'fdp', 'bowser', 'mini-pump']),
    // generic approval permission for managers and admins
    canApprove: has(['logistics-manager', 'ops-manager', 'admin', 'super-admin', 'sub-admin']),
    // show wallet/payment-related UI
    showWallet: has(['account-executive', 'accountant', 'admin', 'super-admin']),
  };

  return capability;
};

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

  const persistSession = useCallback((user, token, roleFromAuthResponse) => {
    const normalizedRole = normalizeRoleValue(roleFromAuthResponse || user?.role);
    const normalizedUser = normalizedRole
      ? { ...user, role: normalizedRole }
      : user;

    // Attach derived capability flags so UI can quickly read them
    const capabilities = deriveRoleCapabilities(normalizedUser?.roles || normalizedUser?.role);
    const userToStore = { ...normalizedUser, ...capabilities };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, userToStore?.id || '');
    localStorage.setItem(USER_ROLE_KEY, normalizedRole);
  }, []);

  const clearSessionStorage = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
  }, []);

  const fetchAndPersistProfile = useCallback(async ({ token, fallbackUser }) => {
    const profileUser = await apiGetAuthProfile(token);
    const normalizedRole = normalizeRoleValue(profileUser?.role || fallbackUser?.role);
    const mergedUser = normalizedRole
      ? { ...fallbackUser, ...profileUser, role: normalizedRole }
      : { ...fallbackUser, ...profileUser };

    // derive capabilities and persist augmented user
    const capabilities = deriveRoleCapabilities(mergedUser?.roles || mergedUser?.role);
    const userToStore = { ...mergedUser, ...capabilities };

    persistSession(userToStore, token, normalizedRole);
    return userToStore;
  }, [persistSession]);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const token =
          localStorage.getItem(ACCESS_TOKEN_KEY) ||
          localStorage.getItem(TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        const storedRole = normalizeRoleValue(localStorage.getItem(USER_ROLE_KEY));
        const hydratedUser = user
          ? {
              ...user,
              role: normalizeRoleValue(user?.role) || storedRole || '',
            }
          : null;

        if (!token) {
          if (mounted) dispatch({ type: 'LOADING_DONE' });
          return;
        }

        let restoredUser = hydratedUser;

        try {
          restoredUser = await fetchAndPersistProfile({ token, fallbackUser: hydratedUser || {} });
        } catch {
          if (!hydratedUser) {
            clearSessionStorage();
            if (mounted) dispatch({ type: 'LOADING_DONE' });
            return;
          }
        }

        if (mounted) {
          dispatch({ type: 'RESTORE_SESSION', payload: { token, user: restoredUser } });
        }
      } catch {
        if (mounted) dispatch({ type: 'LOADING_DONE' });
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearSessionStorage, fetchAndPersistProfile]);

  const login = useCallback(async ({ email, phone, password }) => {
    const { user, token } = await apiLogin({ email, phone, password });
    const normalizedRole = normalizeRoleValue(user?.role);
    const userWithRole = normalizedRole ? { ...user, role: normalizedRole } : user;
    // attach capabilities from the login response
    const initialCapabilities = deriveRoleCapabilities(userWithRole?.roles || userWithRole?.role);
    const userWithCapabilities = { ...userWithRole, ...initialCapabilities };

    let profileUser = userWithCapabilities;
    try {
      profileUser = await fetchAndPersistProfile({ token, fallbackUser: userWithRole });
    } catch {
      persistSession(userWithCapabilities, token, normalizedRole);
    }

    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: profileUser, token } });
    return profileUser;
  }, [fetchAndPersistProfile, persistSession]);

  const signUp = useCallback(async ({ fullName, email, phone, password, confirmPassword, role = 'driver' }) => {
    const { user, token } = await apiSignUp({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      role,
    });
    const normalizedRole = normalizeRoleValue(user?.role || role);
    const userWithRole = normalizedRole ? { ...user, role: normalizedRole } : user;
    const initialCapabilities = deriveRoleCapabilities(userWithRole?.roles || userWithRole?.role);
    const userWithCapabilities = { ...userWithRole, ...initialCapabilities };
    // Signup now returns an access token; persist it for immediate onboarding calls.
    if (token) {
      try {
        const profileUser = await fetchAndPersistProfile({ token, fallbackUser: userWithCapabilities });
        dispatch({ type: 'SIGNUP_SUCCESS', payload: { user: profileUser, token } });
        return profileUser;
      } catch {
        persistSession(userWithCapabilities, token, normalizedRole);
      }
    } else {
      const capabilities = deriveRoleCapabilities(userWithRole?.roles || userWithRole?.role);
      localStorage.setItem(USER_KEY, JSON.stringify({ ...userWithRole, ...capabilities }));
      localStorage.setItem(USER_ID_KEY, userWithRole?.id || '');
      localStorage.setItem(USER_ROLE_KEY, normalizedRole);
    }
    dispatch({ type: 'SIGNUP_SUCCESS', payload: { user: userWithCapabilities, token: token || null } });
    return userWithCapabilities;
  }, [fetchAndPersistProfile, persistSession]);

  const logout = useCallback(async () => {
    const token =
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(TOKEN_KEY);
    // Call server logout (fire and forget — clear local state regardless)
    if (token) {
      await apiLogout(token).catch(() => {});
    }
    clearSessionStorage();
    dispatch({ type: 'LOGOUT' });
  }, [clearSessionStorage]);

  const onboard = useCallback(async ({ payload, professional, address, documents, vehicle, payment } = {}) => {
    const token =
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(TOKEN_KEY) ||
      state.token;
    if (!token) throw new Error('Not authorized.');
    const result = await apiOnboard({ token, payload, professional, address, documents, vehicle, payment });
    // Update stored user with latest data from server
    const updatedUser = result.user || {};
    const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null') || {};
    const mergedUser = { ...currentUser, ...updatedUser, is_onboarded: result.is_onboarded };
    localStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mergedUser, token } });
    return result;
  }, [state.token]);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    signUp,
    logout,
    onboard,
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
