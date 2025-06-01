import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../common/components/Header';
import RDAPSection from '../sections/RDAPSection';
import WhoisSection from '../sections/WhoisSection';
import PossibleApexDomainsSection from '../sections/PossibleApexDomainsSection';

const tabs = [
    {id: 'rdap', name: 'RDAP'},
    {id: 'whois', name: 'WHOIS'},
    {id: 'apex', name: 'Possible Apex Domains'},
];

const tabTitles = {
    rdap: 'RDAP',
    whois: 'WHOIS',
    apex: 'Possible Apex Domains',
};

const DeeperRegistry = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialTab = location.state?.activeTab || 'rdap';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (location.state?.activeTab && location.state.activeTab !== activeTab) {
            setActiveTab(location.state.activeTab);
        }
        // eslint-disable-next-line
    }, [location.state?.activeTab]);

    useEffect(() => {
        document.title = `Deeplike - ${tabTitles[activeTab] || 'Registry'}`;
    }, [activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        navigate(location.pathname, {state: {...location.state, activeTab: tabId}});
    };

    return (
        <div className="programs-container">
            <Header
                pageName="Deeper Registry"
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={handleTabClick}
            />

            <div className={"tab-content active"}>
                {activeTab === 'rdap' && (
                    <RDAPSection />
                )}
                {activeTab === 'whois' && (
                    <WhoisSection />
                )}
                {activeTab === 'apex' && (
                    <PossibleApexDomainsSection />
                )}
            </div>
        </div>
    );
};

export default DeeperRegistry; 