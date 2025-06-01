// src/common/components/Header.jsx
import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useAppContext} from '../../context/AppContext';
import '../../styles/components.css';

const Header = ({icon, pageName, tabs, activeTab, onTabClick}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {activeApp, setActiveApp} = useAppContext();

    const handleTabClick = (tabId) => {
        navigate(location.pathname, {state: {activeTab: tabId}});
    };

    return (
        <header className="header">
            <div className="header-left">
                {tabs ? (
                    <div className="header-tabs">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`header-tab${activeTab === tab.id ? ' active' : ''}`}
                                tabIndex={0}
                                aria-label={tab.name}
                                onClick={() => (onTabClick ? onTabClick(tab.id) : handleTabClick(tab.id))}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') (onTabClick ? onTabClick(tab.id) : handleTabClick(tab.id));
                                }}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="header-tab active">{pageName}</div>
                )}
            </div>
            <div className="header-right">
                <div className="app-selector">
                    <select
                        value={activeApp}
                        onChange={(e) => {
                            const newApp = e.target.value;
                            setActiveApp(newApp);
                            const defaultPage = newApp === 'sls' ? 'working-credentials' : 'asn';
                            navigate(`/${newApp}/${defaultPage}`);
                        }}
                        aria-label="Select App"
                    >
                        <option value="sls">sls</option>
                        <option value="deeper">deeper</option>
                    </select>
                </div>
            </div>
        </header>
    );
};

export default Header;