import React, { useState } from 'react';
import CredentialsTabs from '../components/CredentialsTabs';
import CredentialsTable from '../components/CredentialsTable';

const Credentials = () => {
  const [activeTab, setActiveTab] = useState('program');

  return (
    <div className="p-24">
      <h1>Credentials</h1>
      <CredentialsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-24">
        <CredentialsTable type={activeTab} />
      </div>
    </div>
  );
};

export default Credentials; 