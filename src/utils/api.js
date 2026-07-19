/**
 * Approve/Reject Partner API
 * POST /api/partners/approve
 * @param {Object} params
 * @param {string} params.token
 * @param {string} params.partnerId
 * @param {string} params.partnerRole
 * @param {boolean} params.approved
 * @param {string} params.approvedBy
 * @param {string} params.remarks
 * @returns {Promise<object>} API response
 */
/**
 * Approve/Reject Partner API (admin)
 * POST /api/auth/admin/partner-action
 * @param {Object} params
 * @param {string} params.token - Auth token
 * @param {string} params.userId - Partner user ID
 * @param {string} params.action - "approved" or "rejected"
 * @param {string} params.approvalType - "admin", "super_admin", etc.
 * @returns {Promise<object>} API response
 */
export const apiApprovePartner = async ({ token, userId, action, approvalType, remark, rejectionReason }) => {
  if (!token) throw new Error('Not authorized.');
  if (!userId || !action || !approvalType) throw new Error('Missing required fields.');
  const body = { userId, action, approvalType };
  if (action === 'approved' && remark) body.remark = remark;
  if (action === 'rejected' && rejectionReason) body.rejectionReason = rejectionReason;
  // Debug: log the request payload
  // console.log('[apiApprovePartner] Request:', { url: '/auth/admin/partner-action', body, token });
  try {
    const response = await apiClient.post('/auth/admin/partner-action', body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Debug: log the response
    // console.log('[apiApprovePartner] Response:', response.data);
    return response.data;
  } catch (error) {
    // Debug: log the error
    // console.error('[apiApprovePartner] Error:', error?.response?.data || error);
    throw new Error(error?.response?.data?.message || 'Failed to approve/reject partner.');
  }
};
/**
 * Fetch partners (admin) with optional status filter
 * GET /api/auth/admin/partners?status=all|pending|approved|rejected
 * @param {string} token - Bearer token
 * @param {string} [status] - optional status filter ('all' is treated as no filter)
 * @returns {Promise<Array>} partners
 */
export const apiGetPartners = async (token, status) => {
  if (!token) {
    throw new Error('Not authorized.');
  }
  try {
    const response = await apiClient.get('/auth/admin/partners', {
      headers: { Authorization: `Bearer ${token}` },
      params: status && status !== 'all' ? { status } : {},
    });
    // Always return an array, even if API returns null/undefined
    const partners = response.data?.partners ?? response.data?.users ?? [];
    return Array.isArray(partners) ? partners : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch partners.'));
  }
};

import axios from 'axios';

/**
 * PAN & Aadhaar verification API
 * POST /api/verify/pan-aadhaar
 * @param {{ panNumber: string, aadhaarNumber: string, fullName: string }} payload
 * @returns {Promise<object>} API response
 */

// PAN Verification API
export const apiVerifyPan = async ({ panNumber, userId }) => {
  try {
    const response = await apiClient.post('/verify/pan', {
      panNumber,
      userId,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'PAN verification failed.'));
  }
};

// Aadhaar Verification API
// Sends multipart/form-data: userId, aadhaarNumber, optional aadhaar_card_file
export const apiVerifyAadhaar = async ({ aadhaarNumber, userId, aadhaarFile, token }) => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('aadhaarNumber', aadhaarNumber);
    if (aadhaarFile) {
      formData.append('aadhaar_card_file', aadhaarFile);
    }
    const accessToken = token || localStorage.getItem('POTENS_admin_access_token') || '';
    console.log('[apiVerifyAadhaar] Request', {
      endpoint: '/api/verify/aadhaar',
      userId,
      aadhaarNumber,
      hasFile: !!aadhaarFile,
      hasToken: !!accessToken,
    });
    const response = await apiClient.post('verify/aadhaar', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Do NOT set Content-Type; browser sets multipart/form-data boundary automatically
      },
    });
    console.log('[apiVerifyAadhaar] Response', {
      status: response?.status,
      data: response?.data,
    });
    return response.data;
  } catch (error) {
    console.error('[apiVerifyAadhaar] Error', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(getApiErrorMessage(error, 'Aadhaar verification failed.'));
  }
};

