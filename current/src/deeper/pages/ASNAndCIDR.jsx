import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../common/components/Header';
import ASNManagement from './ASN';
import CIDRManagement from './CIDR';
import '../../styles/Dashboard.css';

const tabs = [
  { name: 'ASN', id: 'asn' },
  { name: 'CIDR Ranges', id: 'cidr' },
];

const ASNAndCIDR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.state?.activeTab || 'asn';

  const handleTabClick = (tabId) => {
    navigate(location.pathname, { state: { ...location.state, activeTab: tabId } });
  };

  return (
    <div className="programs-container">
      <Header
        pageName={activeTab === 'cidr' ? 'CIDR Ranges' : 'ASN'}
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
      />
      <div className="tab-content">
        {activeTab === 'asn' && <ASNManagement />}
        {activeTab === 'cidr' && <CIDRManagement />}
      </div>
    </div>
  );
};

export default ASNAndCIDR; 