import axios from 'axios';

const MOCK_USERS_KEY = 'potense_admin_users';
const MOCK_PROFILES_KEY = 'potense_admin_profiles';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'potense_admin_access_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

const getApiErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || fallbackMessage;

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
 * Sign up API call
 * @param {{ fullName: string, email: string, phone: string, password: string, confirmPassword: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export const apiSignUp = async ({ fullName, email, phone, password, confirmPassword }) => {
  let data;
  try {
    const response = await apiClient.post('/api/auth/signup', {
      full_name: fullName,
      email,
      phone,
      password,
      confirm_password: confirmPassword,
    });
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Sign up failed. Please try again.'));
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
 * Login API call
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ message: string, user: object, token: string }>}
 */
export const apiLogin = async ({ email, password }) => {
  let data;
  try {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Invalid email or password.'));
  }

  return {
    message: data?.message || 'Login successful.',
    token: data?.token,
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

        await apiClient.post('/api/crew/profile', buildCrewProfilePayload(details), {
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
