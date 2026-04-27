import React from 'react';

const AdminSection = () => {
  const stats = {
    totalUsers: 42,
    pendingApprovals: 6,
    totalPartners: 128,
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h3>Admin</h3>
      <p>Administrative dashboard and quick actions.</p>
      <div className="admin-stats" style={{ marginTop: 12 }}>
        <div className="admin-card">
          <div className="card-title">Total Internal Users</div>
          <div className="card-value">{stats.totalUsers}</div>
        </div>
        <div className="admin-card">
          <div className="card-title">Pending Approvals</div>
          <div className="card-value">{stats.pendingApprovals}</div>
        </div>
        <div className="admin-card">
          <div className="card-title">Total Partners</div>
          <div className="card-value">{stats.totalPartners}</div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" style={{ marginRight: 8 }}>Sync Partners</button>
        <button className="btn">Run Reconciliation</button>
      </div>
    </div>
  );
};

export default AdminSection;
