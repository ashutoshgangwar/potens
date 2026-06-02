import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAgreement } from '../../hooks/useAgreement';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import './AgreementSection.css';

/**
 * AgreementSection - Component for managing agreement signing flow
 * Displays agreement status, allows users to sign, and shows signed agreement
 */
export const AgreementSection = () => {
  const { user, token } = useAuth();
  const [isSigningWindowOpen, setIsSigningWindowOpen] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);

  // Get agreement state and methods
  const {
    agreementStatus,
    isSigned,
    signingUrl,
    agreementUrl,
    draftAgreementUrl,
    signedFileUrl,
    esignInitialized,
    esignData,
    signingInProgress,
    isLoading,
    error,
    successMessage,
    fetchAgreementStatus,
    initializeEsign,
    completeEsign,
    openSigningWindow,
    clearError,
    clearSuccessMessage,
  } = useAgreement(
    token,
    user?._id || user?.id,
    {
      full_name: user?.full_name || user?.name || '',
      mobile_number: user?.mobile_number || user?.phone || '',
      user_email: user?.email || '',
    }
  );

  /**
   * Handle initiating the e-sign process
   */
  const handleInitiateSign = async () => {
    const result = await initializeEsign('aadhaar');
    if (result) {
      setShowSigningModal(true);
    }
  };

  /**
   * Handle opening the signing window
   */
  const handleOpenSigningWindow = () => {
    const signingWindow = openSigningWindow();
    if (signingWindow) {
      setIsSigningWindowOpen(true);

      // Poll for window closure and get signed file URL
      const pollInterval = setInterval(() => {
        if (signingWindow.closed) {
          clearInterval(pollInterval);
          setIsSigningWindowOpen(false);
          // Prompt user to provide signed file URL or auto-detect it
          handleSigningComplete();
        }
      }, 1000);

      // Clean up interval on component unmount
      return () => clearInterval(pollInterval);
    }
  };

  /**
   * Handle completion of signing
   * In production, Surepass will provide the signedFileUrl via callback/webhook
   */
  const handleSigningComplete = async () => {
    // In a real implementation, Surepass would provide the signed file URL
    // For now, we'll show a prompt or wait for webhook callback
    // This would typically be handled via:
    // 1. Surepass webhook callback to backend
    // 2. Backend stores the signed URL
    // 3. Frontend fetches the updated status
    
    // Refresh agreement status to check if signed
    setTimeout(() => {
      fetchAgreementStatus();
    }, 2000);
  };

  /**
   * Handle completing the e-sign after user has signed
   */
  const handleCompleteSign = async () => {
    if (!signedFileUrl) {
      alert('Please sign the agreement first and then try again.');
      return;
    }
    
    const result = await completeEsign(signedFileUrl);
    if (result) {
      setShowSigningModal(false);
      setIsSigningWindowOpen(false);
      // Refresh to confirm
      setTimeout(() => {
        fetchAgreementStatus();
      }, 1000);
    }
  };

  /**
   * Handle downloading agreement
   */
  const handleDownloadAgreement = async () => {
    if (!agreementUrl) {
      alert('No signed agreement available');
      return;
    }

    try {
      // Open in new tab/window
      window.open(agreementUrl, '_blank');
    } catch (err) {
      console.error('Failed to download agreement:', err);
      alert('Failed to download agreement');
    }
  };

  /**
   * Handle downloading draft (preview only)
   */
  const handleDownloadDraft = async () => {
    if (!draftAgreementUrl) {
      alert('No draft agreement available');
      return;
    }

    try {
      window.open(draftAgreementUrl, '_blank');
    } catch (err) {
      console.error('Failed to download draft:', err);
      alert('Failed to download draft');
    }
  };

  /**
   * Render agreement status badge
   */
  const renderStatusBadge = () => {
    if (isSigned) {
      return (
        <div className="agreement-status-badge signed">
          <span className="badge-icon">✓</span> Signed
        </div>
      );
    }
    if (signingUrl || esignInitialized) {
      return (
        <div className="agreement-status-badge pending">
          <span className="badge-icon">⏳</span> Pending Signature
        </div>
      );
    }
    return (
      <div className="agreement-status-badge draft">
        <span className="badge-icon">📄</span> Draft
      </div>
    );
  };

  if (!token) {
    return (
      <div className="agreement-section">
        <Alert type="error">Please login to access your agreement</Alert>
      </div>
    );
  }

  if (isLoading && !agreementStatus) {
    return (
      <div className="agreement-section loading-container">
        <Spinner />
        <p>Loading agreement status...</p>
      </div>
    );
  }

  return (
    <div className="agreement-section">
      {/* Header */}
      <div className="agreement-header">
        <h2>Agreement & E-Sign</h2>
        {renderStatusBadge()}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert type="success" onClose={clearSuccessMessage}>
          {successMessage}
        </Alert>
      )}

      {/* Signed Agreement (Success State) */}
      {isSigned && agreementUrl && (
        <div className="agreement-card signed-card">
          <div className="card-header">
            <h3>✓ Agreement Signed Successfully</h3>
          </div>
          <div className="card-content">
            <p>Your agreement has been digitally signed and is now active.</p>
            <div className="agreement-details">
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">Signed</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Agreement URL:</span>
                <span className="detail-value url-text">{agreementUrl}</span>
              </div>
            </div>
            <Button
              type="secondary"
              onClick={handleDownloadAgreement}
              disabled={isLoading}
            >
              📥 Download Signed Agreement
            </Button>
          </div>
        </div>
      )}

      {/* Pending Signature State */}
      {!isSigned && (signingUrl || esignInitialized) && (
        <div className="agreement-card pending-card">
          <div className="card-header">
            <h3>Pending Signature</h3>
          </div>
          <div className="card-content">
            <p>Your agreement is ready for digital signature. Click the button below to proceed with e-signing.</p>
            
            {/* Draft Preview Section */}
            {draftAgreementUrl && (
              <div className="draft-preview-section">
                <p className="section-label">📄 Preview Draft (Optional)</p>
                <p className="draft-note">
                  This is a preview of your agreement. You can review it before signing.
                </p>
                <Button
                  type="secondary"
                  onClick={handleDownloadDraft}
                  disabled={isLoading}
                >
                  👁️ Preview Draft
                </Button>
              </div>
            )}

            {/* E-Sign Section */}
            <div className="esign-section">
              <p className="section-label">🔐 Digital Signature via Aadhaar</p>
              <p className="esign-note">
                Your identity will be verified using Aadhaar. You'll be redirected to a secure signing portal.
              </p>
              
              {!esignInitialized ? (
                <Button
                  type="primary"
                  onClick={handleInitiateSign}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Initializing...' : 'Start E-Signing Process'}
                </Button>
              ) : (
                <>
                  <div className="signing-info">
                    <p className="info-text">✓ E-sign initialized. Ready to open signing portal.</p>
                  </div>
                  <Button
                    type="primary"
                    onClick={handleOpenSigningWindow}
                    disabled={isSigningWindowOpen || isLoading}
                    isLoading={isLoading}
                  >
                    {isSigningWindowOpen ? 'Signing in Progress...' : 'Open Signing Portal'}
                  </Button>
                  <p className="note-text">
                    A new window will open. Complete the signing process there and return to confirm.
                  </p>
                </>
              )}
            </div>

            {/* Confirm After Signing */}
            {isSigningWindowOpen && (
              <div className="confirm-signing-section">
                <p className="confirm-label">✓ Signed? Click to confirm</p>
                <Button
                  type="success"
                  onClick={handleCompleteSign}
                  disabled={isLoading || !signedFileUrl}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Confirming...' : 'Confirm Signing'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draft State (No Action Needed) */}
      {!isSigned && !signingUrl && !esignInitialized && (
        <div className="agreement-card draft-card">
          <div className="card-header">
            <h3>Agreement Draft</h3>
          </div>
          <div className="card-content">
            <p>Your agreement is being prepared. You'll receive a signing link once it's ready.</p>
            {draftAgreementUrl && (
              <>
                <Button
                  type="secondary"
                  onClick={handleDownloadDraft}
                  disabled={isLoading}
                >
                  📥 Download Draft
                </Button>
              </>
            )}
            <Button
              type="secondary"
              onClick={() => fetchAgreementStatus()}
              disabled={isLoading}
            >
              🔄 Refresh Status
            </Button>
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="agreement-debug">
          <details>
            <summary>Debug Info</summary>
            <pre>{JSON.stringify({
              agreementStatus,
              isSigned,
              esignInitialized,
              signingInProgress,
              esignData: esignData ? { ...esignData, url: '...' } : null,
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default AgreementSection;
