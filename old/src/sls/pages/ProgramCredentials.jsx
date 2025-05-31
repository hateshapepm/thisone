import MetricCard from '../../common/components/MetricCard';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clipboard, Edit, Trash2 } from 'lucide-react';
import * as Hooks from '../../hooks';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import Header from '../../common/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTableData } from '../../common/hooks/useTableData';
import { fetchProgramCredentials, fetchProgramCredentialMetrics } from '../../api/apiService';
import { programCredentialsColumns } from '../../common/tableConfigs/programCredentials';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';

const credentialTabs = [
    {id: 'program', name: 'Program Credentials', path: '/sls/credentials/program'},
    {id: 'working', name: 'Working Credentials', path: '/sls/credentials/working'},
    {id: 'submitted', name: 'Submitted Credentials', path: '/sls/credentials/submitted'},
];

const ProgramCredentials = () => {
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const [metrics, setMetrics] = useState(() => {
        const cached = localStorage.getItem('sls_program_credential_metrics');
        return cached ? JSON.parse(cached) : {
            total_program_credentials: 0,
            active_credentials: 0,
            verified_credentials: 0,
            unviewed_credentials: 0,
            flagged_credentials: 0,
            new_today: 0,
            recently_added: 0,
            recently_used: 0,
        };
    });

    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
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

    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = credentialTabs.find(tab => location.pathname.endsWith(tab.id))?.id || 'program';

    const handleTabClick = (tabId) => {
        const tab = credentialTabs.find(t => t.id === tabId);
        if (tab) navigate(tab.path);
    };

    const copyToClipboard = useCallback((text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => showNotification('Copied to clipboard!'))
            .catch(error => {
                console.error('Error copying to clipboard:', error);
                showNotification('Failed to copy to clipboard', true);
            });
    }, []);

    const copyLoginInfo = useCallback((username, password) => {
        const loginInfo = `${username}:${password}`;
        copyToClipboard(loginInfo);
    }, [copyToClipboard]);

    const columns = useMemo(
        () => [
            {
                Header: 'Program',
                accessor: 'program',
                Cell: ({row}) => (
                    <ProgramWithLogo
                        programName={row.original.program}
                        platformName={row.original.platform_name}
                    />
                ),
            },
            {
                Header: 'Email Apex',
                accessor: 'email_apex',
                Cell: ({value}) => <span>{value || 'N/A'}</span>,
            },
            {
                Header: 'Login Domain',
                accessor: 'login_domain',
                Cell: ({value}) => <span>{value || 'N/A'}</span>,
            },
            {
                Header: 'Email Address',
                accessor: 'email',
                Cell: ({value}) => (
                    <div className="copy-cell">
                        <span>{value || 'N/A'}</span>
                        <button
                            className="copy-btn"
                            onClick={() => copyLoginInfo(value, '')}
                            title="Copy email"
                        >
                            <Clipboard size={14}/>
                        </button>
                    </div>
                ),
            },
            {
                Header: 'Password',
                accessor: 'password',
                Cell: ({value}) => (
                    <div className="copy-cell">
                        <span>{value || 'N/A'}</span>
                        <button
                            className="copy-btn"
                            onClick={() => copyLoginInfo('', value)}
                            title="Copy password"
                        >
                            <Clipboard size={14}/>
                        </button>
                    </div>
                ),
            },
            {
                Header: 'Actions',
                Cell: ({row}) => {
                    return (
                        <div className="actions-cell">
                            <button
                                className="copy-btn mr-6"
                                onClick={() => copyLoginInfo(row.original.email, row.original.password)}
                                title="Copy login info"
                            >
                                <Clipboard size={14}/>
                            </button>
                            <button
                                className="edit-btn mr-6"
                                onClick={() => openEditModal(row.original)}
                                title="Edit credential"
                            >
                                <Edit size={14}/>
                            </button>
                            <button
                                className="delete-btn mr-6"
                                onClick={() => openDeleteModal(row.original)}
                                title="Delete credential"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    );
                },
            },
        ], [copyLoginInfo, copyToClipboard]
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const {
        data: credentials,
        loading,
        totalPages,
        totalItems,
    } = useTableData(fetchProgramCredentials, {
        page: currentPage,
        perPage,
        search: searchTerm,
        refreshFlag,
    });

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('credentialSearchButton');

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const openAddModal = () => setShowAddModal(true);

    const openEditModal = (credential) => {
        setEditingCredential({...credential});
        setShowEditModal(true);
    };

    const openDeleteModal = (credential) => {
        setCredentialToDelete(credential);
        setShowDeleteModal(true);
    };

    const handleNewCredentialChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewCredential(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
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
    useEscapeToClose(showVerifyModal, () => setShowVerifyModal(false));

    useEffect(() => {
        document.title = 'SLS - Program Credentials';
        // Fetch metrics on mount
        fetchProgramCredentialMetrics().then(data => {
            setMetrics(data);
            localStorage.setItem('sls_program_credential_metrics', JSON.stringify(data));
        });
    }, []);

    // Fetch metrics after add/edit/delete
    const refreshMetrics = () => {
        fetchProgramCredentialMetrics().then(data => {
            setMetrics(data);
            localStorage.setItem('sls_program_credential_metrics', JSON.stringify(data));
        });
    };

    // Update metrics after relevant actions
    useEffect(() => {
        refreshMetrics();
    }, [refreshFlag]);

    const handleSearch = () => {
        setCurrentPage(1);
        setRefreshFlag(f => !f);
    };

    const reload = () => setRefreshFlag(f => !f);

    const handleAddCredential = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/sls/program-credentials', {
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
            const response = await fetch(`/api/sls/program-credentials/${editingCredential.id}`, {
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

    const handleDeleteCredential = async () => {
        try {
            const response = await fetch(`/api/sls/program-credentials/${credentialToDelete.id}`, {
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

    const handleAddToWorking = async (credential) => {
        try {
            const response = await fetch('/api/sls/working-credentials', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    program: credential.program,
                    email_apex: credential.email_apex,
                    login_domain: credential.login_domain,
                    email: credential.email,
                    password: credential.password,
                    verified: credential.verified,
                }),
            });
            if (!response.ok) throw new Error('Failed to add to Working');
            showNotification('Added to Working!');
        } catch (err) {
            showNotification('Error adding to Working', true);
        }
    };

    const handleAddToWorkingAndSubmitted = async (credential) => {
        try {
            // 1. Add to Working
            const workingRes = await fetch('/api/sls/working-credentials', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    program: credential.program,
                    email_apex: credential.email_apex,
                    login_domain: credential.login_domain,
                    email: credential.email,
                    password: credential.password,
                    verified: credential.verified,
                }),
            });
            if (!workingRes.ok) throw new Error('Failed to add to Working');
            const workingData = await workingRes.json();
            // 2. Add to Submitted (using the new working credential's ID)
            const submittedRes = await fetch('/api/sls/submitted-credentials', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    fk_credentials_id: workingData.id || workingData.working_credentials_id,
                    // Add other fields as needed
                }),
            });
            if (!submittedRes.ok) throw new Error('Failed to add to Submitted');
            showNotification('Added to Working & Submitted!');
        } catch (err) {
            showNotification('Error adding to Working & Submitted', true);
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
                    <MetricCard title="Total" value={metrics.total_program_credentials}/>
                    <MetricCard title="Recently Used" value={metrics.recently_used}/>
                    <MetricCard title="Flagged" value={metrics.flagged_credentials}/>
                    <MetricCard title="Unviewed" value={metrics.unviewed_credentials}/>
                    <MetricCard title="Recently Added" value={metrics.recently_added}/>
                    <MetricCard title="New" value={metrics.new_today}/>
                </div>

                <div className="page-search">
                    <input
                        type="text"
                        id="credentialSearchInput"
                        className="filter-input"
                        placeholder="Search program credentials..."
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
                        onClick={() => handleButtonClick('credentialRefreshButton', () => reload())}
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
                </div>
                <div className="programs-table">
                    <DataTable
                        columns={programCredentialsColumns}
                        data={credentials}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        setPerPage={setPerPage}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onSearch={handleSearch}
                        copyLoginInfo={copyLoginInfo}
                        onAdd={openAddModal}
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
                        title="Add Program Credential"
                        ariaLabel="Add Program Credential Modal"
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
                        title="Edit Program Credential"
                        ariaLabel="Edit Program Credential Modal"
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

                {/* Delete Credential Modal */}
                {showDeleteModal && credentialToDelete && (
                    <Modal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        title="Delete Program Credential"
                        ariaLabel="Delete Program Credential Modal"
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
                                    onClick={handleDeleteCredential}
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

export default ProgramCredentials;