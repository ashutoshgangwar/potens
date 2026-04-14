import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const OverviewSection = ({
  user,
  navigate,
  loadingProfile,
  profileCompletion,
  stats,
  recentActivity,
}) => {
  const completionButtonVariant =
    profileCompletion >= 100 ? 'success' : profileCompletion >= 50 ? 'warning' : 'danger';

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-copy">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.name || 'Partner'}</strong>! Track your profile here.
          </p>
        </div>
        <div className="header-actions-wrap">
          <div className="header-actions">
            <Button
              variant={completionButtonVariant}
              size="sm"
              onClick={() => navigate('/profile-completion')}
              disabled={profileCompletion >= 100}
            >
              {profileCompletion < 100 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : null}
              {profileCompletion >= 100 ? 'Profile Completed' : 'Complete Pending Details'}
            </Button>
          </div>
        </div>
      </header>

      <Card padding="md" shadow="sm" className="theme-progress-card">
        <div className="theme-progress-head">
          <div>
            <p className="theme-progress-kicker">Theme Screen Progress</p>
            <h2 className="card-section-title">Your onboarding completion journey</h2>
            <p className="dashboard-subtitle">
              {profileCompletion >= 100 ? 'Profile Completed' : 'Profile In Progress'}
            </p>
          </div>
          <span className="theme-progress-value">{profileCompletion}%</span>
        </div>
        <div
          className="theme-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={profileCompletion}
          aria-label="Theme completion progress"
        >
          <div className="theme-progress-fill" style={{ width: `${profileCompletion}%` }} />
        </div>
      </Card>

      {loadingProfile ? (
        <Card padding="md" shadow="sm">
          <p className="dashboard-subtitle">Loading partner profile details...</p>
        </Card>
      ) : (
        <>
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

          <div className="dashboard-grid">
            <Card
              padding="none"
              shadow="sm"
              header={
                <div className="card-header-row">
                  <h2 className="card-section-title">Profile Activity</h2>
                  <button className="view-all-btn" onClick={() => navigate('/profile-completion')}>
                    Manage profile
                  </button>
                </div>
              }
              className="activity-card"
            >
              <ul className="activity-list">
                {recentActivity.map(({ user: profileUser, action, time, avatar }) => (
                  <li key={`${profileUser}-${time}`} className="activity-item">
                    <div className="avatar">{avatar}</div>
                    <div className="activity-info">
                      <p className="activity-user">{profileUser}</p>
                      <p className="activity-action">{action}</p>
                    </div>
                    <span className="activity-time">{time}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  );
};

export default OverviewSection;
