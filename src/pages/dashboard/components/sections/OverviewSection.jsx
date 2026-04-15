import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const OverviewSection = ({
  user,
  navigate,
  loadingProfile,
  profileCompletion,
}) => {
  const accountStatus = profileCompletion >= 100 ? 'Ready to Use' : 'In Progress';

  const quickActions = [
    {
      key: 'add-funds',
      title: 'Add Funds',
      subtitle: 'Top up your wallet',
      cta: 'Add Funds',
      tone: 'green',
      icon: '＋',
      onClick: () => navigate('/profile-completion'),
    },
    {
      key: 'fuel-cards',
      title: 'Fuel Cards',
      subtitle: 'Manage your fuel cards',
      cta: 'View Cards',
      tone: 'blue',
      icon: '💳',
      onClick: () => navigate('/profile-completion'),
    },
    {
      key: 'certificate',
      title: 'Certificate',
      subtitle: 'View your partner certificate',
      cta: 'View Certificate',
      tone: 'indigo',
      icon: '🎖',
      onClick: () => navigate('/profile-completion'),
    },
    {
      key: 'agreements',
      title: 'Agreements',
      subtitle: 'View your signed agreements',
      cta: 'View Agreements',
      tone: 'violet',
      icon: '📄',
      onClick: () => navigate('/profile-completion'),
    },
  ];

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-copy">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to your POTENSE delivery partner portal.
          </p>
        </div>
      </header>

      {loadingProfile ? (
        <Card padding="md" shadow="sm">
          <p className="dashboard-subtitle">Loading partner profile details...</p>
        </Card>
      ) : (
        <>
          <div className="overview-top-grid">
            <Card padding="md" shadow="sm" className="overview-portal-card">
              <div className="overview-portal-card-head">
                <span className="overview-portal-icon" aria-hidden="true">📄</span>
                <div>
                  <h2 className="overview-portal-title">Applications</h2>
                  <p className="overview-portal-subtitle">1 application</p>
                </div>
              </div>
              <div className="overview-portal-meta-row">
                <span>Total Applications</span>
                <strong>{profileCompletion > 0 ? 1 : 0}</strong>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/profile-completion')}>
                Manage Applications
              </Button>
            </Card>

            <Card padding="md" shadow="sm" className="overview-portal-card overview-portal-card--wallet">
              <div className="overview-portal-card-head">
                <span className="overview-portal-icon" aria-hidden="true">👜</span>
                <div>
                  <h2 className="overview-portal-title">iFUEL Wallet</h2>
                  <p className="overview-portal-subtitle">Digital fuel payments</p>
                </div>
              </div>
              <div className="overview-portal-meta-row overview-portal-meta-row--wallet">
                <span>Account Status</span>
                <strong>{accountStatus}</strong>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/profile-completion')}>
                View Account
              </Button>
            </Card>
          </div>

          <div className="overview-actions-grid">
            {quickActions.map(({ key, title, subtitle, cta, tone, icon, onClick }) => (
              <Card key={key} padding="md" shadow="sm" className={`overview-action-card overview-action-card--${tone}`}>
                <span className="overview-action-icon" aria-hidden="true">{icon}</span>
                <h3 className="overview-action-title">{title}</h3>
                <p className="overview-action-subtitle">{subtitle}</p>
                <button type="button" className="overview-action-btn" onClick={onClick}>
                  {cta}
                </button>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default OverviewSection;
