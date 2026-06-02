import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useAgreement } from '../../../../hooks/useAgreement.js';
import { Button, Card } from '../../../../components/ui/index.js';
import {
  apiDownloadAgreementPdfFile,
  apiGetAgreementPdfDetails,
} from '../../../../utils/api.js';

const PDF_BASE_URL = (import.meta.env.VITE_PDF_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const getFormattedDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return `${value}`;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const resolveMetadata = (metadata) => {
  // Only return the actual API response fields, no fallbacks or || chains
  return metadata && typeof metadata === 'object' ? { ...metadata } : {};
};

const InvestmentSection = ({ profileDetails = {}, userId }) => {
  const { user, token } = useAuth();
  const [agreementMeta, setAgreementMeta] = useState(null);
  const [loadingAgreement, setLoadingAgreement] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [downloadingAgreement, setDownloadingAgreement] = useState(false);
  const [reloadSeed, setReloadSeed] = useState(0);
  const [isSigningWindowOpen, setIsSigningWindowOpen] = useState(false);
  const pollingRef = useRef(null);

  const agreementToken = token || localStorage.getItem('POTENS_admin_access_token') || '';
  const agreementUserId = userId || user?.id || user?._id || '';
  const agreementUserDetails = {
    full_name:
      profileDetails?.fullName ||
      profileDetails?.full_name ||
      user?.fullName ||
      user?.full_name ||
      user?.name ||
      '',
    mobile_number:
      profileDetails?.phone ||
      profileDetails?.mobile ||
      user?.phone ||
      user?.mobile ||
      '',
    user_email:
      profileDetails?.email ||
      profileDetails?.user_email ||
      user?.email ||
      '',
  };

  const {
    agreementStatus,
    isSigned,
    signingUrl,
    agreementUrl,
    draftAgreementUrl,
    signedFileUrl,
    esignInitialized,
    signingInProgress,
    isLoading: esignLoading,
    error: esignError,
    successMessage,
    fetchAgreementStatus,
    initializeEsign,
    completeEsign,
    openSigningWindow,
  } = useAgreement(agreementToken, agreementUserId, agreementUserDetails);

  useEffect(() => {
    let mounted = true;

    const agreementApiUrl = PDF_BASE_URL
      ? `${PDF_BASE_URL}/api/pdf/my-agreement`
      : 'PDF base URL not configured';

    const loadAgreementMetadata = async () => {
      setLoadingAgreement(true);
      setMetaError('');
      try {
        const token = agreementToken;
        const response = await apiGetAgreementPdfDetails({ token });
        if (mounted) setAgreementMeta(response || null);
      } catch (error) {
        if (mounted) {
          setMetaError(error.message || 'Could not fetch agreement metadata.');
          setAgreementMeta(null);
        }
      } finally {
        if (mounted) setLoadingAgreement(false);
      }
    };

    loadAgreementMetadata();

    return () => {
      mounted = false;
    };
  }, [agreementToken, reloadSeed]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const agreementDetails = useMemo(() => resolveMetadata(agreementMeta), [agreementMeta]);

  const handleDownloadAgreement = () => {
    const startDownload = async () => {
      try {
        setDownloadingAgreement(true);
        const token = agreementToken;
        const { blob, fileName } = await apiDownloadAgreementPdfFile({ token });
        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName || 'my-agreement.pdf';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(objectUrl);
      } catch (error) {
        setMetaError(error.message || 'Could not download agreement PDF.');
      } finally {
        setDownloadingAgreement(false);
      }
    };
    startDownload();
  };

  const handleRefreshAgreement = async () => {
    setReloadSeed((previous) => previous + 1);
    await fetchAgreementStatus();
  };

  const handleInitiateSign = async () => {
    const result = await initializeEsign('aadhaar');
    if (result) {
      handleOpenSigningPortal();
    }
  };

  const handleOpenSigningPortal = () => {
    const signingWindow = openSigningWindow();
    if (!signingWindow) return;

    setIsSigningWindowOpen(true);

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = window.setInterval(() => {
      if (signingWindow.closed) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsSigningWindowOpen(false);
        fetchAgreementStatus();
        setReloadSeed((previous) => previous + 1);
      }
    }, 1000);
  };

  const handleCompleteSigning = async () => {
    if (!signedFileUrl) {
      setMetaError('Please complete signing and refresh the agreement status.');
      return;
    }

    try {
      await completeEsign(signedFileUrl);
      setReloadSeed((previous) => previous + 1);
    } catch (error) {
      setMetaError(error?.message || 'Could not confirm signed agreement.');
    }
  };

  const displayStatus = agreementDetails.status || agreementStatus || (isSigned ? 'signed' : 'pending');
  const displayError = metaError || esignError;

  return (
    <Card
      padding="md"
      shadow="sm"
      className="certificate-section-card"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Agreement</h2>
        </div>
      }
    >
      <div style={{ marginBottom: 32 }}>
        <div className="certificate-status-panel">
          <span className="certificate-status-label">Agreement Status</span>
          <strong className="certificate-status-value">{displayStatus}</strong>
          <p className="certificate-status-copy">Your agreement is active and valid.</p>
        </div>

        {loadingAgreement && (
          <p className="screen-subtitle">Loading agreement metadata...</p>
        )}

        {displayError && (
          <div className="certificate-cta-row" style={{ justifyContent: 'space-between' }}>
            <p className="certificate-status-copy" style={{ color: '#b91c1c', margin: 0 }}>{displayError}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMetaError('');
                setReloadSeed((previous) => previous + 1);
              }}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="certificate-cta-row" style={{ gap: 12, flexWrap: 'wrap' }}>
          {!isSigned && (
            <>
              {!esignInitialized && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleInitiateSign}
                  disabled={loadingAgreement || esignLoading || signingInProgress}
                  loading={loadingAgreement || esignLoading}
                >
                  {esignLoading ? 'Preparing e-sign...' : 'Sign Agreement'}
                </Button>
              )}

              {esignInitialized && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenSigningPortal}
                  disabled={isSigningWindowOpen || loadingAgreement || esignLoading}
                >
                  {isSigningWindowOpen ? 'Signing in progress...' : 'Open Signing Portal'}
                </Button>
              )}

              {(esignInitialized || signingUrl) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefreshAgreement}
                  disabled={loadingAgreement || esignLoading}
                >
                  Refresh Agreement Status
                </Button>
              )}

              {signedFileUrl && !isSigned && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCompleteSigning}
                  disabled={loadingAgreement || esignLoading}
                >
                  Confirm Signed Agreement
                </Button>
              )}
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadAgreement}
            disabled={loadingAgreement || downloadingAgreement}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
            </svg>
            {downloadingAgreement ? 'Downloading...' : 'Download Agreement PDF'}
          </Button>
        </div>

        <h3 className="certificate-section-title">Agreement Details</h3>
        <div className="certificate-detail-grid">
          {agreementDetails.agreementUrl && (
            <div className="certificate-detail-item">
              <span>Agreement PDF</span>
              <a href={agreementDetails.agreementUrl} target="_blank" rel="noopener noreferrer">View Agreement PDF</a>
            </div>
          )}
          {agreementDetails.agreementNumber && (
            <div className="certificate-detail-item">
              <span>Agreement Number</span>
              <strong>{agreementDetails.agreementNumber}</strong>
            </div>
          )}
          {agreementDetails.issueDate && (
            <div className="certificate-detail-item">
              <span>Issued Date</span>
              <strong>{getFormattedDate(agreementDetails.issueDate)}</strong>
            </div>
          )}
          {agreementDetails.validUntil && (
            <div className="certificate-detail-item">
              <span>Expiry Date</span>
              <strong>{getFormattedDate(agreementDetails.validUntil)}</strong>
            </div>
          )}
        </div>

        <h3 className="certificate-section-title">Important Information</h3>
        <ul className="certificate-info-list">
          <li>
            This agreement is valid for{' '}
            <strong>{agreementDetails.validityPeriod || '—'}</strong>{' '}
            from the date of issuance.
          </li>
          <li>Keep this agreement safe and present it when required.</li>
          <li>For any agreement-related issues, please contact support.</li>
        </ul>

        {successMessage && (
          <p className="certificate-status-copy" style={{ color: '#047857', marginTop: 12 }}>{successMessage}</p>
        )}
      </div>
    </Card>
  );
};

export default InvestmentSection;
