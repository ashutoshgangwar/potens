import axios from 'axios';

const MOCK_USERS_KEY = 'POTENS_admin_users';
const MOCK_PROFILES_KEY = 'POTENS_admin_profiles';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = 'http://192.168.1.7:5001';
const PDF_API_BASE_URL = import.meta.env.VITE_PDF_API_BASE_URL || 'http://192.168.1.12:5001';
const ACCESS_TOKEN_KEY = 'POTENS_admin_access_token';

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

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const pickFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const normalizeAuthUser = (user = {}) => ({
  ...user,
  id: user.id || user._id || user.user_id || '',
  name: user.name || user.full_name || user.fullName || '',
  email: user.email || user.email_address || '',
  phone: user.phone || user.mobile || user.mobile_number || user.phone_number || '',
  status: user.status || user.user_status || '',
});

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

const normalizeRoleForComparison = (roleValue = '') =>
  `${roleValue}`
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const getRegisterAsByRole = (roleValue = '') => {
  const normalizedRole = normalizeRoleForComparison(roleValue);

  if (normalizedRole.includes('bowser')) {
    return 'Bowser';
  }

  if (normalizedRole.includes('mini-pump') || normalizedRole.includes('minipump')) {
    return 'Mini Pump';
  }

  return 'FDP Driver';
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

export const buildOnboardingPayload = async (details = {}, role = '') => ({
  professional_details: {
    register_as: getRegisterAsByRole(role),
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
    bowser_capacity: normalizeNumericValue(details.bowserCapacity),
    land_area_acres: normalizeNumericValue(details.areaInAcres),
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

const getRoleFromApiUser = (user = {}, data = {}) => {
  if (user?.role) {
    return user.role;
  }

  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    return user.roles[0];
  }

  if (data?.role) {
    return data.role;
  }

  if (Array.isArray(data?.roles) && data.roles.length > 0) {
    return data.roles[0];
  }

  return '';
};

const normalizePaymentModeForUi = (paymentMode) => {
  if (paymentMode === 'bank_transfer') {
    return 'bank';
  }

  return paymentMode;
};

const normalizeDobValue = (dobValue) => {
  if (!dobValue) {
    return '';
  }

  if (typeof dobValue === 'string') {
    return dobValue;
  }

  return '';
};

const getCandidatePayloads = (responseData = {}) => {
  const queue = [responseData];
  const candidates = [];
  const seen = new Set();

  while (queue.length > 0) {
    const candidate = queue.shift();

    if (!isPlainObject(candidate) || seen.has(candidate)) {
      continue;
    }

    seen.add(candidate);
    candidates.push(candidate);

    ['data', 'profile', 'details', 'result', 'payload'].forEach((key) => {
      if (isPlainObject(candidate[key])) {
        queue.push(candidate[key]);
      }
    });
  }

  return candidates;
};

const findFirstObjectByKeys = (candidates = [], keys = []) => {
  for (const candidate of candidates) {
    for (const key of keys) {
      if (isPlainObject(candidate?.[key])) {
        return candidate[key];
      }
    }
  }

  return {};
};

const resolveProfilePayload = (responseData = {}) => {
  const candidates = getCandidatePayloads(responseData);

  for (const candidate of candidates) {
    if (
      isPlainObject(candidate?.user) ||
      isPlainObject(candidate?.professional) ||
      isPlainObject(candidate?.professional_details) ||
      isPlainObject(candidate?.address) ||
      isPlainObject(candidate?.address_details) ||
      isPlainObject(candidate?.documents) ||
      isPlainObject(candidate?.document_details) ||
      isPlainObject(candidate?.payment) ||
      isPlainObject(candidate?.payment_details) ||
      isPlainObject(candidate?.vehicle) ||
      isPlainObject(candidate?.vehicle_details)
    ) {
      return candidate;
    }
  }

  return candidates[0] || {};
};

const normalizeProfileResponse = (responseData = {}) => {
  const candidates = getCandidatePayloads(responseData);
  const payload = resolveProfilePayload(responseData);

  const user = findFirstObjectByKeys(candidates, ['user', 'user_details', 'account', 'account_details']);
  const professional = findFirstObjectByKeys(candidates, ['professional', 'professional_details']);
  const address = findFirstObjectByKeys(candidates, ['address', 'address_details']);
  const documents = findFirstObjectByKeys(candidates, ['documents', 'document_details']);
  const payment = findFirstObjectByKeys(candidates, ['payment', 'payment_details']);
  const vehicle = findFirstObjectByKeys(candidates, ['vehicle', 'vehicle_details']);

  const permanentAddress = address?.permanent_address || {};
  const businessAddress = address?.business_address || {};

  const normalizedUser = {
    ...normalizeAuthUser(user),
    role: normalizeRoleValue(getRoleFromApiUser(user, payload)),
  };

  return {
    user: normalizedUser,
    professional,
    address,
    documents,
    payment,
    vehicle,
    updatedAt: normalizedUser?.updatedAt || new Date().toISOString(),
    fullName: professional?.full_name || normalizedUser?.name || '',
    fatherName: professional?.father_name || '',
    dob: normalizeDobValue(professional?.dob),
    gender: professional?.gender || '',
    state: professional?.state || '',
    district: professional?.district || '',
    fieldOfficerName: professional?.field_officer_name || '',
    pinCode: professional?.pincode || '',
    oilSectorExperienceYears: professional?.oil_sector_experience_years ?? '',
    nearestFuelPumpDistance: professional?.distance_to_nearest_petrol_pump_km ?? '',
    investmentPlan: professional?.investment_plan || '',
    bowserCapacity: professional?.bowser_capacity ?? '',
    areaInAcres: pickFirstDefined(professional?.land_area_acres, professional?.area_in_acres) ?? '',
    permanentAddressLine1: permanentAddress?.address_line1 || '',
    permanentAddressLine2: permanentAddress?.address_line2 || '',
    permanentCity: permanentAddress?.city || '',
    permanentDistrict: permanentAddress?.district || '',
    permanentState: permanentAddress?.state || '',
    permanentPincode: permanentAddress?.pincode || '',
    businessAddressLine1: businessAddress?.address_line1 || '',
    businessAddressLine2: businessAddress?.address_line2 || '',
    businessCity: businessAddress?.city || '',
    businessDistrict: businessAddress?.district || '',
    businessState: businessAddress?.state || '',
    businessPincode: businessAddress?.pincode || '',
    vehicleNumber: vehicle?.vehicle_number || '',
    paymentMode: normalizePaymentModeForUi(payment?.payment_mode || ''),
    upiId: payment?.upi_id || '',
    bankName: payment?.bank_name || '',
    accountHolderName: payment?.account_holder_name || '',
    bankAccountNumber: payment?.account_number || '',
    ifscCode: payment?.ifsc_code || '',
    bankBranch: payment?.branch_name || '',
    paymentOtherDetails: payment?.other_details || '',
    panNumber: documents?.pan_card?.number || '',
    aadhaarNumber: documents?.aadhaar_card?.number || '',
    drivingLicenseNumber: documents?.driving_license?.number || '',
    vehicleRcNumber: documents?.vehicle_rc?.number || '',
    panFileUrl: documents?.pan_card?.file_url || documents?.pan_card?.url || '',
    aadhaarFileUrl: documents?.aadhaar_card?.file_url || documents?.aadhaar_card?.url || '',
    drivingLicenseFileUrl: documents?.driving_license?.file_url || documents?.driving_license?.url || '',
    vehicleRcFileUrl: documents?.vehicle_rc?.file_url || documents?.vehicle_rc?.url || '',
    passportPhotoFileUrl: documents?.passport_size_photo?.file_url || documents?.passport_size_photo?.url || '',
    nocFileUrl: documents?.noc?.file_url || documents?.noc?.url || '',
    combinedDocumentsPdfUrl:
      documents?.combined_documents_pdf?.file_url ||
      documents?.combined_documents_pdf?.url ||
      documents?.combined_document_pdf?.file_url ||
      documents?.combined_document_pdf?.url ||
      '',
  };
};

const fetchAuthProfilePayload = async (authToken) => {
  const response = await apiClient.get('/auth/profile', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  return response.data || {};
};

const resolveAuthProfileData = (data = {}) => {
  const candidates = getCandidatePayloads(data);

  for (const candidate of candidates) {
    if (isPlainObject(candidate?.user)) {
      return candidate.user;
    }
  }

  for (const candidate of candidates) {
    if (isPlainObject(candidate) && (candidate.name || candidate.full_name || candidate.email || candidate.phone || candidate.mobile)) {
      return candidate;
    }
  }

  return {};
};

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

  const normalizedRole = normalizeRoleValue(data?.user?.role || data?.role || role);
  const user = {
    ...normalizeAuthUser(data?.user),
    role: normalizedRole,
  };

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
    user: {
      ...normalizeAuthUser(data?.user),
      role: normalizeRoleValue(data?.user?.role || data?.role),
    },
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
 * Fetch authenticated user profile
 * @param {string} [token] - Bearer token
 * @returns {Promise<object>}
 */
export const apiGetAuthProfile = async (token) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!authToken) {
    throw new Error('Not authorized.');
  }

  let data;
  try {
    data = await fetchAuthProfilePayload(authToken);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not fetch user profile.'));
  }

  const normalizedProfile = normalizeProfileResponse(data);
  const profileUser = resolveAuthProfileData(data);

  return {
    ...normalizedProfile.user,
    ...normalizeAuthUser(profileUser),
    role: normalizeRoleValue(getRoleFromApiUser(profileUser, data) || normalizedProfile.user?.role),
  };
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
 * Fetch onboarding progress for logged-in crew user
 * @param {string} [token]
 * @returns {Promise<{ onboardingProgressPercentage: number, isProfileCompleted: boolean, sections: object, pendingDetails: object }>}
 */
export const apiGetOnboardingProgress = async (token) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!authToken) {
    throw new Error('Not authorized.');
  }

  let data;
  try {
    const response = await apiClient.get('/crew/onboarding-progress', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    data = response.data?.data || response.data || {};
    console.log('datta', data);
    
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not fetch onboarding progress.'));
  }

  const percentValue = Number(data?.onboarding_progress_percentage);

  return {
    onboardingProgressPercentage: Number.isFinite(percentValue) ? percentValue : 0,
    isProfileCompleted: Boolean(data?.is_profile_completed),
    sections: data?.sections || {},
    pendingDetails: data?.pending_details || {},
  };
};

/**
 * Simulate profile details fetch
 * @param {string} userId
 * @returns {Promise<object | null>}
 */
export const apiGetProfileDetails = async (userId) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (API_BASE_URL && token) {
    try {
      const profileData = await fetchAuthProfilePayload(token);
      const normalizedProfile = normalizeProfileResponse(profileData);

      const profileUserId = normalizedProfile?.user?.id || userId;

      if (profileUserId) {
        persistProfileDetails({ userId: profileUserId, details: normalizedProfile });
      }

      return normalizedProfile;
    } catch (error) {
      if (!userId) {
        throw new Error(getApiErrorMessage(error, 'Could not fetch profile details.'));
      }
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!userId) {
        resolve(null);
        return;
      }
      const profiles = getProfiles();
      resolve(profiles[userId] || null);
    }, 500);
  });
};

