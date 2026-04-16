import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const DocumentsSection = ({ certificatePdfUrl }) => {
  const hasCertificatePdf = Boolean(certificatePdfUrl);

  const handleDownloadCertificate = () => {
    if (hasCertificatePdf) {
      window.open(certificatePdfUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    window.print();
  };

  return (
    <Card
      padding="md"
      shadow="sm"
      className="certificate-section-card"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Certificate</h2>
          <span className="meta-pill">QR Enabled</span>
        </div>
      }
    >
      <div className="certificate-status-panel">
        <span className="certificate-status-label">Certificate Status</span>
        <strong className="certificate-status-value">{hasCertificatePdf ? 'Active' : 'Pending'}</strong>
        <p className="certificate-status-copy">
          {hasCertificatePdf
            ? 'Your certificate is active and valid.'
            : 'Certificate PDF not uploaded yet. Showing dummy certificate preview.'}
        </p>
      </div>

      <div className="certificate-cta-row">
        <Button variant="primary" size="sm" onClick={handleDownloadCertificate}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
          </svg>
          Download Certificate PDF
        </Button>
      </div>

      <div className="certificate-preview-wrap">
        {hasCertificatePdf ? (
          <object
            data={certificatePdfUrl}
            type="application/pdf"
            className="certificate-pdf-preview"
            aria-label="Certificate PDF preview"
          >
            <div className="certificate-dummy-preview">
              <img src="/certificate.svg" alt="Certificate" className="certificate-dummy-icon" />
              <strong>Certificate PDF preview not supported in this browser.</strong>
              <span>Tap “Download Certificate PDF” to open it in a new tab.</span>
            </div>
          </object>
        ) : (
          <div className="certificate-dummy-preview">
            <img src="/certificate.svg" alt="Dummy certificate" className="certificate-dummy-icon" />
            <strong>No Certificate Generated</strong>
            <span>Complete your details and get your certificate.</span>
          </div>
        )}
      </div>

      <h3 className="certificate-section-title">Certificate Details</h3>
      <div className="certificate-detail-grid">
        <div className="certificate-detail-item">
          <span>Certificate Number</span>
          <strong>POTENS202666635847</strong>
        </div>
        <div className="certificate-detail-item">
          <span>Issued Date</span>
          <strong>6 Mar 2026</strong>
        </div>
        <div className="certificate-detail-item">
          <span>Valid Until</span>
          <strong>6 Mar 2028</strong>
        </div>
        <div className="certificate-detail-item">
          <span>Certificate Type</span>
          <strong>Delivery Partner Certificate</strong>
        </div>
        <div className="certificate-detail-item">
          <span>Validity Period</span>
          <strong>2 Years</strong>
        </div>
        <div className="certificate-detail-item">
          <span>Verification</span>
          <strong>QR Code Enabled</strong>
        </div>
      </div>

      <h3 className="certificate-section-title">Important Information</h3>
      <ul className="certificate-info-list">
        <li>This certificate is valid for 2 years from the date of issuance.</li>
        <li>The certificate includes a QR code for public verification.</li>
        <li>Keep this certificate safe and present it when required.</li>
        <li>For any certificate-related issues, please contact support.</li>
      </ul>
    </Card>
  );
};

export default DocumentsSection;
