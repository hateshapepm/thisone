// ~/my/codes/deeplike/src/sls/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../hooks';
import MetricCard from '../../common/components/MetricCard';
import { fetchAlertCounts, fetchProgramCredentialAlerts, markSLSAlertAsViewed, deleteCredential, fetchTelegramChannelMetrics, fetchTelegramFileMetrics } from '../../api/apiService';
import * as Hooks from "../../hooks";
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import { slsAlertsColumns } from '../../common/tableConfigs/slsAlerts';
import { mapSLSAlerts } from '../../common/utils/dataMappers';
import { useTableData } from '../../common/hooks/useTableData';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/components.css';
import '../../styles/Dashboard.css';

// Reusable VerifyModal component
function VerifyModal({isOpen, credential, submittedToProgram, setSubmittedToProgram, onClose, onSubmit}) {
    const [notes, setNotes] = useState('');
    useEscapeToClose(isOpen, onClose);
    if (!isOpen) return null;
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="modal-close" onClick={onClose}>×</span>
                <h3>Verify Credential</h3>
                <form onSubmit={e => {
                    e.preventDefault();
                    onSubmit(notes, submittedToProgram);
                }}>
                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            placeholder="Add verification notes here..."
                            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="form-group checkbox-group">
                        <button
                            type="button"
                            className={`toggle-btn${submittedToProgram ? ' enabled' : ' disabled'}`}
                            aria-pressed={submittedToProgram}
                            onClick={() => setSubmittedToProgram(prev => !prev)}
                        >
                            Submitted to Program
                        </button>
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="action-btn action-btn-green"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="action-btn action-btn-primary">
                            Verify Credential
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [searchTerm, setSearchTerm] = useState('');
    const [dashboardMetrics, setDashboardMetrics] = useState({
        unviewed_credentials: 0,
        total_credentials: 0,
        program_credentials_count: 0,
        working_credentials: 0,
        active_channels: 0,
        pending_files: 0,
        total_channels: 0,
        total_files: 0,
        processed_files: 0,
    });
    const [verifyModal, setVerifyModal] = useState({
        isOpen: false,
        credentialId: null,
        domain: '',
        program: '',
        loginDomain: '',
    });
    const {notification, showNotification} = useNotification();
    const [submittedToProgram, setSubmittedToProgram] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('dashboardSearchButton');
    useEscapeToClose(verifyModal.isOpen, () => setVerifyModal(v => ({...v, isOpen: false})));

    // Data fetching
    const {data, loading, totalPages, totalItems} = useTableData(fetchProgramCredentialAlerts, {
        page: currentPage,
        perPage,
        search: searchTerm,
        refreshFlag
    });
    const tableData = mapSLSAlerts(data);

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(() => {
            loadMetrics();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const afterAction = (removedId) => {
        loadMetrics();
        setRefreshFlag(f => !f);
    };

    const loadMetrics = async () => {
        try {
            const data = await fetchAlertCounts();
            // Fetch total_channels, total_files, and processed_files from their respective APIs
            const channelMetrics = await fetchTelegramChannelMetrics();
            const fileMetrics = await fetchTelegramFileMetrics();
            setDashboardMetrics({
                unviewed_credentials: data.unviewed_credentials || 0,
                total_credentials: data.total_credentials || 0,
                program_credentials_count: data.program_credentials_count || 0,
                working_credentials: data.working_credentials || 0,
                active_channels: data.active_channels || 0,
                pending_files: data.pending_files || 0,
                total_channels: channelMetrics.total_channels || 0,
                total_files: fileMetrics.total_files || 0,
                processed_files: fileMetrics.processed_files || 0,
            });
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleAck = async (id) => {
        try {
            const result = await markSLSAlertAsViewed(id);
            if (result.success) {
                showNotification('Alert marked as viewed');
                afterAction(id);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteCredential = async (id) => {
        if (!window.confirm('Are you sure you want to delete this credential?')) return;
        try {
            const result = await deleteCredential(id);
            if (result.success) {
                showNotification('Credential deleted');
                afterAction(id);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    // Handle Ignore Apex
    const handleIgnoreApex = async (domain) => {
        if (!window.confirm('Are you sure you want to ignore this apex domain? This will acknowledge all related alerts.')) return;
        try {
            const response = await fetch('/api/sls/ignore-apex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                showNotification(`Apex domain "${result.apex_domain}" ignored and alerts acknowledged.`);
                afterAction();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openVerifyModal = (id, domain, program, loginDomain = '') => {
        setVerifyModal({isOpen: true, credentialId: id, domain, program, loginDomain});
    };

    const handleVerifySubmit = async (notes, submission) => {
        try {
            const response = await fetch(`/api/sls/credentials/${verifyModal.credentialId}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: verifyModal.domain,
                    program: verifyModal.program,
                    login_domain: verifyModal.loginDomain,
                    notes: notes,
                    submission: submission ? 1 : 0,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                showNotification('Credential verified successfully!');
                setVerifyModal(v => ({...v, isOpen: false}));
                afterAction(verifyModal.credentialId);
            } else {
                showNotification('Error: ' + (result.error || 'Unknown error'), true);
                setVerifyModal(v => ({...v, isOpen: false}));
            }
        } catch (error) {
            showNotification('Error: ' + error.message, true);
            setVerifyModal(v => ({...v, isOpen: false}));
        }
    };

    const stripProtocol = (url) => {
        if (!url) return '';
        return url.replace(/^https?:\/\//, '');
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text).catch(() => {
        });
    };

    const handleCopyAndOpen = async (credentials, url, e) => {
        e.preventDefault();
        try {
            await navigator.clipboard.writeText(credentials);
            window.open(url, '_blank');
        } catch (error) {
            showNotification('Failed to copy/open: ' + error.message, true);
        }
    };

    return (
        <div className="sls-dashboard programs-container">
            {/* Metrics */}
            <div className="programs-metrics">
                <MetricCard title="Unviewed Credentials" value={dashboardMetrics.unviewed_credentials}/>
                <MetricCard title="Total Credentials" value={dashboardMetrics.total_credentials}/>
                <MetricCard title="Program Credentials" value={dashboardMetrics.program_credentials_count}/>
                <MetricCard title="Working Credentials" value={dashboardMetrics.working_credentials}/>
                <MetricCard
                    title="Active Channels / Total Channels"
                    value={`${dashboardMetrics.active_channels || 0} / ${dashboardMetrics.total_channels || 0}`}
                    description="Active Telegram channels"
                />
                <MetricCard
                    title="Pending Files / Total Files"
                    value={`${dashboardMetrics.pending_files || 0} / ${dashboardMetrics.total_files || 0}`}
                    description="Files not yet downloaded"
                />
                {/* <MetricCard
                    title="Files to Process / Total Files"
                    value={`${dashboardMetrics.total_files && dashboardMetrics.processed_files !== undefined ? (dashboardMetrics.total_files - dashboardMetrics.processed_files) : 0} / ${dashboardMetrics.total_files || 0}`}
                    description="Files not yet processed"
                /> */}
            </div>

            {/* Search bar */}
            <div className="page-search">
                <input
                    type="text"
                    id="dashboardSearchInput"
                    className="filter-input"
                    placeholder="Search credentials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    id="dashboardSearchButton"
                    className={`action-btn ${activeButtonId === 'dashboardSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('dashboardSearchButton', handleSearch)}
                >
                    Search
                </button>
            </div>

            {/* Alerts table */}
            <div className="programs-table">
                <DataTable
                    columns={slsAlertsColumns}
                    data={tableData}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={setCurrentPage}
                    onPerPageChange={setPerPage}
                    loading={loading}
                    noDataText="No credentials available"
                    loadingText="Loading credentials..."
                    // Pass handlers to column Cell functions
                    handleAck={handleAck}
                    openVerifyModal={openVerifyModal}
                    handleDeleteCredential={handleDeleteCredential}
                    handleIgnoreApex={handleIgnoreApex}
                    stripProtocol={stripProtocol}
                    copyToClipboard={copyToClipboard}
                    handleCopyAndOpen={handleCopyAndOpen}
                    showNotification={showNotification}
                />
            </div>

            {/* Verify Modal */}
            <VerifyModal
                isOpen={verifyModal.isOpen}
                credential={verifyModal}
                submittedToProgram={submittedToProgram}
                setSubmittedToProgram={setSubmittedToProgram}
                onClose={() => setVerifyModal(v => ({...v, isOpen: false}))}
                onSubmit={handleVerifySubmit}
            />

            {/* Notification */}
            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Dashboard;