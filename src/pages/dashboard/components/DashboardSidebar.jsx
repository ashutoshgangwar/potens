import React from 'react';
import { Button } from '../../../components/ui/index.js';

const DashboardSidebar = ({ items, activeSection, onSectionChange, user, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 40 40" fill="none" className="sidebar-logo-svg">
          <rect width="40" height="40" rx="10" fill="#4f46e5" />
          <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="8" y="8" width="10" height="10" rx="3" fill="white" fillOpacity="0.8" />
          <rect x="22" y="22" width="10" height="10" rx="3" fill="white" fillOpacity="0.8" />
        </svg>
        <span className="sidebar-logo-text">Potense</span>
      </div>

      <nav className="sidebar-nav">
        {items.map(({ icon, label, key }) => (
          <button
            key={key}
            className={`sidebar-nav-item ${key === activeSection ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => onSectionChange(key)}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar avatar--sm">{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'Admin'}</p>
            <p className="sidebar-user-role">{user?.role || 'Fuel Delivery Partner'}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="logout-btn">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