const MOCK_USERS_KEY = 'POTENS_admin_users';
const MOCK_PROFILES_KEY = 'POTENS_admin_profiles';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PDF_API_BASE_URL = import.meta.env.VITE_PDF_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'POTENS_admin_access_token';
const PDF_SERVICE_BASE_URL = (PDF_API_BASE_URL || API_BASE_URL || '').replace(/\/$/, '');

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

// Normalize the backend `payment_summary` block — the single source of truth
// for the payment UI. `salePrice`/`pendingAmount` stay null for legacy users
// with no sale price set; the UI shows those as "Not set" and keeps the form
// enabled (an admin sets their price separately).
const normalizePaymentSummary = (summary) => {
  if (!isPlainObject(summary)) {
    return null;
  }

  return {
    salePrice: normalizeNumericValue(summary.sale_price),
    totalPaid: normalizeNumericValue(summary.total_paid) ?? 0,
    pendingAmount: normalizeNumericValue(summary.pending_amount),
    isFullyPaid: Boolean(summary.is_fully_paid),
    // Absent flag is treated as "allowed" so a stale backend can't lock the form.
    canAddPayment: summary.can_add_payment !== false,
  };
};

// One installment record from `crew_payment_details` (newest first).
const normalizeCrewPayment = (payment = {}) => ({
  ...payment,
  id: payment.id || payment._id || '',
  amount: normalizeNumericValue(payment.amount),
  paymentDate: payment.payment_date || payment.paymentDate || payment.created_at || '',
  status: payment.status || '',
  approvalStatus: payment.approval_status || payment.approvalStatus || '',
  utr: payment.utr || payment.transaction_number || '',
  bankName: payment.bank_name || payment.bankName || '',
});

const normalizeCrewPaymentList = (payments) =>
  Array.isArray(payments) ? payments.map(normalizeCrewPayment) : [];

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

  return 'FDP';
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

