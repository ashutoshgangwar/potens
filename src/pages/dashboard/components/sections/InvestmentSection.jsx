import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '../../../../components/ui/index.js';
import {
  apiDownloadAgreementPdfFile,
  apiGenerateAgreementPdf,
  apiGetAgreementPdfDetails,
  apiDownloadCertificatePdfFile,
  apiGenerateCertificatePdf,
  apiGetCertificatePdfDetails,
} from '../../../../utils/api.js';

const getFormattedDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return `${value}`;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStoredUserId = () => {
  try {
    return localStorage.getItem('POTENS_admin_user_id') || '';
  } catch {
    return '';
  }
};

const getAgreementUserId = ({ userId, profileDetails }) => (
  userId ||
  profileDetails?.user?.id ||
  profileDetails?.userId ||
  profileDetails?.id ||
  getStoredUserId() ||
  'USER123'
);

const resolveMetadata = (metadata) => {
  // Only return the actual API response fields, no fallbacks or || chains
  return metadata && typeof metadata === 'object' ? { ...metadata } : {};
};

const InvestmentSection = ({ profileDetails, userId }) => {
  const resolvedUserId = getAgreementUserId({ userId, profileDetails });
  const [agreementMeta, setAgreementMeta] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [loadingAgreement, setLoadingAgreement] = useState(true);
  const [loadingCertificate, setLoadingCertificate] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [downloadingAgreement, setDownloadingAgreement] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [generatingAgreement, setGeneratingAgreement] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [reloadSeed, setReloadSeed] = useState(0);

  useEffect(() => {
    let mounted = true;

    // Debug: log resolvedUserId and API URL
    console.log('InvestmentSection: resolvedUserId', resolvedUserId);
    const agreementApiUrl = `${import.meta.env.VITE_PDF_API_BASE_URL || 'http://192.168.1.12:5001'}/api/pdf/agreement/${encodeURIComponent(resolvedUserId)}`;
    console.log('InvestmentSection: agreementApiUrl', agreementApiUrl);

    const loadAgreementMetadata = async () => {
      setLoadingAgreement(true);
      setMetaError('');
      try {
        // Get access token from localStorage or context
        const token = localStorage.getItem('POTENS_admin_access_token') || '';
        const response = await apiGetAgreementPdfDetails({
          userId: resolvedUserId,
          token,
        });
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

    const loadCertificateMetadata = async () => {
      setLoadingCertificate(true);
      try {
        const response = await apiGetCertificatePdfDetails(resolvedUserId);
        if (mounted) setCertificateMeta(response || null);
      } catch (error) {
        if (mounted) setCertificateMeta(null);
      } finally {
        if (mounted) setLoadingCertificate(false);
      }
    };

    loadAgreementMetadata();
    loadCertificateMetadata();

    return () => {
      mounted = false;
    };
  }, [resolvedUserId, reloadSeed]);

  const agreementDetails = useMemo(() => resolveMetadata(agreementMeta), [agreementMeta]);
  const certificateDetails = useMemo(() => resolveMetadata(certificateMeta), [certificateMeta]);


  const handleDownloadAgreement = () => {
    const startDownload = async () => {
      try {
        setDownloadingAgreement(true);
        const { blob, fileName } = await apiDownloadAgreementPdfFile(resolvedUserId);
        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName || `agreement-${resolvedUserId}.pdf`;
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

  const handleDownloadCertificate = () => {
    const startDownload = async () => {
      try {
        setDownloadingCertificate(true);
        const { blob, fileName } = await apiDownloadCertificatePdfFile(resolvedUserId);
        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName || `certificate-${resolvedUserId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(objectUrl);
      } catch (error) {
        setMetaError(error.message || 'Could not download certificate PDF.');
      } finally {
        setDownloadingCertificate(false);
      }
    };
    startDownload();
  };

  return (
    <Card
      padding="md"
      shadow="sm"
      className="certificate-section-card"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Agreement & Certificate</h2>
          <span className="meta-pill">QR Enabled</span>
        </div>
      }
    >
      {/* Agreement Section */}
      <div style={{ marginBottom: 32 }}>
        <div className="certificate-status-panel">
          <span className="certificate-status-label">Agreement Status</span>
          <strong className="certificate-status-value">{agreementDetails.status}</strong>
          <p className="certificate-status-copy">Your agreement is active and valid.</p>
        </div>

        {loadingAgreement && (
          <p className="screen-subtitle">Loading agreement metadata...</p>
        )}

        {metaError && (
          <div className="certificate-cta-row" style={{ justifyContent: 'space-between' }}>
            <p className="certificate-status-copy" style={{ color: '#b91c1c', margin: 0 }}>{metaError}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReloadSeed((previous) => previous + 1)}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="certificate-cta-row" style={{ gap: 12 }}>
          <Button variant="primary" size="sm" onClick={handleDownloadAgreement} disabled={loadingAgreement || downloadingAgreement}>
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
          {agreementDetails.agreementType && (
            <div className="certificate-detail-item">
              <span>Agreement Type</span>
              <strong>{agreementDetails.agreementType}</strong>
            </div>
          )}
          {agreementDetails.validUntil && (
            <div className="certificate-detail-item">
              <span>Valid Until</span>
              <strong>{getFormattedDate(agreementDetails.validUntil)}</strong>
            </div>
          )}
          {agreementDetails.validityPeriodMonths !== undefined && (
            <div className="certificate-detail-item">
              <span>Validity Period (Months)</span>
              <strong>{agreementDetails.validityPeriodMonths}</strong>
            </div>
          )}
          {agreementDetails.validityPeriod && (
            <div className="certificate-detail-item">
              <span>Validity Period</span>
              <strong>{agreementDetails.validityPeriod}</strong>
            </div>
          )}
        </div>

        <h3 className="certificate-section-title">Important Information</h3>
        <ul className="certificate-info-list">
          <li>This agreement is valid for 2 years from the date of issuance.</li>
          <li>The agreement includes a QR code for public verification.</li>
          <li>Keep this agreement safe and present it when required.</li>
          <li>For any agreement-related issues, please contact support.</li>
        </ul>
      </div>
    </Card>
  );
};

export default InvestmentSection;
