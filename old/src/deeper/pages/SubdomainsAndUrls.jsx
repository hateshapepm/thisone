import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../common/components/Header';
import SubdomainManagement from './Subdomains';
import UrlsManagement from './Urls';
import '../../styles/Dashboard.css';

const tabs = [
  { name: 'Subdomains', id: 'subdomains' },
  { name: 'Urls', id: 'urls' },
];

const SubdomainsAndUrls = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.state?.activeTab || 'subdomains';

  const handleTabClick = (tabId) => {
    navigate(location.pathname, { state: { ...location.state, activeTab: tabId } });
  };

  return (
    <div className="programs-container">
      <Header
        pageName={activeTab === 'urls' ? 'Urls' : 'Subdomains'}
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
      />
      <div className="tab-content">
        {activeTab === 'subdomains' && <SubdomainManagement />}
        {activeTab === 'urls' && <UrlsManagement />}
      </div>
    </div>
  );
};

export default SubdomainsAndUrls; 