// Normalize the /auth/profile response into a single object that carries BOTH
// the nested sections (user/professional/address/documents/payment/vehicle —
// consumed by the dashboard) AND the flat camelCase field keys the
// ProfileCompletion form binds to (so existing data pre-fills on re-upload).
const normalizeProfileResponse = (responseData = {}) => {
  const candidates = getCandidatePayloads(responseData);

  // The payload object that actually carries the profile sections (used for
  // role resolution); falls back to the raw response.
  const source =
    candidates.find(
      (candidate) =>
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
    ) || responseData;

  const user = findFirstObjectByKeys(candidates, ['user', 'user_details', 'account', 'account_details']);
  const professional = findFirstObjectByKeys(candidates, ['professional', 'professional_details']);
  const address = findFirstObjectByKeys(candidates, ['address', 'address_details']);
  const documents = findFirstObjectByKeys(candidates, ['documents', 'document_details']);
  const payment = findFirstObjectByKeys(candidates, ['payment', 'payment_details']);
  const vehicle = findFirstObjectByKeys(candidates, ['vehicle', 'vehicle_details']);

  const permanentAddress = address?.permanent_address || {};
  const businessAddress = address?.business_address || {};

  // Sale price can arrive either as a top-level field or inside payment_summary.
  const summarySource = findFirstObjectByKeys(candidates, ['payment_summary']);
  const paymentSummary = Object.keys(summarySource).length
    ? normalizePaymentSummary(summarySource)
    : null;
  const salePriceValue = pickFirstDefined(
    summarySource?.sale_price,
    source?.sale_price,
    payment?.sale_price
  );

  const normalizedUser = {
    ...normalizeAuthUser(user),
    role: normalizeRoleValue(getRoleFromApiUser(user, source)),
  };

  return {
    user: normalizedUser,
    professional,
    address,
    documents,
    payment,
    vehicle,
    paymentSummary,
    updatedAt: normalizedUser?.updatedAt || new Date().toISOString(),
    // Flat key the ProfileCompletion form binds to (pre-fills on re-upload).
    salePrice: salePriceValue ?? '',
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
    // Document reference numbers — needed so the form pre-fills existing values.
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

export const fetchAuthProfilePayload = async (authToken) => {
  const response = await apiClient.get('/auth/profile', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  // Log the profile API response for debugging
  // console.log('[Profile API] Response:', response.data);
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
 * Send OTP to phone
 * POST /api/auth/send-otp
 * @param {{ phone: string }} params
 * @returns {Promise<{ message: string }>}
 */
export const apiSendOtp = async ({ phone } = {}) => {
  if (!phone) {
    throw new Error('Phone number is required.');
  }

  try {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return { message: response.data?.message || 'OTP sent.' };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to send OTP.'));
  }
};

/**
 * Verify OTP for phone
 * POST /api/auth/verify-otp
 * @param {{ phone: string, otp: string }} params
 * @returns {Promise<{ message: string, verified: boolean, data?: object }>} API response
 */
export const apiVerifyOtp = async ({ phone, otp } = {}) => {
  if (!phone || !otp) {
    throw new Error('Phone and OTP are required.');
  }

  try {
    const response = await apiClient.post('/auth/verify-otp', { phone, otp });
    return {
      message: response.data?.message || 'OTP verified.',
      verified: Boolean(response.data?.verified ?? true),
      data: response.data,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'OTP verification failed.'));
  }
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
 * Forgot password API call
 * @param {{ email?: string, phone?: string, password: string, confirmPassword: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export const apiForgotPassword = async ({ email, phone, password, confirmPassword }) => {
  if (!email && !phone) {
    throw new Error('Please provide email or phone number.');
  }

  const requestBody = {
    password,
    confirm_password: confirmPassword,
  };

  if (email) requestBody.email = email;
  if (phone) requestBody.phone = phone;

  try {
    const response = await apiClient.post('/auth/forgot-password', requestBody);
    return {
      message: response.data?.message || 'Password updated successfully.',
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to reset password.'));
  }
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
    // Build FormData for multipart/form-data
    const formData = new FormData();
    const src = payload || {};

    // Helper to append files if present
    const appendFile = (field, file) => {
      if (file) formData.append(field, file);
    };

    // Append files with correct field names
    appendFile('pan_card_file', src.panCardFile || src.pan_card_file);
    appendFile('aadhaar_card_file', src.aadhaarCardFile || src.aadhaar_card_file);
    appendFile('driving_license_file', src.drivingLicenseFile || src.driving_license_file);
    appendFile('vehicle_rc_file', src.vehicleRcFile || src.vehicle_rc_file);
    appendFile('passport_size_photo_file', src.passportPhotoFile || src.passport_size_photo_file);
    appendFile('noc_file', src.nocFile || src.noc_file);

    // Append other fields (as JSON string or regular fields)
    if (src.professional_details) formData.append('professional_details', JSON.stringify(src.professional_details));
    if (src.address) formData.append('address', JSON.stringify(src.address));
    if (src.vehicle_details) formData.append('vehicle_details', JSON.stringify(src.vehicle_details));
    if (src.payment) formData.append('payment', JSON.stringify(src.payment));
    if (src.document_details) formData.append('document_details', JSON.stringify(src.document_details));

    // Log the onboarding API call details
    // console.log('[apiOnboard] POST', `${API_BASE_URL}/api/auth/onboard`, formData);

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/onboard`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type, let browser/axios handle it
        },
      }
    );
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
    // console.log('datta', data);
    
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not fetch onboarding progress.'));
  }

  const percentValue = Number(data?.onboarding_progress_percentage);

  return {
    onboardingProgressPercentage: Number.isFinite(percentValue) ? percentValue : 0,
    isProfileCompleted: Boolean(data?.is_profile_completed),
    sections: data?.sections || {},
    pendingDetails: data?.pending_details || {},
    paymentSummary: normalizePaymentSummary(data?.payment_summary),
    crewPaymentDetails: normalizeCrewPaymentList(data?.crew_payment_details),
  };
};

/**
 * Submit one installment payment.
 * POST /api/payment/submit (multipart/form-data)
 *
 * Each call creates a NEW installment record — it is never an edit of a
 * previous one. The response carries the recalculated payment_summary, so the
 * caller should drive the UI off the returned summary rather than re-fetching.
 *
 * @param {{
 *   token?: string,
 *   utr: string,
 *   accountNumber: string,
 *   amount: number|string,
 *   bankName: string,
 *   paymentDate: string,
 *   screenshot: File,
 * }} params
 * @returns {Promise<{ message: string, paymentSummary: object|null, payment: object|null }>}
 */
export const apiSubmitPayment = async ({
  token,
  utr,
  accountNumber,
  amount,
  bankName,
  paymentDate,
  screenshot,
} = {}) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Not authorized.');
  }

  const formData = new FormData();
  formData.append('utr', `${utr ?? ''}`.trim());
  formData.append('accountNumber', `${accountNumber ?? ''}`.trim());
  formData.append('amount', Number(amount));
  formData.append('bank_name', `${bankName ?? ''}`.trim());
  formData.append('payment_date', paymentDate);
  if (screenshot) {
    formData.append('screenshot', screenshot);
  }

  let data;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/submit`, formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        // Do NOT set Content-Type — the browser adds the multipart boundary.
      },
    });
    data = response.data;
  } catch (error) {
    // Surfaces the backend's own 400s verbatim, e.g. "Full sale price is
    // already paid…" and "Amount (…) cannot exceed the pending amount (…)".
    throw new Error(getApiErrorMessage(error, 'Payment submission failed.'));
  }

  const payload = data?.data || data || {};

  return {
    message: data?.message || 'Payment submitted successfully.',
    paymentSummary: normalizePaymentSummary(payload?.payment_summary),
    payment: payload?.payment || payload?.crew_payment || null,
  };
};

/**
 * Save the logged-in partner's own total sale price.
 * POST /api/crew/profile (completeProfile)
 *
 * NOTE: this must be its own call — /auth/onboard ignores `sale_price`
 * entirely. completeProfile explicitly supports a sale_price-only submission
 * (no other section supplied) and responds with the recalculated summary.
 *
 * @param {{ token?: string, salePrice: number|string }} params
 * @returns {Promise<{ message: string, paymentSummary: object|null }>}
 */
export const apiSaveSalePrice = async ({ token, salePrice } = {}) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Not authorized.');
  }

  const numericSalePrice = Number(salePrice);
  if (!Number.isFinite(numericSalePrice) || numericSalePrice <= 0) {
    throw new Error('sale_price must be a positive number.');
  }

  let data;
  try {
    const response = await apiClient.post(
      '/crew/profile',
      { sale_price: numericSalePrice },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to save sale price.'));
  }

  return {
    message: data?.message || 'Sale price saved.',
    paymentSummary: normalizePaymentSummary(data?.payment_summary || data?.data?.payment_summary),
  };
};

/**
 * Set a partner's total sale price (approver role only).
 * PATCH /api/payment/user/:userId/sale-price
 *
 * @param {{ token?: string, userId: string, salePrice: number|string }} params
 * @returns {Promise<{ message: string, paymentSummary: object|null }>}
 */
export const apiSetUserSalePrice = async ({ token, userId, salePrice } = {}) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Not authorized.');
  }

  if (!userId) {
    throw new Error('User is required to set a sale price.');
  }

  const numericSalePrice = Number(salePrice);
  if (!Number.isFinite(numericSalePrice) || numericSalePrice <= 0) {
    throw new Error('sale_price must be a positive number.');
  }

  let data;
  try {
    const response = await apiClient.patch(
      `/payment/user/${userId}/sale-price`,
      { sale_price: numericSalePrice },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    data = response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update sale price.'));
  }

  return {
    message: data?.message || 'Sale price updated.',
    paymentSummary: normalizePaymentSummary(data?.data?.payment_summary || data?.payment_summary),
  };
};

/**
 * Fetch onboarding completion status for the logged-in partner.
 * GET /auth/onboarding-status (auth-protected).
 *
 * Returns overall_percentage, is_complete / needs_resubmission booleans,
 * a flat pending_fields list, and a per-section breakdown
 * (professional, address, documents, vehicle). Payment details are excluded
 * from this check. Non-partner users get onboarding_required: false at 100%.
 *
 * @param {string} [token]
 * @returns {Promise<{
 *   onboardingRequired: boolean,
 *   overallPercentage: number,
 *   isComplete: boolean,
 *   needsResubmission: boolean,
 *   pendingCount: number,
 *   pendingFields: Array<{ section: string, key: string, label: string }>,
 *   sections: object,
 *   note: string,
 * }>}
 */
export const apiGetOnboardingStatus = async (token) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!authToken) {
    throw new Error('Not authorized.');
  }

  let data;
  try {
    const response = await apiClient.get('/auth/onboarding-status', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    data = response.data?.data || response.data || {};
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not fetch onboarding status.'));
  }

  const percentValue = Number(data?.overall_percentage);
  const sections = data?.sections || {};

  // Prefer the flat top-level pending_fields; otherwise flatten each section's
  // own `pending` array, tagging items with their section name.
  let pendingFields = Array.isArray(data?.pending_fields) ? data.pending_fields : [];
  if (!pendingFields.length) {
    pendingFields = Object.entries(sections).flatMap(([sectionKey, sec]) =>
      (Array.isArray(sec?.pending) ? sec.pending : []).map((item) => ({
        section: item.section || sectionKey,
        key: item.key,
        label: item.label,
      }))
    );
  }

  return {
    onboardingRequired: data?.onboarding_required !== false,
    overallPercentage: Number.isFinite(percentValue) ? percentValue : 0,
    isComplete: Boolean(data?.is_complete),
    needsResubmission: Boolean(data?.needs_resubmission),
    pendingCount: Number(data?.pending_count) || pendingFields.length,
    pendingFields,
    sections,
    note: data?.note || '',
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

const getPdfServiceBaseUrl = () => {
  if (!PDF_SERVICE_BASE_URL) {
    throw new Error('PDF API base URL is not configured. Set VITE_PDF_API_BASE_URL or VITE_API_BASE_URL.');
  }

  return PDF_SERVICE_BASE_URL;
};

const normalizeCertificateResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const nestedData = payload.data && typeof payload.data === 'object' ? payload.data : {};

  return {
    ...payload,
    ...nestedData,
  };
};

const normalizeAgreementResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const nestedData = payload.data && typeof payload.data === 'object' ? payload.data : {};

  return {
    ...payload,
    ...nestedData,
  };
};

