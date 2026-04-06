const MOCK_USERS_KEY = 'potense_admin_users';
const MOCK_PROFILES_KEY = 'potense_admin_profiles';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.4:5001';

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveProfiles = (profiles) => {
  localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));
};

const normalizeAuthUser = (user = {}) => ({
  ...user,
  name: user.name || user.full_name || '',
});

const parseJsonSafely = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const syncMockUserForLogin = ({ user, email, password }) => {
  if (!user?.id || !email || !password) {
    return;
  }

  const users = getUsers();
  const remainingUsers = users.filter(
    (existingUser) => existingUser.email.toLowerCase() !== email.toLowerCase()
  );

  saveUsers([
    ...remainingUsers,
    {
      ...user,
      email,
      password,
      createdAt: user.createdAt || new Date().toISOString(),
    },
  ]);
};

/**
 * Sign up API call
 * @param {{ fullName: string, email: string, phone: string, password: string, confirmPassword: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export const apiSignUp = async ({ fullName, email, phone, password, confirmPassword }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: fullName,
      email,
      phone,
      password,
      confirm_password: confirmPassword,
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Sign up failed. Please try again.');
  }

  const user = normalizeAuthUser(data?.user);
  syncMockUserForLogin({ user, email, password });

  return {
    message: data?.message || 'User registered successfully.',
    token: data?.token,
    user,
  };
};

/**
 * Simulate login API call
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export const apiLogin = ({ email, password }) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );
      if (!found) {
        reject(new Error('Invalid email or password.'));
        return;
      }
      const { password: _pw, ...user } = found;
      const token = btoa(JSON.stringify({ id: user.id, email }));
      resolve({ user: normalizeAuthUser(user), token });
    }, 900);
  });

/**
 * Simulate profile details fetch
 * @param {string} userId
 * @returns {Promise<object | null>}
 */
export const apiGetProfileDetails = (userId) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (!userId) {
        resolve(null);
        return;
      }
      const profiles = getProfiles();
      resolve(profiles[userId] || null);
    }, 500);
  });

/**
 * Simulate profile details save
 * @param {{ userId: string, details: object }} payload
 * @returns {Promise<{ success: boolean }>} 
 */
export const apiSaveProfileDetails = ({ userId, details }) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) {
        reject(new Error('User not found. Please login again.'));
        return;
      }
      const profiles = getProfiles();
      const existing = profiles[userId] || {};
      const updatedProfiles = {
        ...profiles,
        [userId]: {
          ...existing,
          ...details,
          updatedAt: new Date().toISOString(),
        },
      };
      saveProfiles(updatedProfiles);
      resolve({ success: true });
    }, 900);
  });
