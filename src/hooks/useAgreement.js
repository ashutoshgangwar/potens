import { useState, useCallback, useEffect } from 'react';
import {
  apiGetAgreementStatus,
  apiInitializeEsign,
  apiCompleteEsign,
} from '../utils/apiAgreement.js';

/**
 * useAgreement - Custom hook for managing agreement and e-sign flow
 * Handles fetching agreement status, initializing e-sign, and completing signature
 *
 * @param {string} token - Authentication token
 * @param {string} userId - User ID
 * @param {Object} userDetails - User details { full_name, mobile_number, user_email }
 * @returns {Object} Agreement state and methods
 */
export const useAgreement = (token, userId, userDetails = {}) => {
  const [agreementState, setAgreementState] = useState({
    // Agreement status
    agreementStatus: null, // 'pending', 'initialized', 'signed'
    isSigned: false,
    signingUrl: null,
    agreementUrl: null,
    draftAgreementUrl: null,
    signedFileUrl: null,

    // E-sign flow
    esignInitialized: false,
    esignData: null, // Contains: url, client_id, token, group_id
    signingInProgress: false,

    // UI state
    isLoading: false,
    error: null,
    successMessage: null,
  });

  /**
   * Fetch current agreement status
   */
  const fetchAgreementStatus = useCallback(
    async (includeDraft = false) => {
      if (!token) {
        setAgreementState((prev) => ({
          ...prev,
          error: 'Not authenticated. Please login first.',
        }));
        return;
      }

      setAgreementState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiGetAgreementStatus(token, includeDraft);
        setAgreementState((prev) => ({
          ...prev,
          agreementStatus: response.agreementStatus,
          isSigned: response.isSigned,
          signingUrl: response.signingUrl,
          agreementUrl: response.agreementUrl,
          draftAgreementUrl: response.draftAgreementUrl,
          signedFileUrl: response.signedFileUrl,
          isLoading: false,
        }));
      } catch (error) {
        setAgreementState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    },
    [token]
  );

  /**
   * Initialize Surepass e-sign process
   */
  const initializeEsign = useCallback(
    async (signType = 'aadhaar', customPositions = null) => {
      if (!token || !userId) {
        setAgreementState((prev) => ({
          ...prev,
          error: 'Missing authentication or user ID',
        }));
        return null;
      }

      setAgreementState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const payload = {
          userId,
          signType,
          config: {
            auth_mode: '1',
            reason: "Contract signing with - Potens Green Engineering Solutions Pvt. Ltd.",
            positions: customPositions || {
              1: [{ x: 300, y: 60 }], 
              2: [{ x: 300, y: 60 }],
             3: [{ x: 300, y: 60 }],
             4: [{ x: 300, y: 640 }],
            },
          },
          prefill_options: {
            full_name: userDetails.full_name || '',
            mobile_number: userDetails.mobile_number || '',
            user_email: userDetails.user_email || '',
          },
        };

        const response = await apiInitializeEsign(token, payload);
        setAgreementState((prev) => ({
          ...prev,
          esignInitialized: true,
          esignData: {
            url: response.data?.url || response.url,
            client_id: response.data?.client_id || response.client_id,
            token: response.data?.token || response.token,
            group_id: response.data?.group_id || response.group_id,
          },
          isLoading: false,
        }));
        return response.data || response;
      } catch (error) {
        setAgreementState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
        return null;
      }
    },
    [token, userId, userDetails]
  );

  /**
   * Complete e-sign process after user signs
   */
  const completeEsign = useCallback(
    async (signedFileUrl, caseUrl = null) => {
      if (!token || !userId) {
        setAgreementState((prev) => ({
          ...prev,
          error: 'Missing authentication or user ID',
        }));
        return null;
      }

      if (!signedFileUrl) {
        setAgreementState((prev) => ({
          ...prev,
          error: 'Signed file URL is required',
        }));
        return null;
      }

      setAgreementState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const payload = {
          userId,
          signedFileUrl,
          esignStatus: 'signed',
        };
        if (caseUrl) {
          payload.caseUrl = caseUrl;
        }

        const response = await apiCompleteEsign(token, payload);
        setAgreementState((prev) => ({
          ...prev,
          isSigned: true,
          agreementUrl: response.agreementUrl || response.signedFileUrl,
          signedFileUrl,
          esignInitialized: false,
          esignData: null,
          signingInProgress: false,
          successMessage: 'Agreement signed successfully!',
          isLoading: false,
        }));
        return response;
      } catch (error) {
        setAgreementState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
        return null;
      }
    },
    [token, userId]
  );

  /**
   * Open Surepass signing URL in a popup/new window
   */
  const openSigningWindow = useCallback(() => {
    if (!agreementState.esignData?.url) {
      setAgreementState((prev) => ({
        ...prev,
        error: 'Signing URL not available. Please initialize e-sign first.',
      }));
      return null;
    }

    const signingWindow = window.open(
      agreementState.esignData.url,
      'SurepassSigning',
      'width=800,height=600,resizable=yes,scrollbars=yes'
    );

    if (!signingWindow) {
      setAgreementState((prev) => ({
        ...prev,
        error: 'Failed to open signing window. Please allow pop-ups.',
      }));
    }

    setAgreementState((prev) => ({ ...prev, signingInProgress: true }));
    return signingWindow;
  }, [agreementState.esignData?.url]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setAgreementState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear success message
   */
  const clearSuccessMessage = useCallback(() => {
    setAgreementState((prev) => ({ ...prev, successMessage: null }));
  }, []);

  /**
   * Reset agreement state
   */
  const resetState = useCallback(() => {
    setAgreementState({
      agreementStatus: null,
      isSigned: false,
      signingUrl: null,
      agreementUrl: null,
      draftAgreementUrl: null,
      signedFileUrl: null,
      esignInitialized: false,
      esignData: null,
      signingInProgress: false,
      isLoading: false,
      error: null,
      successMessage: null,
    });
  }, []);

  // Fetch agreement status on mount or when dependencies change
  useEffect(() => {
    if (token && userId) {
      fetchAgreementStatus();
    }
  }, [token, userId, fetchAgreementStatus]);

  return {
    ...agreementState,
    fetchAgreementStatus,
    initializeEsign,
    completeEsign,
    openSigningWindow,
    clearError,
    clearSuccessMessage,
    resetState,
  };
};
