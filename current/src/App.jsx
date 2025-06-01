import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation, Navigate} from 'react-router-dom';
import {AppProvider, useAppContext} from './context/AppContext';
import Sidebar from './common/components/Sidebar';
import Header from './common/components/Header';
import Footer from './common/components/Footer';
import TogglePanel from './components/TogglePanel';
import SLSDashboard from './sls/pages/Dashboard';
import DeeperDashboard from './deeper/pages/Dashboard';
import Programs from './common/pages/Programs';
import WorkingCredentials from './sls/pages/WorkingCredentials';
import ProgramCredentials from './sls/pages/ProgramCredentials';
import Telegram from './sls/pages/Telegram';
import TPLS from './sls/pages/TPLS';
import NotFound from './common/pages/NotFound';
import SubmittedCredentials from './sls/pages/SubmittedCredentials';
import DeepExecution from './deeper/pages/DeepExecution';
import DeepVisualRecon from './deeper/pages/VisualRecon';
import SLSExecution from './sls/pages/SLSExecution';
import DeeperRegistry from './deeper/pages/DeeperRegistry';
import SubdomainsAndUrls from './deeper/pages/SubdomainsAndUrls';
import ASNAndCIDR from './deeper/pages/ASNAndCIDR';
import { PaginationProvider } from './context/PaginationContext';
import PaginationBar from './common/components/PaginationBar';
import './styles/variables.css';
import './styles/components.css';

// Move AppHeader inside Router context
const AppHeader = () => {
    const location = useLocation();

    const pageInfo = {
        '/sls/working-credentials': {name: 'Working Credentials'},
        '/sls/program-credentials': {name: 'Program Credentials'},
        '/sls/telegram': {
            tabs: [
                {name: 'Telegram Channels', id: 'channels'},
                {name: 'Telegram Files', id: 'files'},
            ],
            name: 'Telegram',
        },
        '/sls/tpls': {
            tabs: [
                {name: 'TPLS Services', id: 'tpls'},
                {name: 'TPLS Categories', id: 'categories'},
            ],
            name: 'TPLS',
        },
        '/sls/slsExecution': {name: 'Launcher'},
        '/deeper/asn': {name: 'ASN'},
        '/deeper/cidr': {name: 'CIDR'},
        '/deeper/deep-execution': {name: 'Deep Launcher'},
        '/deeper/visual-recon': {name: 'Deep Visual Recon'},
        '/deeper/rdap': {name: 'RDAP'},
        '/deeper/subdomains': {name: 'Subdomains'},
        '/deeper/urls': {name: 'URLs'},
        '/deeper/whois': {name: 'Whois'},
        '/programs': {
            tabs: [
                {name: 'Programs', id: 'programs'},
                {name: 'Apex Domains', id: 'apexDomains'},
            ],
            name: 'Programs',
        },
        '/': {name: 'Dashboard'},
    };

    const currentPage = pageInfo[location.pathname] || {name: 'Not Found'};

    return (
        <Header
            icon={currentPage.icon}
            pageName={currentPage.name}
            tabs={currentPage.tabs}
            activeTab={location.state?.activeTab}
        />
    );
};

const slsPages = {
    'working-credentials': <WorkingCredentials/>,
    'program-credentials': <ProgramCredentials/>,
    'telegram': <Telegram/>,
    'tpls': <TPLS/>,
    slsExecution: <SLSExecution/>,
};

const deeperPages = {
    asn: <ASNAndCIDR/>,
    cidr: <ASNAndCIDR/>,
    subdomains: <SubdomainsAndUrls/>,
    urls: <SubdomainsAndUrls/>,
    deepExecution: <DeepExecution/>,
    deepVisualRecon: <DeepVisualRecon/>,
};

const MainDashboard = () => {
    const {activeApp} = useAppContext();
    return activeApp === 'sls' ? <SLSDashboard/> : <DeeperDashboard/>;
};