/**
 * PDF document stats (admin dashboard)
 * Endpoint: GET /api/pdf/stats/counts
 * @param {{ token?: string } | string} [options]
 * @returns {Promise<{ total: number, agreement: number, certificate: number, counts: Object }>}
 */
export const apiGetPdfStatsCounts = async (options = {}) => {
  const authToken =
    typeof options === 'string'
      ? options || localStorage.getItem(ACCESS_TOKEN_KEY) || ''
      : options.token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  try {
    const pdfBaseUrl = getPdfServiceBaseUrl();
    const response = await axios.get(`${pdfBaseUrl}/api/pdf/stats/counts`, {
      timeout: 8000,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });

    const data = response.data || {};
    return {
      total: data.total ?? 0,
      agreement: data.agreement ?? data.counts?.agreement ?? 0,
      certificate: data.certificate ?? data.counts?.certificate ?? 0,
      counts:
        data.counts && typeof data.counts === 'object' ? data.counts : {},
    };
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to fetch PDF stats.'));
  }
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
    const pdfBaseUrl = getPdfServiceBaseUrl();
    const response = await axios.post(
      `${pdfBaseUrl}/api/pdf/generate-agreement`,
      { userId },
      { timeout: 10000 }
    );
    return response.data?.data || response.data || {};
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to generate agreement PDF.'));
  }
};

