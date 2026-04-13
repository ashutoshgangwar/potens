import axios from 'axios';

const MOCK_USERS_KEY = 'potense_admin_users';
const MOCK_PROFILES_KEY = 'potense_admin_profiles';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'potense_admin_access_token';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const normalizeNumericValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const buildAddressPayload = (prefix, details) => ({
  address_line1: details[`${prefix}AddressLine1`],
  address_line2: details[`${prefix}AddressLine2`],
  city: details[`${prefix}City`],
  district: details[`${prefix}District`],
  state: details[`${prefix}State`],
  pincode: details[`${prefix}Pincode`],
  latitude: normalizeNumericValue(details[`${prefix}Latitude`]),
  longitude: normalizeNumericValue(details[`${prefix}Longitude`]),
});

const mapPaymentModeForApi = (paymentMode) => {
  switch (paymentMode) {
    case 'bank':
      return 'bank_transfer';
    case 'both':
      return 'both';
    default:
      return paymentMode;
  }
};

const getPaymentOtherDetailsForApi = (details = {}) => {
  if (details.paymentMode === 'both') {
    const baseDetails = `${details.paymentOtherDetails || ''}`.trim();
    const combinedModeNote = 'Preferred payout mode: UPI + Bank';
    return baseDetails ? `${combinedModeNote}. ${baseDetails}` : combinedModeNote;
  }

  return details.paymentOtherDetails;
};

const isBrowserFile = (value) =>
  typeof File !== 'undefined' && value instanceof File;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
    reader.onerror = () => reject(new Error(`Could not read file: ${file?.name || 'document'}`));
    reader.readAsDataURL(file);
  });

const getDocumentFileUrl = async (value) => {
  if (isBrowserFile(value)) {
    return readFileAsDataUrl(value);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue || undefined;
  }

  if (value && typeof value === 'object') {
    if (typeof value.file_url === 'string' && value.file_url.trim()) {
      return value.file_url.trim();
    }

    if (typeof value.url === 'string' && value.url.trim()) {
      return value.url.trim();
    }
  }

  return undefined;
};

const serializeStoredFileValue = (value) => {
  if (value instanceof File) {
    return {
      name: value.name,
      type: value.type,
      size: value.size,
      lastModified: value.lastModified,
    };
  }

  return value;
};

const serializeProfileDetails = (details = {}) =>
  Object.entries(details).reduce((accumulator, [key, value]) => {
    accumulator[key] = serializeStoredFileValue(value);
    return accumulator;
  }, {});

export const buildCrewProfilePayload = (details = {}) => ({
  professional_details: {
    register_as: 'crew',
    full_name: details.fullName,
    father_name: details.fatherName,
    dob: details.dob,
    gender: details.gender,
    state: details.state,
    district: details.district,
    field_officer_name: details.fieldOfficerName,
    pincode: details.pinCode,
    oil_sector_experience_years: normalizeNumericValue(details.oilSectorExperienceYears),
    distance_to_nearest_petrol_pump_km: normalizeNumericValue(details.nearestFuelPumpDistance),
    investment_plan: details.investmentPlan,
  },
  address_details: {
    permanent_address: buildAddressPayload('permanent', details),
    business_address: buildAddressPayload('business', details),
  },
  vehicle_details: {
    vehicle_number: details.vehicleNumber,
  },
  payment_details: {
    payment_mode: mapPaymentModeForApi(details.paymentMode),
    upi_id: details.upiId,
    account_number: details.bankAccountNumber,
    ifsc_code: details.ifscCode,
    bank_name: details.bankName,
    branch_name: details.bankBranch,
    account_holder_name: details.accountHolderName,
    other_details: getPaymentOtherDetailsForApi(details),
  },
  document_details: {
    pan_card: {
      number: details.panNumber,
      file: details.panFile,
    },
    aadhaar_card: {
      number: details.aadhaarNumber,
      file: details.aadhaarFile,
    },
    driving_license: {
      number: details.drivingLicenseNumber,
      file: details.drivingLicenseFile,
    },
    vehicle_rc: {
      number: details.vehicleRcNumber,
      file: details.vehicleRcFile,
    },
    passport_size_photo: {
      file: details.passportPhotoFile,
    },
    noc: {
      file: details.nocFile,
    },
  },
});

