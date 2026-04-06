import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const PaymentSection = ({ paymentReady, paymentPreferenceLabel, onOpenProfile }) => {
  return (
    <Card
      padding="md"
      shadow="sm"
      className="payment-screen-card"
      header={
        <div className="screen-header-card payment-screen-header">
          <div>
            <p className="screen-kicker">Payout Control</p>
            <h2 className="card-section-title">Payment Status</h2>
            <p className="screen-subtitle">Monitor payout readiness and keep your payment details up to date.</p>
          </div>
          <span className={`payment-hero-chip ${paymentReady ? 'payment-hero-chip--ready' : 'payment-hero-chip--pending'}`}>
            {paymentReady ? 'Ready for payouts' : 'Setup pending'}
          </span>
        </div>
      }
    >
      <div className="screen-details-card">
        <div className="status-row">
          <span className="status-label">Preferred Method</span>
          <span className="status-value">{paymentPreferenceLabel}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Payout Readiness</span>
          <span className={`status-value ${paymentReady ? 'status-value--success' : 'status-value--warning'}`}>
            {paymentReady ? 'Verified' : 'Action required'}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Last Verification</span>
          <span className="status-value">{paymentReady ? 'Today' : 'Pending'}</span>
        </div>
      </div>

      <div className="payment-cta-row">
        <Button size="sm" onClick={onOpenProfile}>
          {paymentReady ? 'Review Payment Details' : 'Complete Payment Setup'}
        </Button>
      </div>
    </Card>
  );
};

export default PaymentSection;
