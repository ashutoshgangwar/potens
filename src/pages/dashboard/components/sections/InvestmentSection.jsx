import React from 'react';
import { Card } from '../../../../components/ui/index.js';

const InvestmentSection = ({ profileDetails, partnerKpis, onOpenProfile }) => {
  const selectedPlan = profileDetails?.investmentPlan || 'Not selected yet';

  return (
    <Card
      padding="md"
      shadow="sm"
      className="investment-screen-card"
      header={
        <div className="screen-header-card investment-screen-header">
          <div>
            <p className="screen-kicker">Growth Track</p>
            <h2 className="card-section-title">Investment Plan</h2>
            <p className="screen-subtitle">Optimize daily earnings with the right partner investment setup.</p>
          </div>
          <button className="view-all-btn" onClick={onOpenProfile}>
            Update plan
          </button>
        </div>
      }
    >
      <div className="screen-kpi-grid">
        <div className="screen-kpi-card">
          <span className="screen-kpi-label">Today Orders</span>
          <strong className="screen-kpi-value">{partnerKpis.todayOrders}</strong>
        </div>
        <div className="screen-kpi-card screen-kpi-card--success">
          <span className="screen-kpi-label">Today Income</span>
          <strong className="screen-kpi-value">{partnerKpis.todayIncomeLabel}</strong>
        </div>
      </div>

      <div className="screen-details-card">
        <div className="status-row">
          <span className="status-label">Selected Plan</span>
          <span className="status-value">{selectedPlan}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Total Orders</span>
          <span className="status-value">{partnerKpis.totalOrders}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Completion Rate</span>
          <span className="status-value">{partnerKpis.completionRate}%</span>
        </div>
      </div>
    </Card>
  );
};

export default InvestmentSection;
