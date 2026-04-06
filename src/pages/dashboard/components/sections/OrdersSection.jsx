import React from 'react';
import { Card } from '../../../../components/ui/index.js';

const OrdersSection = ({ stats }) => {
  return (
    <Card
      padding="md"
      shadow="sm"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Orders</h2>
          <span className="meta-pill meta-pill--subtle">Live Overview</span>
        </div>
      }
    >
      <div className="stats-grid">
        {stats.map(({ label, value, change, up, icon }) => (
          <Card key={label} padding="md" shadow="sm" className="stat-card">
            <div className="stat-icon">{icon}</div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            <p className={`stat-change ${up ? 'stat-change--up' : 'stat-change--down'}`}>
              {up ? '▲' : '▼'} {change}
            </p>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default OrdersSection;
