import React from 'react';

const mockReports = [
  { id: 'R1', title: 'Monthly Onboarding Summary', date: '2026-04-01', link: '#' },
  { id: 'R2', title: 'Pending Approvals', date: '2026-04-27', link: '#' },
  { id: 'R3', title: 'Payout Reconciliation', date: '2026-03-31', link: '#' },
];

const ReportsSection = () => (
  <div className="reports-list" style={{ padding: '1.5rem' }}>
    <h3>Reports</h3>
    <p>Downloadable reports for operations and wallet.</p>
    <ul style={{ marginTop: 12 }}>
      {mockReports.map((r) => (
        <li key={r.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Generated: {r.date}</div>
            </div>
            <div className="reports-actions">
              <a href={r.link} className="btn btn-secondary" style={{ marginRight: 8 }}>View</a>
              <a href={r.link} className="btn">Download</a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ReportsSection;
