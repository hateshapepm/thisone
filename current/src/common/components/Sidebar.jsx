import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Home, Database, Shield, MessageSquare, Lock, Wrench, LayoutDashboard, ChevronDown, ChevronRight} from 'lucide-react';
import {useAppContext} from '../../context/AppContext';
import '../../styles/Header.css';
import logoSvg from '../../assets/sls_logo.svg'; // Fallback import as image
import wrenchSvg from '../../assets/deeper_logo.svg'; // Fallback import as image

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const {activeApp} = useAppContext(); // Use shared state
    const [slsOpen, setSlsOpen] = React.useState(true);

    const isActive = (path) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const mainNavItems = [
        { path: '/', icon: <Home size={18} />, label: 'Dashboard' },
        { path: '/dashboard/default', icon: <LayoutDashboard size={18} />, label: 'Default' },
        { path: '/dashboard/analytics', icon: <LayoutDashboard size={18} />, label: 'Analytics' },
        { path: '/dashboard/sls', icon: <LayoutDashboard size={18} />, label: 'SLS' },
        { path: '/dashboard/invoice', icon: <Database size={18} />, label: 'Invoice' },
    ];

    const appNavItems = [
        {path: '/sls/credentials', icon: <Database size={18}/>, label: 'Credentials'},
    ];

    const slsLauncherNavItem = {path: '/sls/slsExecution', icon: <Wrench size={18}/>, label: 'SLS Launcher'};

    const subdomainsNavItems = [
        {path: '/deeper/asn-cidr', icon: <Database size={18}/>, label: 'ASN & CIDR Ranges'},
        {path: '/deeper/subdomains', icon: <Database size={18}/>, label: 'Subdomains & Urls'},
        {path: '/deeper/registry', icon: <Database size={18}/>, label: 'Registry'},
    ];

    const deepLauncherNavItem = {path: '/deeper/deep-execution', icon: <Wrench size={18}/>, label: 'Deep Launcher'};
    const deepVisualReconNavItem = {path: '/deeper/visual-recon', icon: <Wrench size={18}/>, label: 'Deep Visual Recon'};

    const resourcesNavItems = [
        {path: '/programs', icon: <Shield size={18}/>, label: 'Programs'},
        {path: '/sls/telegram', icon: <MessageSquare size={18}/>, label: 'Telegram'},
        {path: '/sls/tpls', icon: <Lock size={18}/>, label: 'TPLS'},
    ];

    // Add dashboard nav items
    const slsNavItems = [
        { path: '/sls-dashboard', icon: <LayoutDashboard size={18} />, label: 'SLS Dashboard', ariaLabel: 'SLS Dashboard' },
        { path: '/sls/credentials/working', icon: <Database size={18} />, label: 'Working Credentials', ariaLabel: 'Working Credentials' },
        { path: '/sls/credentials/program', icon: <Database size={18} />, label: 'Program Credentials', ariaLabel: 'Program Credentials' },
        { path: '/sls/credentials/submitted', icon: <Database size={18} />, label: 'Submitted Credentials', ariaLabel: 'Submitted Credentials' },
        { path: '/sls/telegram', icon: <MessageSquare size={18} />, label: 'Telegram', ariaLabel: 'Telegram' },
        { path: '/sls/tpls', icon: <Lock size={18} />, label: 'TPLS', ariaLabel: 'TPLS' },
        { path: '/sls/slsExecution', icon: <Wrench size={18} />, label: 'SLS Launcher', ariaLabel: 'SLS Launcher' },
    ];

    // Debugging: Log the activeApp value to confirm it's correct
    console.log('activeApp:', activeApp);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img
                        src={activeApp === 'deeper' ? wrenchSvg : logoSvg}
                        alt="logo"
                        className="header-logo"
                        onError={(e) => console.error('Error loading logo:', e)} // Debug if the image fails to load
                    />
                    <span
                        className="sidebar-logo-text"
                        aria-label={activeApp === 'sls' ? 'SLS' : 'Deeper'}
                    >
                        {activeApp === 'sls' ? 'SLS' : 'Deeper'}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {/* Dashboard section always visible */}
                <div className="navigation-section">
                    <div className="navigation-section-title">Dashboards</div>
                    <ul className="nav-list">
                        <li className="nav-list-item">
                            <button
                                className="nav-item"
                                aria-label="Toggle SLS menu"
                                aria-expanded={slsOpen}
                                tabIndex={0}
                                onClick={() => setSlsOpen((open) => !open)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSlsOpen((open) => !open);
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                                <span className="nav-icon"><LayoutDashboard size={18} /></span>
                                <span className="nav-label">SLS</span>
                                <span style={{ marginLeft: 'auto' }}>{slsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                            </button>
                            {slsOpen && (
                                <ul className="nav-list" style={{ paddingLeft: 24 }}>
                                    {slsNavItems.map((item) => (
                                        <li key={item.path} className="nav-list-item">
                                            <Link
                                                to={item.path}
                                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                                tabIndex={0}
                                                aria-label={item.ariaLabel}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        e.target.click();
                                                    }
                                                }}
                                            >
                                                <span className="nav-icon">{item.icon}</span>
                                                <span className="nav-label">{item.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>

                <div className="navigation-section">
                    <div className="navigation-section-title">Main</div>
                    <ul className="nav-list">
                        {mainNavItems.map((item) => (
                            <li key={item.path} className="nav-list-item">
                                <Link to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {activeApp === 'sls' && (
                    <div className="navigation-section">
                        <div className="navigation-section-title">Credentials</div>
                        <ul className="nav-list">
                            {appNavItems.map((item) => (
                                <li key={item.path} className="nav-list-item">
                                    <Link to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                            <li key={slsLauncherNavItem.path} className="nav-list-item">
                                <Link to={slsLauncherNavItem.path} className={`nav-item ${isActive(slsLauncherNavItem.path) ? 'active' : ''}`}>
                                    <span className="nav-icon">{slsLauncherNavItem.icon}</span>
                                    <span className="nav-label">{slsLauncherNavItem.label}</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}

                {activeApp === 'deeper' && (
                    <div className="navigation-section">
                        <div className="navigation-section-title">Recon</div>
                        <ul className="nav-list">
                            {subdomainsNavItems.map((item) => (
                                <li key={item.path} className="nav-list-item">
                                    <Link to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                            <li key={deepLauncherNavItem.path} className="nav-list-item">
                                <Link to={deepLauncherNavItem.path} className={`nav-item ${isActive(deepLauncherNavItem.path) ? 'active' : ''}`}>
                                    <span className="nav-icon">{deepLauncherNavItem.icon}</span>
                                    <span className="nav-label">{deepLauncherNavItem.label}</span>
                                </Link>
                            </li>
                            <li key={deepVisualReconNavItem.path} className="nav-list-item">
                                <Link to={deepVisualReconNavItem.path} className={`nav-item ${isActive(deepVisualReconNavItem.path) ? 'active' : ''}`}>
                                    <span className="nav-icon">{deepVisualReconNavItem.icon}</span>
                                    <span className="nav-label">{deepVisualReconNavItem.label}</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}

                <div className="navigation-section">
                    <div className="navigation-section-title">Resources</div>
                    <ul className="nav-list">
                        {resourcesNavItems
                            .filter((item) => {
                                if (item.path.includes('/sls/')) {
                                    return activeApp === 'sls';
                                }
                                return true;
                            })
                            .map((item) => (
                                <li key={item.path} className="nav-list-item">
                                    <Link to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;