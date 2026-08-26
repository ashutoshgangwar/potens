import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getCreateUserError = (error) => {
  const data = error?.response?.data;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        const path = entry?.path || entry?.field;
        const message = entry?.message || entry?.msg;
        return [path, message].filter(Boolean).join(': ');
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Network error: could not reach the API server.';
  }

  if (error?.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }

  return 'Failed to create user.';
};

// Create User API for super admin
export const apiCreateUser = async ({ email, password, phone, role, dob, assigned_city, full_name, token }) => {
  if (!token) throw new Error('Not authorized.');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/admin/create-user`,
      {
        email: email?.trim(),
        password,
        phone: phone?.replace(/\D/g, ''),
        role,
        dob,
        assigned_city: assigned_city?.trim(),
        full_name: full_name?.trim(),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(getCreateUserError(error));
  }
};
