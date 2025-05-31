import React from 'react';

const tabLabels = {
  program: 'Program Credentials',
  working: 'Working Credentials',
  submitted: 'Submitted Credentials',
};

const CredentialsTabs = ({ activeTab, onTabChange }) => {
  const handleTabClick = (key) => onTabChange(key);
  const handleTabKeyDown = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onTabChange(key);
    }
  };

  return (
    <div className="tabs" style={{ marginBottom: 24, marginTop: 16 }}>
      {Object.entries(tabLabels).map(([key, label]) => (
        <button
          key={key}
          className={`tab${activeTab === key ? ' active' : ''}`}
          aria-label={`Show ${label}`}
          aria-selected={activeTab === key}
          tabIndex={0}
          onClick={() => handleTabClick(key)}
          onKeyDown={e => handleTabKeyDown(e, key)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default CredentialsTabs; 