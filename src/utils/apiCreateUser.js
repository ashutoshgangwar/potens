import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create User API for super admin
export const apiCreateUser = async ({ email, password, phone, role, dob, assigned_city, full_name, token }) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/admin/create-user`,
    { email, password, phone, role, dob, assigned_city, full_name },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
