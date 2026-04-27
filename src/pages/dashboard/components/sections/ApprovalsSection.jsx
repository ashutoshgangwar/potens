import React, { useState } from 'react';

const mockApprovals = [
  { id: 'A1', name: 'Vishal Gangwar', role: 'fdp-driver', submittedAt: '2026-04-27T09:10:00Z', status: 'pending' },
  { id: 'A2', name: 'Sonal Kumar', role: 'mini-pump', submittedAt: '2026-04-26T14:22:00Z', status: 'pending' },
  { id: 'A3', name: 'Ravi Patel', role: 'bowser', submittedAt: '2026-04-25T11:05:00Z', status: 'in-review' },
];

const ApprovalsSection = () => {
  const [items, setItems] = useState(mockApprovals);

  const updateStatus = (id, status) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
  };

  return (
    <div className="approvals-list-wrap" style={{ padding: '1.5rem' }}>
      <h3>Onboarding Approvals</h3>
      <p>Pending onboarding requests for review.</p>
      <div className="approvals-list" style={{ marginTop: 12 }}>
        {items.map((it) => (
          <div key={it.id} className="approval-item">
            <div>
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{it.role} • submitted {new Date(it.submittedAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`approvals-status ${it.status === 'in-review' ? 'pending' : it.status}`}>{it.status}</span>
              <div>
                <button className="btn btn-approve" onClick={() => updateStatus(it.id, 'approved')} style={{ marginRight: 8 }}>Approve</button>
                <button className="btn btn-reject" onClick={() => updateStatus(it.id, 'rejected')}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalsSection;
