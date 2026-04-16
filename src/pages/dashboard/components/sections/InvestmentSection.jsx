import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const InvestmentSection = () => {
  return (
    <Card
      padding="md"
      shadow="sm"
      className="certificate-section-card"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Agreement</h2>
          <span className="meta-pill">QR Enabled</span>
        </div>
      }
    >
      <div className="certificate-status-panel">
        <span className="certificate-status-label">Agreement Status</span>
        <strong className="certificate-status-value">Active</strong>
        <p className="certificate-status-copy">Your agreement is active and valid.</p>
      </div>

      <div className="certificate-cta-row">
        <Button variant="primary" size="sm" onClick={() => window.print()}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
          </svg>
          Download Agreement PDF
        </Button>
      </div>

      <h3 className="certificate-section-title">Agreement Details</h3>
      <div className="certificate-detail-grid">
        <div className="certificate-detail-item">
          <span>Agreement Number</span>
          <strong>IAGREEMENT202666635847</strong>
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
          <span>Agreement Type</span>
          <strong>Delivery Partner Agreement</strong>
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
        <li>This agreement is valid for 2 years from the date of issuance.</li>
        <li>The agreement includes a QR code for public verification.</li>
        <li>Keep this agreement safe and present it when required.</li>
        <li>For any agreement-related issues, please contact support.</li>
      </ul>
    </Card>
  );
};

export default InvestmentSection;