export const buildOnboardingPayload = async (details = {}) => ({
  professional_details: {
    register_as: 'FDP Driver',
    full_name: details.fullName,
    father_name: details.fatherName,
    dob: details.dob,
    gender: details.gender,
    state: details.state,
    district: details.district,
    field_officer_name: details.fieldOfficerName,
    pincode: details.pinCode,
    oil_sector_experience_years: normalizeNumericValue(details.oilSectorExperienceYears),
    distance_to_nearest_petrol_pump_km: normalizeNumericValue(details.nearestFuelPumpDistance),
    investment_plan: details.investmentPlan,
  },
  address: {
    permanent_address: buildAddressPayload('permanent', details),
    business_address: buildAddressPayload('business', details),
  },
  document_details: {
    pan_card: {
      number: details.panNumber,
      file_url: await getDocumentFileUrl(details.panFile),
    },
    aadhaar_card: {
      number: details.aadhaarNumber,
      file_url: await getDocumentFileUrl(details.aadhaarFile),
    },
    driving_license: {
      number: details.drivingLicenseNumber,
      file_url: await getDocumentFileUrl(details.drivingLicenseFile),
    },
    vehicle_rc: {
      number: details.vehicleRcNumber,
      file_url: await getDocumentFileUrl(details.vehicleRcFile),
    },
    passport_size_photo: {
      file_url: await getDocumentFileUrl(details.passportPhotoFile),
    },
    noc: {
      file_url: await getDocumentFileUrl(details.nocFile),
    },
  },
  vehicle_details: {
    vehicle_number: details.vehicleNumber,
  },
  payment: {
    payment_mode: mapPaymentModeForApi(details.paymentMode),
    bank_name: details.bankName,
    account_holder_name: details.accountHolderName,
    account_number: details.bankAccountNumber,
    ifsc_code: details.ifscCode,
    branch_name: details.bankBranch,
    upi_id: details.upiId,
    other_details: getPaymentOtherDetailsForApi(details),
  },
});

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message.trim();
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        const path = entry?.path || entry?.field;
        const message = entry?.message || entry?.msg;
        return [path, message].filter(Boolean).join(': ');
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof responseData?.error === 'string' && responseData.error.trim()) {
    return responseData.error.trim();
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Network error: could not reach the API server.';
  }

  if (error?.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }

  return fallbackMessage;
};

const extractAuthToken = (data = {}) =>
  data?.token || data?.access_token || data?.accessToken || null;

const persistProfileDetails = ({ userId, details }) => {
  const profiles = getProfiles();
  const existing = profiles[userId] || {};
  const serializedDetails = serializeProfileDetails(details);

  const updatedProfiles = {
    ...profiles,
    [userId]: {
      ...existing,
      ...serializedDetails,
      updatedAt: new Date().toISOString(),
    },
  };

  saveProfiles(updatedProfiles);
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
 * Fetch all roles from the API (no token required)
 * @returns {Promise<Array>}
 */
export const apiGetRoles = async () => {
  try {
    const response = await apiClient.get('/roles');
    // Normalise: accept array or { roles: [...] }
    return Array.isArray(response.data) ? response.data : (response.data?.roles ?? []);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load roles.'));
  }
};

/**
 * Sign up API call
 * @param {{ fullName: string, email: string, phone: string, password: string, confirmPassword: string, role: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export const apiSignUp = async ({ fullName, email, phone, password, confirmPassword, role = 'driver' }) => {
  let data;
  try {
    const response = await apiClient.post('/auth/signup', {
      full_name: fullName,
      email,
      phone,
      password,
      confirm_password: confirmPassword,
      role,
    });
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Sign up failed. Please try again.'));
  }

  const user = normalizeAuthUser(data?.user);

  return {
    message: data?.message || 'User registered successfully.',
    token: extractAuthToken(data),
    user,
  };
};

/**
 * Login API call
 * @param {{ email?: string, phone?: string, password: string }} payload
 * @returns {Promise<{ message: string, user: object, token: string }>}
 */
export const apiLogin = async ({ email, phone, password }) => {
  let data;
  try {
    const body = { password };
    if (email) body.email = email;
    if (phone) body.phone = phone;
    const response = await apiClient.post('/auth/login', body);
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Invalid credentials.'));
  }

  return {
    message: data?.message || 'Login successful.',
    token: extractAuthToken(data),
    user: normalizeAuthUser(data?.user),
  };
};

/**
 * Logout API call
 * @param {string} token - Bearer token
 * @returns {Promise<{ message: string }>}
 */
export const apiLogout = async (token) => {
  try {
    const response = await apiClient.post(
      '/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    // Even if the server call fails, we still clear the local session
    console.warn('Logout API error:', getApiErrorMessage(error, 'Logout failed.'));
    return { message: 'Logged out.' };
  }
};

/**
 * Onboarding API call
 * @param {{ token: string, payload?: object, professional?: object, address?: object, documents?: object, vehicle?: object, payment?: object }} payload
 * @returns {Promise<{ message: string, is_onboarded: boolean, user: object }>}
 */
export const apiOnboard = async ({ token, payload, professional, address, documents, vehicle, payment }) => {
  let data;
  try {
    const body = payload || {};

    if (!payload) {
      if (professional) body.professional_details = professional;
      if (address) body.address = address;
      if (documents) body.document_details = documents;
      if (vehicle) body.vehicle_details = vehicle;
      if (payment) body.payment = payment;
    }

    const response = await apiClient.post('/auth/onboard', body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Onboarding failed. Please try again.'));
  }

  return {
    message: data?.message || 'Onboarding completed.',
    is_onboarded: data?.is_onboarded ?? true,
    user: normalizeAuthUser(data?.user),
  };
};

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
  new Promise(async (resolve, reject) => {
    if (!userId) {
      reject(new Error('User not found. Please login again.'));
      return;
    }

    try {
      if (API_BASE_URL) {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);

        await apiClient.post('/crew/profile', buildCrewProfilePayload(details), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      persistProfileDetails({ userId, details });
      resolve({ success: true, message: 'Profile saved successfully' });
    } catch (error) {
      reject(
        new Error(getApiErrorMessage(error, 'Could not save profile. Please try again.'))
      );
    }
  });
