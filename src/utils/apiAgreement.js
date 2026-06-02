import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '')}/api`,
});

/**
 * Error message extraction helper
 */
const getApiErrorMessage = (error, defaultMessage = 'An error occurred') => {
  return error?.response?.data?.message || error?.message || defaultMessage;
};

/**
 * Fetch current agreement state
 * GET /api/pdf/my-agreement
 * @param {string} token - Bearer token
 * @param {boolean} includeDraft - Optional: include draft URL in response
 * @returns {Promise<object>} Agreement details
 * @example
 * {
 *   agreementStatus: 'pending|initialized|signed',
 *   isSigned: true|false,
 *   signingUrl: 'https://...',  // present when unsigned draft exists
 *   agreementUrl: 'https://...',  // only when signed
 *   draftAgreementUrl: 'https://...',  // only when includeDraft=true
 *   signedFileUrl: 'https://...'  // signed agreement after completion
 * }
 */
export const apiGetAgreementStatus = async (token, includeDraft = false) => {
  if (!token) {
    throw new Error('Not authorized.');
  }
  try {
    const response = await apiClient.get('/pdf/my-agreement', {
      params: includeDraft ? { includeDraft: true } : {},
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch agreement status.'));
  }
};

/**
 * Initialize Surepass e-sign
 * POST /api/pdf/esign/initialize
 * @param {string} token - Bearer token
 * @param {Object} payload
 * @param {string} payload.userId - User ID
 * @param {string} payload.signType - 'aadhaar' | 'pan' | etc.
 * @param {Object} payload.config - Configuration for e-sign
 * @param {string} payload.config.auth_mode - Authentication mode (e.g., '1')
 * @param {string} payload.config.reason - Reason for signing (e.g., 'Contract Signing')
 * @param {Object} payload.config.positions - Signature positions: { '1': [{ x: number, y: number }] }
 * @param {Object} payload.prefill_options - Pre-fill options
 * @param {string} payload.prefill_options.full_name - User's full name
 * @param {string} payload.prefill_options.mobile_number - User's mobile number
 * @param {string} payload.prefill_options.user_email - User's email
 * @returns {Promise<object>} Surepass response
 * @example
 * Response:
 * {
 *   url: 'https://surepass-signing-url',
 *   client_id: 'xxx',
 *   token: 'xxx',
 *   group_id: 'xxx'
 * }
 */
export const apiInitializeEsign = async (token, payload) => {
  if (!token) {
    throw new Error('Not authorized.');
  }
  if (!payload?.userId || !payload?.signType) {
    throw new Error('Missing required fields: userId, signType');
  }
  try {
    const response = await apiClient.post('/pdf/esign/initialize', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to initialize e-sign.'));
  }
};

/**
 * Complete signed agreement
 * POST /api/pdf/esign/complete
 * @param {string} token - Bearer token
 * @param {Object} payload
 * @param {string} payload.userId - User ID
 * @param {string} payload.signedFileUrl - Signed agreement URL from Surepass
 * @param {string} payload.esignStatus - Status (e.g., 'signed')
 * @param {string} payload.caseUrl - Optional: Case URL
 * @returns {Promise<object>} Updated agreement details
 * @example
 * Response:
 * {
 *   agreementDetails: {...},
 *   isSigned: true,
 *   agreementUrl: 'https://signed-agreement-url',
 *   message: 'Agreement signed successfully'
 * }
 */
export const apiCompleteEsign = async (token, payload) => {
  if (!token) {
    throw new Error('Not authorized.');
  }
  if (!payload?.userId || !payload?.signedFileUrl || !payload?.esignStatus) {
    throw new Error('Missing required fields: userId, signedFileUrl, esignStatus');
  }
  try {
    const response = await apiClient.post('/pdf/esign/complete', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to complete e-sign.'));
  }
};

/**
 * Download agreement PDF
 * GET /api/pdf/download/:agreementId
 * @param {string} token - Bearer token
 * @param {string} agreementId - Agreement ID or URL
 * @returns {Promise<Blob>} PDF blob
 */
export const apiDownloadAgreement = async (token, agreementUrl) => {
  if (!token) {
    throw new Error('Not authorized.');
  }
  if (!agreementUrl) {
    throw new Error('Agreement URL is required.');
  }
  try {
    const response = await apiClient.get(agreementUrl, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to download agreement.'));
  }
};
