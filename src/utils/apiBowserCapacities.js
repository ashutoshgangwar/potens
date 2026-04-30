import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/bowser-capacities`;

export const apiGetBowserCapacities = async () => {
  try {
    const response = await axios.get(API_URL);
    // Return the array of capacities
    return response.data?.capacities || [];
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || 'Failed to fetch bowser capacities.'
    );
  }
};
