import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../common/components/Header';
import DataTable from '../../common/components/DataTable';
import MetricCard from '../../common/components/MetricCard';
import { fetchSubmittedCredentials, fetchSubmittedCredentialsMetrics, updateSubmittedCredential, deleteSubmittedCredential, fetchSubmittedCredentialById } from '../../api/apiService';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import { submittedCredentialsColumns } from '../../common/tableConfigs/submittedCredentials';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import Modal from '../../common/components/Modal';

const credentialTabs = [
    {id: 'program', name: 'Program Credentials', path: '/sls/credentials/program'},
    {id: 'working', name: 'Working Credentials', path: '/sls/credentials/working'},
    {id: 'submitted', name: 'Submitted Credentials', path: '/sls/credentials/submitted'},
];

const SubmittedCredentials = () => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({total: 0, current_page: 1, total_pages: 1});
    const [metrics, setMetrics] = useState({
        total: 0,
        submitted: 0,
        accepted: 0,
        total_paid: 0,
        avg_paid: 0,
        new_today: 0
    });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);
    const [credentialToDelete, setCredentialToDelete] = useState(null);
    const [viewCredential, setViewCredential] = useState(null);
    const [newCredential, setNewCredential] = useState({
        fk_credentials_id: '',
        fk_programs_id: '',
        fk_login_domains_id: '',
        fk_platform_id: '',
        submitted: 0,
        accepted: 0,
        amount_paid: '',
        notes: '',
    });
    const [platformOptions, setPlatformOptions] = useState([]);
    const [platformSearch, setPlatformSearch] = useState('');
    const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
    const [loginDomainOptions, setLoginDomainOptions] = useState([]);
    const [loginDomainSearch, setLoginDomainSearch] = useState('');
    const [loginDomainDropdownOpen, setLoginDomainDropdownOpen] = useState(false);
    const [programOptions, setProgramOptions] = useState([]);
    const [programSearch, setProgramSearch] = useState('');
    const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = credentialTabs.find(tab => location.pathname.endsWith(tab.id))?.id || 'submitted';
    const [perPage, setPerPage] = useGlobalPerPage();

    useEffect(() => {
        document.title = 'SLS - Submitted Credentials';
    }, []);

    useEffect(() => {
        loadData(pagination.current_page, perPage, search);
        refreshMetrics();
        // eslint-disable-next-line
    }, [pagination.current_page, perPage, search]);

    useEffect(() => {
        refreshMetrics();
    }, [showAddModal, showEditModal, showDeleteModal]);

    useEffect(() => {
        if (showAddModal && platformDropdownOpen) {
            fetch(`/api/shared/platforms?search=${encodeURIComponent(platformSearch)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Platform fetch response:', data);
                    const options = data.data || data || [];
                    setPlatformOptions(options);
                    console.log('Platform options set:', options);
                });
        }
    }, [showAddModal, platformSearch, platformDropdownOpen]);

    useEffect(() => {
        if (showAddModal && loginDomainDropdownOpen) {
            fetch(`/api/shared/apex-domains?search=${encodeURIComponent(loginDomainSearch)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Login Domain fetch response:', data);
                    const options = data.data || data || [];
                    setLoginDomainOptions(options);
                    console.log('Login Domain options set:', options);
                });
        }
    }, [showAddModal, loginDomainSearch, loginDomainDropdownOpen]);

    useEffect(() => {
        if (showAddModal && programDropdownOpen) {
            fetch(`/api/shared/programs?search=${encodeURIComponent(programSearch)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Program fetch response:', data);
                    const options = data.data || data || [];
                    setProgramOptions(options);
                    console.log('Program options set:', options);
                });
        }
    }, [showAddModal, programSearch, programDropdownOpen]);

    const loadData = async (page = 1, limit = 10, search = '') => {
        setLoading(true);
        try {
            const res = await fetchSubmittedCredentials(page, limit, search);
            setData(res.data);
            setPagination(res.pagination);
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleTabClick = (tabId) => {
        const tab = credentialTabs.find(t => t.id === tabId);
        if (tab) navigate(tab.path);
    };

    const handleEdit = (row) => {
        setEditingCredential({...row});
        setShowEditModal(true);
    };

    const handleDelete = (row) => {
        setCredentialToDelete(row);
        setShowDeleteModal(true);
    };

    const handleView = async (row) => {
        try {
            const cred = await fetchSubmittedCredentialById(row.id);
            setViewCredential(cred);
            setShowViewModal(true);
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSubmittedCredential(editingCredential.id, editingCredential);
            setShowEditModal(false);
            showNotification('Credential updated successfully');
            loadData(pagination.current_page, perPage, search);
            refreshMetrics();
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            await deleteSubmittedCredential(credentialToDelete.id);
            setShowDeleteModal(false);
            showNotification('Credential deleted successfully');
            loadData(pagination.current_page, perPage, search);
            refreshMetrics();
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            // You need to implement the backend POST route for this to work
            const response = await fetch('/api/sls/submitted-credentials', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newCredential),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            setShowAddModal(false);
            showNotification('Credential added successfully');
            setNewCredential({
                fk_credentials_id: '',
                fk_programs_id: '',
                fk_login_domains_id: '',
                fk_platform_id: '',
                submitted: 0,
                accepted: 0,
                amount_paid: '',
                notes: '',
            });
            loadData(1, perPage, search);
            refreshMetrics();
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        loadData(1, newPerPage, search);
    };

    const columns = useMemo(() => [
        {Header: 'Email', accessor: 'email'},
        {Header: 'Program', accessor: 'program'},
        {Header: 'Login Domain', accessor: 'login_domain'},
        {Header: 'Platform', accessor: 'platform_name'},
        {Header: 'Submitted', accessor: 'submitted'},
        {Header: 'Accepted', accessor: 'accepted'},
        {Header: 'Amount Paid', accessor: 'amount_paid'},
        {Header: 'Notes', accessor: 'notes'},
        {Header: 'Created', accessor: 'created_at'},
        {
            Header: 'Actions',
            Cell: ({row}) => (
                <div className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEdit(row.original)} title="Edit credential"><Edit
                        size={14}/></button>
                    <button className="delete-btn" onClick={() => handleDelete(row.original)} title="Delete credential">
                        <Trash2 size={14}/></button>
                    <button className="view-btn" onClick={() => handleView(row.original)} title="View credential"><Eye
                        size={14}/></button>
                </div>
            ),
        },
    ], [pagination.current_page, perPage, search]);

    // Helper to refresh metrics
    const refreshMetrics = () => {
        fetchSubmittedCredentialsMetrics().then(setMetrics);
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
                    <MetricCard title="Total" value={metrics.total}/>
                    <MetricCard title="Submitted" value={metrics.submitted}/>
                    <MetricCard title="Accepted" value={metrics.accepted}/>
                    <MetricCard title="Total" value={metrics.total_paid}/>
                    <MetricCard title="Average" value={metrics.avg_paid}/>
                    <MetricCard title="New" value={metrics.new_today}/>
                </div>
                <div className="page-search">
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Search submitted credentials..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && loadData(1, perPage, search)}
                    />
                    <button className="action-btn action-btn-active"
                            onClick={() => loadData(1, perPage, search)}>Search
                    </button>
                    <button className="action-btn action-btn-active"
                            onClick={() => loadData(pagination.current_page, perPage, search)}>Refresh
                    </button>
                    <button className="action-btn action-btn-active" onClick={() => setShowAddModal(true)}>Add
                        Credential
                    </button>
                </div>
                <div className="programs-table">
                    <DataTable
                        columns={submittedCredentialsColumns}
                        data={data}
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        totalItems={pagination.total}
                        perPage={perPage}
                        onPageChange={page => loadData(page, perPage, search)}
                        onPerPageChange={handlePerPageChange}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleView={handleView}
                        loading={loading}
                        noDataText="No submitted credentials found."
                    />
                </div>
                {/* Add Credential Modal */}
                {showAddModal && (
                    <Modal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        title="Add Submitted Credential"
                        ariaLabel="Add Submitted Credential Modal"
                        size="large"
                    >
                        <form onSubmit={handleAddSubmit}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program ID</div>
                                    <input
                                        type="text"
                                        name="fk_programs_id"
                                        value={newCredential.fk_programs_id}
                                        onChange={e => setNewCredential(prev => ({...prev, fk_programs_id: e.target.value}))}
                                        required
                                        autoComplete="off"
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Login Domain ID</div>
                                    <input
                                        type="text"
                                        name="fk_login_domains_id"
                                        value={newCredential.fk_login_domains_id}
                                        onChange={e => setNewCredential(prev => ({...prev, fk_login_domains_id: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Platform ID</div>
                                    <input
                                        type="text"
                                        name="fk_platform_id"
                                        value={newCredential.fk_platform_id}
                                        onChange={e => setNewCredential(prev => ({...prev, fk_platform_id: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Amount Paid</div>
                                    <input
                                        type="number"
                                        name="amount_paid"
                                        value={newCredential.amount_paid}
                                        onChange={e => setNewCredential(prev => ({...prev, amount_paid: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Notes</div>
                                    <input
                                        type="text"
                                        name="notes"
                                        value={newCredential.notes}
                                        onChange={e => setNewCredential(prev => ({...prev, notes: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
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
                        title="Edit Submitted Credential"
                        ariaLabel="Edit Submitted Credential Modal"
                        size="large"
                    >
                        <form onSubmit={handleEditSubmit}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program ID</div>
                                    <input
                                        type="text"
                                        name="fk_programs_id"
                                        value={editingCredential.fk_programs_id}
                                        onChange={e => setEditingCredential(prev => ({...prev, fk_programs_id: e.target.value}))}
                                        required
                                        autoComplete="off"
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Login Domain ID</div>
                                    <input
                                        type="text"
                                        name="fk_login_domains_id"
                                        value={editingCredential.fk_login_domains_id}
                                        onChange={e => setEditingCredential(prev => ({...prev, fk_login_domains_id: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Platform ID</div>
                                    <input
                                        type="text"
                                        name="fk_platform_id"
                                        value={editingCredential.fk_platform_id}
                                        onChange={e => setEditingCredential(prev => ({...prev, fk_platform_id: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Amount Paid</div>
                                    <input
                                        type="number"
                                        name="amount_paid"
                                        value={editingCredential.amount_paid}
                                        onChange={e => setEditingCredential(prev => ({...prev, amount_paid: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Notes</div>
                                    <input
                                        type="text"
                                        name="notes"
                                        value={editingCredential.notes}
                                        onChange={e => setEditingCredential(prev => ({...prev, notes: e.target.value}))}
                                        style={{width: '100%'}}
                                        autoComplete="off"
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
                        title="Delete Submitted Credential"
                        ariaLabel="Delete Submitted Credential Modal"
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
                                    onClick={handleDeleteSubmit}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
                {/* View Credential Modal */}
                {showViewModal && viewCredential && (
                    <Modal
                        isOpen={showViewModal}
                        onClose={() => setShowViewModal(false)}
                        title="View Submitted Credential"
                        ariaLabel="View Submitted Credential Modal"
                        size="large"
                    >
                        <div style={{padding: 24}}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program ID</div>
                                    <div className="view-value">{viewCredential.fk_programs_id}</div>
                                </div>
                                <div>
                                    <div className="view-label">Login Domain ID</div>
                                    <div className="view-value">{viewCredential.fk_login_domains_id}</div>
                                </div>
                                <div>
                                    <div className="view-label">Platform ID</div>
                                    <div className="view-value">{viewCredential.fk_platform_id}</div>
                                </div>
                                <div>
                                    <div className="view-label">Amount Paid</div>
                                    <div className="view-value">{viewCredential.amount_paid}</div>
                                </div>
                                <div>
                                    <div className="view-label">Notes</div>
                                    <div className="view-value">{viewCredential.notes}</div>
                                </div>
                            </div>
                            <div className="form-actions mt-18">
                                <button
                                    type="button"
                                    className="action-btn action-btn-neutral"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
                {notification.visible && (
                    <div className={`notification ${notification.isError ? 'error' : ''}`}>{notification.message}</div>
                )}
            </div>
        </>
    );
};

export default SubmittedCredentials; 