/**
 * Step 2: Get authenticated user's agreement PDF details
 * Endpoint: GET /api/pdf/my-agreement
 * @returns {Promise<object>}
 */
export const apiGetAgreementPdfDetails = async ({ token } = {}) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Authentication token is required to fetch agreement details.');
  }

  try {
    const pdfBaseUrl = getPdfServiceBaseUrl();

    // console.log('[apiGetAgreementPdfDetails] Request:', {
    //   url: `${pdfBaseUrl}/api/pdf/my-agreement`,
    //   hasToken: Boolean(authToken),
    // });

    const response = await axios.get(
      `${pdfBaseUrl}/api/pdf/my-agreement`,
      {
        timeout: 8000,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    // console.log('[apiGetAgreementPdfDetails] Response:', response.data);

    return normalizeAgreementResponse(response.data);
  } catch (error) {
    console.error('[apiGetAgreementPdfDetails] Error:', error?.response?.data || error);
    throw new Error(getPdfApiError(error, 'Failed to fetch agreement details.'));
  }
};

/**
 * Step 3: Download authenticated user's agreement PDF file
 * Endpoint: GET /api/pdf/my-agreement?download=true
 * @param {{ token?: string } | string} [options]
 * @returns {Promise<{ blob: Blob, fileName: string, downloadUrl: string }>} 
 */
export const apiDownloadAgreementPdfFile = async (options = {}) => {
  const authToken =
    typeof options === 'string'
      ? options || localStorage.getItem(ACCESS_TOKEN_KEY) || ''
      : options.token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Authentication token is required to download agreement PDF.');
  }

  const pdfBaseUrl = getPdfServiceBaseUrl();
  const downloadUrl = `${pdfBaseUrl}/api/pdf/my-agreement?download=true`;

  try {
    // console.log('[apiDownloadAgreementPdfFile] Request:', {
    //   url: downloadUrl,
    //   hasToken: Boolean(authToken),
    // });

    const response = await axios.get(downloadUrl, {
      responseType: 'blob',
      timeout: 15000,
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const disposition = response?.headers?.['content-disposition'] || '';
    const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const fileName = decodeURIComponent(fileNameMatch?.[1] || 'my-agreement.pdf');

    return {
      blob: response.data,
      fileName,
      downloadUrl,
    };
  } catch (error) {
    console.error('[apiDownloadAgreementPdfFile] Error:', error?.response?.data || error);
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
    const pdfBaseUrl = getPdfServiceBaseUrl();
    const response = await axios.post(
      `${pdfBaseUrl}/api/pdf/generate-certificate`,
      { userId },
      { timeout: 10000 }
    );
    return response.data?.data || response.data || {};
  } catch (error) {
    throw new Error(getPdfApiError(error, 'Failed to generate certificate PDF.'));
  }
};

/**
 * Fetch authenticated user's certificate details
 * GET /api/pdf/my-certificate
 */
export const apiGetCertificatePdfDetails = async ({ token } = {}) => {
  const authToken = token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Authentication token is required to fetch certificate details.');
  }

  try {
    const pdfBaseUrl = getPdfServiceBaseUrl();

    // console.log('[apiGetCertificatePdfDetails] Request:', {
    //   url: `${pdfBaseUrl}/api/pdf/my-certificate`,
    //   hasToken: Boolean(authToken),
    // });

    const response = await axios.get(
      `${pdfBaseUrl}/api/pdf/my-certificate`,
      {
        timeout: 8000,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    // console.log('[apiGetCertificatePdfDetails] Response:', response.data);

    return normalizeCertificateResponse(response.data);
  } catch (error) {
    console.error('[apiGetCertificatePdfDetails] Error:', error?.response?.data || error);
    throw new Error(getPdfApiError(error, 'Failed to fetch certificate details.'));
  }
};

// Backward-compatible exports
export const apiGetAgreementPdfMetadata = apiGetAgreementPdfDetails;
export const getAgreementPdfDownloadUrl = () => `${getPdfServiceBaseUrl()}/api/pdf/my-agreement?download=true`;

/**
 * Download authenticated user's certificate PDF file
 * Endpoint: GET /api/pdf/my-certificate?download=true
 * @param {{ token?: string } | string} [options]
 * @returns {Promise<{ blob: Blob, fileName: string, downloadUrl: string }>}
 */
export const apiDownloadCertificatePdfFile = async (options = {}) => {
  const authToken =
    typeof options === 'string'
      ? options || localStorage.getItem(ACCESS_TOKEN_KEY) || ''
      : options.token || localStorage.getItem(ACCESS_TOKEN_KEY) || '';

  if (!authToken) {
    throw new Error('Authentication token is required to download certificate PDF.');
  }

  const pdfBaseUrl = getPdfServiceBaseUrl();
  const downloadUrl = `${pdfBaseUrl}/api/pdf/my-certificate?download=true`;

  try {
    // console.log('[apiDownloadCertificatePdfFile] Request:', {
    //   url: downloadUrl,
    //   hasToken: Boolean(authToken),
    // });

    const response = await axios.get(downloadUrl, {
      responseType: 'blob',
      timeout: 15000,
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const disposition = response?.headers?.['content-disposition'] || '';
    const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const fileName = decodeURIComponent(fileNameMatch?.[1] || 'my-certificate.pdf');

    return {
      blob: response.data,
      fileName,
      downloadUrl,
    };
  } catch (error) {
    console.error('[apiDownloadCertificatePdfFile] Error:', error?.response?.data || error);
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
