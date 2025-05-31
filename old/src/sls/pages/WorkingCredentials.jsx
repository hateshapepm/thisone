// ~/my/codes/deeplike/src/sls/pages/WorkingCredentials.jsx
import React, { useState, useEffect, useMemo } from 'react';
import MetricCard from '../../common/components/MetricCard';
import { fetchWorkingCredentials, fetchPrograms, fetchWorkingCredentialsMetrics } from '../../api/apiService';
import * as Hooks from '../../hooks';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import Header from '../../common/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTableData } from '../../common/hooks/useTableData';
import { workingCredentialsColumns, workingCredentialsColumnsWithBulk } from '../../common/tableConfigs/workingCredentials';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';

const credentialTabs = [
    {id: 'program', name: 'Program Credentials', path: '/sls/credentials/program'},
    {id: 'working', name: 'Working Credentials', path: '/sls/credentials/working'},
    {id: 'submitted', name: 'Submitted Credentials', path: '/sls/credentials/submitted'},
];

const WorkingCredentials = () => {
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);
    const [credentialToDelete, setCredentialToDelete] = useState(null);
    const [newCredential, setNewCredential] = useState({
        program: '',
        email_apex: '',
        login_domain: '',
        email: '',
        password: '',
        verified: 0,
    });

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('credentialSearchButton');

    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = credentialTabs.find(tab => location.pathname.endsWith(tab.id))?.id || 'working';

    const handleTabClick = (tabId) => {
        const tab = credentialTabs.find(t => t.id === tabId);
        if (tab) navigate(tab.path);
    };

    const [selectedRows, setSelectedRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const {
        data: credentials,
        loading,
        totalPages,
        totalItems,
    } = useTableData(fetchWorkingCredentials, {
        page: currentPage,
        perPage,
        search: searchTerm,
        refreshFlag,
    });

    const [bulkMoveMode, setBulkMoveMode] = useState(false);

    const columns = useMemo(
        () => bulkMoveMode
            ? workingCredentialsColumnsWithBulk(bulkMoveMode, selectedRows, credentials, setSelectedRows)
            : workingCredentialsColumns,
        [bulkMoveMode, selectedRows, credentials]
    );

    const [workingCredentialMetrics, setWorkingCredentialMetrics] = useState(() => {
        const cached = localStorage.getItem('sls_working_credential_metrics');
        return cached ? JSON.parse(cached) : {
            total_working: 0,
            verified_working: 0,
            submitted_working: 0,
            recently_added: 0,
            active_working: 0,
            expires_soon: 0,
            recently_used: 0,
            shared_credentials: 0,
        };
    });

    // Program dropdown state
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
    const [programFilter, setProgramFilter] = useState('');

    useEffect(() => {
        document.title = 'SLS - Working Credentials';
        // Fetch metrics on mount
        fetchWorkingCredentialsMetrics().then(data => {
            setWorkingCredentialMetrics(data);
            localStorage.setItem('sls_working_credential_metrics', JSON.stringify(data));
        });
    }, []);

    // Fetch metrics after add/edit/delete/submit
    const refreshMetrics = () => {
        fetchWorkingCredentialsMetrics().then(data => {
            setWorkingCredentialMetrics(data);
            localStorage.setItem('sls_working_credential_metrics', JSON.stringify(data));
        });
    };

    // Update metrics after relevant actions
    useEffect(() => {
        refreshMetrics();
    }, [refreshFlag]);

    useEffect(() => {
        if (showAddModal) {
            setProgramsLoading(true);
            fetchPrograms(1, 1000, programFilter)
                .then(res => {
                    // API returns {data: [...], ...} or just [...]
                    setPrograms(res.data || res || []);
                })
                .catch(() => setPrograms([]))
                .finally(() => setProgramsLoading(false));
        }
    }, [showAddModal, programFilter]);

    const copyToClipboard = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => showNotification('Copied to clipboard!'))
            .catch(error => {
                console.error('Error copying to clipboard:', error);
                showNotification('Failed to copy to clipboard', true);
            });
    };

    const copyLoginInfo = (username, password) => {
        const loginInfo = `${username}:${password}`;
        copyToClipboard(loginInfo);
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleNewCredentialChange = (e) => {
        const {name, value, type, checked} = e.target;
        if (name === 'email') {
            const apex = value.includes('@') ? value.split('@')[1] : '';
            setNewCredential(prev => ({
                ...prev,
                email: value,
                email_apex: apex,
            }));
        } else {
            setNewCredential(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
            }));
        }
    };

    const handleEditCredentialChange = (e) => {
        const {name, value, type, checked} = e.target;
        setEditingCredential(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    // Register Escape key to close modals
    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showEditModal, () => setShowEditModal(false));
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));

    const openAddModal = () => {
        setShowAddModal(true);
    };

    const openEditModal = (credential) => {
        setEditingCredential({...credential});
        setShowEditModal(true);
    };

    const openDeleteModal = (credential) => {
        setCredentialToDelete(credential);
        setShowDeleteModal(true);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setRefreshFlag(f => !f);
    };

    const handleAddCredential = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/sls/working-credentials', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newCredential),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Credential added successfully');
                setShowAddModal(false);
                setNewCredential({program: '', email_apex: '', login_domain: '', email: '', password: '', verified: 0});
                setCurrentPage(1);
                setRefreshFlag(f => !f);
                refreshMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditCredential = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/sls/working-credentials/${editingCredential.working_credentials_id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingCredential),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Credential updated successfully');
                setShowEditModal(false);
                setRefreshFlag(f => !f);
                refreshMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteCredential = async (id) => {
        try {
            const response = await fetch(`/api/sls/working-credentials/${id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Credential deleted successfully');
                setShowDeleteModal(false);
                setCredentialToDelete(null);
                setRefreshFlag(f => !f);
                refreshMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleAddSelectedToSubmitted = async () => {
        try {
            const selectedCredentials = credentials.filter(c =>
                selectedRows.includes(c.working_credentials_id)
            );
            const payload = selectedCredentials.map(c => ({
                fk_credentials_id: c.working_credentials_id,
                // Add other fields as needed for your submitted credentials
            }));
            const response = await fetch('/api/sls/submitted-credentials/batch', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({credentials: payload}),
            });
            if (!response.ok) throw new Error('Failed to add to submitted');
            showNotification('Added to Submitted!');
            setSelectedRows([]);
            refreshMetrics();
        } catch (err) {
            showNotification('Error adding to Submitted', true);
        }
    };

    const handleAddToSubmitted = async (credential) => {
        try {
            const payload = {
                fk_credentials_id: credential.working_credentials_id,
                // Add other fields as needed
            };
            const response = await fetch('/api/sls/submitted-credentials', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to add to submitted');
            showNotification('Added to Submitted!');
            refreshMetrics();
        } catch (err) {
            showNotification('Error adding to Submitted', true);
        }
    };

    return (
        <>
            <Header
                pageName="Credentials"
                tabs={credentialTabs.map(({id, name}) => ({id, name}))}
                activeTab={activeTab}
                onTabClick={handleTabClick}
            />
            <div className="programs-container">
                <div className="programs-metrics">
                    <MetricCard title="Total" value={workingCredentialMetrics.total_working}/>
                    <MetricCard title="Recently Added" value={workingCredentialMetrics.recently_added}/>
                    <MetricCard title="Verified" value={workingCredentialMetrics.verified_working}/>
                    <MetricCard title="Submitted" value={workingCredentialMetrics.submitted_working}/>
                </div>

                <div className="page-search">
                    <input
                        type="text"
                        id="credentialSearchInput"
                        className="filter-input"
                        placeholder="Search working credentials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        id="credentialSearchButton"
                        className={`action-btn ${activeButtonId === 'credentialSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                        onClick={() => handleButtonClick('credentialSearchButton', handleSearch)}
                    >
                        Search
                    </button>
                    <button
                        id="credentialRefreshButton"
                        className={`action-btn ${activeButtonId === 'credentialRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                        onClick={() => handleButtonClick('credentialRefreshButton', () => handleSearch())}
                    >
                        Refresh
                    </button>
                    <button
                        id="addCredentialButton"
                        className={`action-btn ${activeButtonId === 'addCredentialButton' ? 'action-btn-active' : 'action-btn-active'}`}
                        onClick={() => handleButtonClick('addCredentialButton', openAddModal)}
                    >
                        Add Credential
                    </button>
                    <button
                        className="action-btn action-btn-primary"
                        onClick={() => setBulkMoveMode(m => !m)}
                    >
                        {bulkMoveMode ? 'Cancel Bulk Move' : 'Bulk Move'}
                    </button>
                </div>

                {bulkMoveMode && (
                    <button
                        className="action-btn action-btn-primary mb-10"
                        disabled={selectedRows.length === 0}
                        onClick={handleAddSelectedToSubmitted}
                    >
                        Move Selected to Submitted
                    </button>
                )}

                <div className="programs-table">
                    <DataTable
                        columns={columns}
                        data={credentials}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        perPage={perPage}
                        setCurrentPage={setCurrentPage}
                        setPerPage={setPerPage}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onSearch={handleSearch}
                        onAdd={openAddModal}
                        copyToClipboard={copyToClipboard}
                        copyLoginInfo={copyLoginInfo}
                        openEditModal={openEditModal}
                        openDeleteModal={openDeleteModal}
                        loading={loading}
                        noDataText="No credentials available"
                        loadingText="Loading credentials..."
                    />
                </div>

                {/* Add Credential Modal */}
                {showAddModal && (
                    <Modal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        title="Add Working Credential"
                        ariaLabel="Add Working Credential Modal"
                        size="large"
                    >
                        <form onSubmit={handleAddCredential}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program</div>
                                    <input
                                        type="text"
                                        name="program"
                                        value={newCredential.program}
                                        onChange={handleNewCredentialChange}
                                        required
                                        autoComplete="off"
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Email Apex</div>
                                    <input
                                        type="text"
                                        name="email_apex"
                                        value={newCredential.email_apex}
                                        onChange={handleNewCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Login Domain</div>
                                    <input
                                        type="text"
                                        name="login_domain"
                                        value={newCredential.login_domain}
                                        onChange={handleNewCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Email</div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newCredential.email}
                                        onChange={handleNewCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Password</div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={newCredential.password}
                                        onChange={handleNewCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Verified</div>
                                    <input
                                        type="checkbox"
                                        name="verified"
                                        checked={!!newCredential.verified}
                                        onChange={handleNewCredentialChange}
                                        aria-label="Verified"
                                    />
                                </div>
                            </div>
                            <div className="form-actions mt-18">
                                <button
                                    type="button"
                                    className="action-btn action-btn-neutral"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">
                                    Add Credential
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Edit Credential Modal */}
                {showEditModal && editingCredential && (
                    <Modal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        title="Edit Working Credential"
                        ariaLabel="Edit Working Credential Modal"
                        size="large"
                    >
                        <form onSubmit={handleEditCredential}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program</div>
                                    <input
                                        type="text"
                                        name="program"
                                        value={editingCredential.program}
                                        onChange={handleEditCredentialChange}
                                        required
                                        autoComplete="off"
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Email Apex</div>
                                    <input
                                        type="text"
                                        name="email_apex"
                                        value={editingCredential.email_apex}
                                        onChange={handleEditCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Login Domain</div>
                                    <input
                                        type="text"
                                        name="login_domain"
                                        value={editingCredential.login_domain}
                                        onChange={handleEditCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Email</div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editingCredential.email}
                                        onChange={handleEditCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Password</div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={editingCredential.password}
                                        onChange={handleEditCredentialChange}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Verified</div>
                                    <input
                                        type="checkbox"
                                        name="verified"
                                        checked={!!editingCredential.verified}
                                        onChange={handleEditCredentialChange}
                                        aria-label="Verified"
                                    />
                                </div>
                            </div>
                            <div className="form-actions mt-18">
                                <button
                                    type="button"
                                    className="action-btn action-btn-neutral"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Delete Credential Confirmation Modal */}
                {showDeleteModal && credentialToDelete && (
                    <Modal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        title="Delete Working Credential"
                        ariaLabel="Delete Working Credential Modal"
                        size="normal"
                    >
                        <div style={{padding: 24}}>
                            <p>Are you sure you want to delete this credential?</p>
                            <div className="form-actions mt-18">
                                <button
                                    type="button"
                                    className="action-btn action-btn-neutral"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="action-btn action-btn-danger"
                                    onClick={() => handleDeleteCredential(credentialToDelete.working_credentials_id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {notification.visible && (
                    <div className={`notification ${notification.isError ? 'error' : ''}`}>
                        {notification.message}
                    </div>
                )}
            </div>
        </>
    );
};

export default WorkingCredentials;