const getPdfApiError = (error, fallbackMessage) => {
  const status = error?.response?.status;

  if (status === 404) return 'Requested PDF resource was not found.';
  if (status === 500) return 'PDF service error. Please try again later.';
  if (error?.code === 'ECONNABORTED') return 'PDF API timeout. Please check server and try again.';

  return getApiErrorMessage(error, fallbackMessage);
};

/**
 * Step 1: Generate agreement PDF
 * Endpoint: POST /api/pdf/generate-agreement
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const apiGenerateAgreementPdf = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate agreement PDF.');
  }

  try {
    const response = await axios.post(
      `${PDF_API_BASE_URL}/api/pdf/generate-agreement`,
      { userId },
      { timeout: 10000 }
    );
    return response.data?.data || response.data || {};
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to generate agreement PDF.'));
  }
};

/**
 * Step 2: Get agreement PDF details (URL + agreement info)
 * Endpoint: GET /api/pdf/agreement/:userId
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const apiGetAgreementPdfDetails = async ({ userId, token }) => {
  if (!userId) {
    throw new Error('User ID is required to fetch agreement details.');
  }
  try {
    const response = await axios.get(
      `${PDF_API_BASE_URL}/api/pdf/agreement/${encodeURIComponent(userId)}`,
      {
        timeout: 8000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data?.data || response.data || {};
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to fetch agreement details.'));
  }
};

/**
 * Step 3: Download agreement PDF file
 * Endpoint: GET /api/pdf/agreement/:userId?download=true
 * @param {string} userId
 * @returns {Promise<{ blob: Blob, fileName: string, downloadUrl: string }>} 
 */
