import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const SupportSection = () => {
  return (
    <Card
      padding="md"
      shadow="sm"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Support</h2>
          <span className="meta-pill">24x7 Help</span>
        </div>
      }
    >
      <div className="status-row">
        <span className="status-label">Support Email</span>
        <span className="status-value">support@potensenergy.com</span>
      </div>
      <div className="status-row">
        <span className="status-label">Support Phone</span>
        <span className="status-value">+91 98765 43210</span>
      </div>
      <div className="status-row">
        <span className="status-label">Working Hours</span>
        <span className="status-value">Mon - Sat, 9:00 AM - 7:00 PM</span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => window.open('mailto:support@potensenergy.com', '_blank')}
      >
        Contact Support
      </Button>
    </Card>
  );
};

export default SupportSection;