// New component to handle content inside Router
const AppContent = () => {
    const {activeApp} = useAppContext();
    const location = useLocation();

    const pageInfo = {
        '/sls/working-credentials': {name: 'Working Credentials'},
        '/sls/program-credentials': {name: 'Program Credentials'},
        '/sls/telegram': {
            tabs: [
                {name: 'Telegram Channels', id: 'channels'},
                {name: 'Telegram Files', id: 'files'},
            ],
            name: 'Telegram',
        },
        '/sls/tpls': {
            tabs: [
                {name: 'TPLS Services', id: 'tpls'},
                {name: 'TPLS Categories', id: 'categories'},
            ],
            name: 'TPLS',
        },
        '/sls/slsExecution': {name: 'Launcher'},
        '/deeper/asn': {name: 'ASN'},
        '/deeper/cidr': {name: 'CIDR'},
        '/deeper/deep-execution': {name: 'Launcher'},
        '/deeper/visual-recon': {name: 'Visual Recon'},
        '/deeper/rdap': {name: 'RDAP'},
        '/deeper/subdomains': {name: 'Subdomains'},
        '/deeper/urls': {name: 'URLs'},
        '/deeper/whois': {name: 'Whois'},
        '/programs': {
            tabs: [
                {name: 'Programs', id: 'programs'},
                {name: 'Apex Domains', id: 'apexDomains'},
            ],
            name: 'Programs',
        },
        '/': {name: 'Dashboard'},
    };

    const currentPage = pageInfo[location.pathname] || {name: 'Not Found'};

    useEffect(() => {
        const favicon = document.getElementById('favicon');
        if (favicon) {
            favicon.href = activeApp === 'deeper' ? '/favicon-deeper.ico' : '/favicon-sls.ico';
        }
        const appName = activeApp === 'deeper' ? 'Deeplike' : 'SLS';
        document.title = `${appName} - ${currentPage.name}`;
    }, [activeApp, location.pathname]);

    return (
        <div className="app w-100 h-100">
            <Sidebar/>
            <div className="main-content">
                <AppHeader/>
                <Routes>
                    <Route path="/" element={<MainDashboard/>}/>
                    <Route path="/sls-dashboard" element={<SLSDashboard/>}/>
                    <Route path="/deeper-dashboard" element={<DeeperDashboard/>}/>
                    <Route path="/deeper/deep-execution" element={<DeepExecution/>}/>
                    <Route path="/deeper/visual-recon" element={<DeepVisualRecon/>}/>
                    <Route path="/sls/slsExecution" element={<SLSExecution/>}/>
                    <Route path="/sls/credentials" element={<Navigate to="/sls/credentials/program" replace/>}/>
                    <Route path="/sls/credentials/program" element={<ProgramCredentials/>}/>
                    <Route path="/sls/credentials/working" element={<WorkingCredentials/>}/>
                    <Route path="/sls/credentials/submitted" element={<SubmittedCredentials/>}/>
                    <Route
                        path="/sls/:page"
                        element={<TogglePanel slsPages={slsPages} deeperPages={deeperPages}/>} 
                    />
                    <Route
                        path="/deeper/asn-cidr"
                        element={<ASNAndCIDR/>}
                    />
                    <Route path="/deeper/deep-execution" element={<DeepExecution/>}/>
                    <Route path="/deeper/visual-recon" element={<DeepVisualRecon/>}/>
                    <Route path="/deeper/registry" element={<DeeperRegistry/>}/>
                    <Route path="/programs" element={<Programs/>}/>
                    <Route path="/deeper/subdomains" element={<SubdomainsAndUrls/>}/>
                    <Route path="/deeper/urls" element={<SubdomainsAndUrls/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
                <Footer/>
                <PaginationBar/>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AppProvider>
            <PaginationProvider>
                <Router>
                    <AppContent/>
                </Router>
            </PaginationProvider>
        </AppProvider>
    );
};

export default App;