export const apiDownloadAgreementPdfFile = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to download agreement PDF.');
  }

  const downloadUrl = `${PDF_API_BASE_URL}/api/pdf/agreement/${encodeURIComponent(userId)}?download=true`;

  try {
    const response = await axios.get(downloadUrl, {
      responseType: 'blob',
      timeout: 15000,
    });

    const disposition = response?.headers?.['content-disposition'] || '';
    const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const fileName = decodeURIComponent(fileNameMatch?.[1] || `agreement-${userId}.pdf`);

    return {
      blob: response.data,
      fileName,
      downloadUrl,
    };
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to download agreement PDF.'));
  }
};

/**
 * Optional certificate flow
 * POST /api/pdf/generate-certificate
 */
export const apiGenerateCertificatePdf = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate certificate PDF.');
  }

  try {
    const response = await axios.post(
      `${PDF_API_BASE_URL}/api/pdf/generate-certificate`,
      { userId },
      { timeout: 10000 }
    );
    return response.data?.data || response.data || {};
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to generate certificate PDF.'));
  }
};

/**
 * Optional certificate details flow
 * GET /api/pdf/:userId?pdfType=certificate
 */
export const apiGetCertificatePdfDetails = async ({ userId, token }) => {
  if (!userId) {
    throw new Error('User ID is required to fetch certificate details.');
  }

  try {
    const response = await axios.get(
      `${PDF_API_BASE_URL}/api/pdf/${encodeURIComponent(userId)}?pdfType=certificate`,
      {
        timeout: 8000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log('apiGetCertificatePdfDetails: raw response', response.data);
    // Unwrap if needed
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && typeof response.data.data === 'object') {
        return response.data.data;
      }
      return response.data;
    }
    return {};
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to fetch certificate details.'));
  }
};

// Backward-compatible exports
export const apiGetAgreementPdfMetadata = apiGetAgreementPdfDetails;
export const getAgreementPdfDownloadUrl = (userId) => `${PDF_API_BASE_URL}/api/pdf/agreement/${encodeURIComponent(userId)}?download=true`;

/**
 * Download certificate PDF file
 * Endpoint: GET /api/pdf/certificate/:userId?download=true
 * @param {string} userId
 * @returns {Promise<{ blob: Blob, fileName: string, downloadUrl: string }>}
 */
export const apiDownloadCertificatePdfFile = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to download certificate PDF.');
  }

  const downloadUrl = `${PDF_API_BASE_URL}/api/pdf/certificate/${encodeURIComponent(userId)}?download=true`;

  try {
    const response = await axios.get(downloadUrl, {
      responseType: 'blob',
      timeout: 15000,
    });

    const disposition = response?.headers?.['content-disposition'] || '';
    const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const fileName = decodeURIComponent(fileNameMatch?.[1] || `certificate-${userId}.pdf`);

    return {
      blob: response.data,
      fileName,
      downloadUrl,
    };
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to download certificate PDF.'));
  }
};

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
