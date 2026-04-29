import axios from 'axios';

export const fetchNonPartnerRoles = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.get(`${API_BASE_URL}/api/roles/non-partner`);
  return response.data;
};
