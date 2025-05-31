import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MetricCard from '../../common/components/MetricCard';
import * as Hooks from '../../hooks';
import { copyInfoClipboard } from '../../common/functions';
import { rdapColumns, singularizeType } from '../../common/tableConfigs/rdap';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';

// Add this at the top of the file, after the imports
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #4fc3f7;
  animation: spin 1s linear infinite;
}
`;

// --- Custom hook for RDAP table data and optimistic actions ---
function useRdapTableData() {
    const [rdapData, setRdapData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});
    const [metrics, setMetrics] = useState({orgs: 0, names: 0, emails: 0, addresses: 0, handles: 0, phones: 0});

    const [perPage, setPerPage] = useGlobalPerPage();

    // Fetch metrics
    const fetchMetrics = async () => {
        try {
            const response = await fetch('/api/deeper/rdap-metrics');
            if (!response.ok) throw new Error();
            const m = await response.json();
            setMetrics(m);
        } catch {
        }
    };

    // Fetch table data
    const loadData = async (page = 1, limit = perPage, search = '') => {
        setLoading(true);
        try {
            const response = await fetch(`/api/deeper/rdap?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setRdapData(Array.isArray(data.data) ? data.data : []);
            setCurrentPage(data.pagination?.current_page || 1);
            setTotalPages(data.pagination?.total_pages || 1);
            setTotalItems(data.pagination?.total || 0);
            fetchMetrics();
        } catch {
            setRdapData([]);
        } finally {
            setLoading(false);
        }
    };

    // Optimistic add
    const optimisticAdd = async (item, onSuccess, onError) => {
        // Add to UI instantly
        setRdapData(prev => [{...item, id: 'temp-' + Date.now()}, ...prev]);
        setMetrics(m => ({...m, [item.type]: (m[item.type] || 0) + 1}));
        try {
            const response = await fetch('/api/deeper/rdap', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(item),
            });
            const result = await response.json();
            if (result.success) {
                // Replace temp row with real row
                setRdapData(prev => prev.map(r => (r.id === item.id ? {...result.data} : r)));
                fetchMetrics();
                onSuccess && onSuccess();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            // Rollback
            setRdapData(prev => prev.filter(r => r.id !== item.id));
            setMetrics(m => ({...m, [item.type]: (m[item.type] || 1) - 1}));
            onError && onError(e.message);
        }
    };

    // Optimistic edit
    const optimisticEdit = async (item, onSuccess, onError) => {
        const old = rdapData.find(r => r.id === item.id);
        setRdapData(prev => prev.map(r => (r.id === item.id ? {...r, ...item} : r)));
        try {
            const response = await fetch(`/api/deeper/rdap/${item.type}/${item.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(item),
            });
            const result = await response.json();
            if (result.success) {
                fetchMetrics();
                onSuccess && onSuccess();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            // Rollback
            setRdapData(prev => prev.map(r => (r.id === item.id ? old : r)));
            onError && onError(e.message);
        }
    };

    // Optimistic delete
    const optimisticDelete = async (item, onSuccess, onError) => {
        const old = rdapData.find(r => r.id === item.id);
        setRdapData(prev => prev.filter(r => r.id !== item.id));
        setMetrics(m => ({...m, [item.type]: (m[item.type] || 1) - 1}));
        try {
            const response = await fetch(`/api/deeper/rdap/${item.type}/${item.id}?fk_programs_id=${item.fk_programs_id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            const result = await response.json();
            if (result.success) {
                fetchMetrics();
                onSuccess && onSuccess();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            // Rollback
            setRdapData(prev => [...prev, old]);
            setMetrics(m => ({...m, [item.type]: (m[item.type] || 0) + 1}));
            onError && onError(e.message);
        }
    };

    useEffect(() => {
        loadData(1, perPage, searchTerm);
        // eslint-disable-next-line
    }, []);

    return {
        rdapData,
        setRdapData,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        searchTerm,
        setSearchTerm,
        loading,
        perPage,
        setPerPage,
        expandedRows,
        setExpandedRows,
        metrics,
        loadData,
        optimisticAdd,
        optimisticEdit,
        optimisticDelete,
    };
}

const RDAPManagement = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        rdapData,
        setRdapData,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        searchTerm,
        setSearchTerm,
        loading,
        perPage,
        setPerPage,
        expandedRows,
        setExpandedRows,
        metrics,
        loadData,
        optimisticAdd,
        optimisticEdit,
        optimisticDelete,
    } = useRdapTableData();
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [newItem, setNewItem] = useState({type: '', value: '', fk_programs_id: ''});

    // Programs dropdown states
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Organizations dropdown states
    const [organizations, setOrganizations] = useState([]);
    const [orgsLoading, setOrgsLoading] = useState(false);
    const [orgFilterText, setOrgFilterText] = useState('');
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [createNewOrg, setCreateNewOrg] = useState(false);

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('rdapSearchButton');

    // Register Escape key to close modals
    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showEditModal, () => setShowEditModal(false));
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));

    // Add style to the DOM
    useEffect(() => {
        // Add spinner styles to the document
        const styleEl = document.createElement('style');
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(spinnerStyle));
        document.head.appendChild(styleEl);

        return () => {
            // Clean up on unmount
            document.head.removeChild(styleEl);
        };
    }, []);

    // Flattened table data for expanded rows (WHOIS style)
    const tableData = useMemo(() => {
        return rdapData.flatMap(org => {
            const rows = [{...org, type: 'orgs', value: org.value || org.name || ''}];
            if (expandedRows[org.id]) {
                // Insert a header row for the expanded section
                rows.push({
                    isSectionHeader: true,
                    id: `header-${org.id}`,
                });
                if (org.isLoadingRelated) {
                    rows.push({
                        id: `loading-${org.id}`,
                        type: 'loading',
                        value: '',
                        loading: true
                    });
                } else if (org.related && org.related.length > 0) {
                    rows.push(
                        ...org.related.map(related => ({
                            ...related,
                            program: related.type,
                            type: related.type,
                            value: related.value || '',
                            expander: ''
                        }))
                    );
                } else if (!org.isLoadingRelated && Array.isArray(org.related) && org.related.length === 0) {
                    rows.push({
                        id: `no-data-${org.id}`,
                        type: 'no-data',
                        value: 'No related data found',
                    });
                }
            }
            return rows;
        });
    }, [rdapData, expandedRows]);

    const toggleRow = (orgId, programId) => {
        setExpandedRows(prev => {
            const isExpanding = !prev[orgId];
            const newState = {...prev, [orgId]: isExpanding};
            // Only fetch if expanding (not collapsing)
            if (isExpanding) {
                fetchRelatedItems(orgId, programId);
            }
            return newState;
        });
    };

    const fetchRelatedItems = async (orgId, programId) => {
        // Set loading for this org only
        setRdapData(prevData => prevData.map(item =>
            item.id === orgId ? {...item, isLoadingRelated: true} : item
        ));
        try {
            const response = await fetch(`/api/deeper/rdap/related/${orgId}?programId=${programId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            setRdapData(prevData => prevData.map(item =>
                item.id === orgId
                    ? {...item, related: result.success ? (result.data || []) : [], isLoadingRelated: false}
                    : item
            ));
            // No need to setExpandedRows here, already handled in toggleRow
            loadData(currentPage, perPage, searchTerm);
        } catch (error) {
            setRdapData(prevData => prevData.map(item =>
                item.id === orgId ? {...item, isLoadingRelated: false, loadError: error.message} : item
            ));
            showNotification(`Error fetching related items: ${error.message}`, true);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadData(1, perPage, searchTerm);
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.type) {
            showNotification('Please select a type', true);
            return;
        }
        if (newItem.type === 'orgs' && !newItem.fk_programs_id) {
            showNotification('Please select a program', true);
            return;
        }
        if (newItem.type !== 'orgs' && !selectedOrg && !createNewOrg) {
            showNotification('Please select an organization or choose to create a new one', true);
            return;
        }
        if (newItem.type !== 'orgs' && createNewOrg && !newItem.fk_programs_id) {
            showNotification('Please select a program for the new organization', true);
            return;
        }
        if (!newItem.value) {
            showNotification('Value is required', true);
            return;
        }
        try {
            let itemToAdd = {...newItem};
            let orgId = null;
            // If creating a new org first
            if (newItem.type !== 'orgs' && createNewOrg) {
                const orgResponse = await fetch('/api/deeper/rdap', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        type: 'orgs',
                        value: orgFilterText,
                        fk_programs_id: newItem.fk_programs_id
                    }),
                });
                if (!orgResponse.ok) throw new Error(`HTTP error! Status: ${orgResponse.status}`);
                const orgResult = await orgResponse.json();
                if (!orgResult.success) throw new Error(orgResult.error || 'Failed to create organization');
                orgId = orgResult.id;
            } else if (newItem.type !== 'orgs' && selectedOrg) {
                orgId = selectedOrg.id;
            }
            if (newItem.type !== 'orgs' && orgId) {
                itemToAdd.fk_org_id = orgId;
            }
            // Use optimisticAdd for instant UI
            optimisticAdd(itemToAdd, () => {
                showNotification('RDAP item added successfully');
                setShowAddModal(false);
                setNewItem({type: '', value: '', fk_programs_id: ''});
                setSelectedOrg(null);
                setCreateNewOrg(false);
                setOrgFilterText('');
                setFilterText('');
            }, (errMsg) => {
                showNotification(`Error: ${errMsg}`, true);
            });
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        optimisticEdit(editingItem, () => {
            showNotification('RDAP item updated successfully');
            setShowEditModal(false);
        }, (errMsg) => {
            showNotification(`Error: ${errMsg}`, true);
        });
    };

    const handleDeleteItem = async () => {
        optimisticDelete(itemToDelete, () => {
            showNotification('RDAP item deleted successfully');
            setShowDeleteModal(false);
            setItemToDelete(null);
        }, (errMsg) => {
            showNotification(`Error: ${errMsg}`, true);
        });
    };

    const openAddModal = () => {
        fetchPrograms();
        // Immediately load all organizations without waiting for program selection
        loadAllOrganizations();
        setShowAddModal(true);
        setNewItem({type: '', value: '', fk_programs_id: ''});
        setSelectedOrg(null);
        setCreateNewOrg(false);
        setOrgFilterText('');
        setFilterText('');
    };

    const openEditModal = (item) => {
        setEditingItem({...item});
        setShowEditModal(true);
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleNewItemChange = (e) => {
        const {name, value} = e.target;
        setNewItem(prev => {
            const updated = {...prev, [name]: value};

            // Reset org selection when switching types
            if (name === 'type') {
                setSelectedOrg(null);
                setCreateNewOrg(false);
                setOrgFilterText('');
            }

            return updated;
        });
    };

    const handleEditItemChange = (e) => {
        const {name, value} = e.target;
        setEditingItem(prev => ({...prev, [name]: value}));
    };

    const fetchPrograms = async () => {
        setProgramsLoading(true);
        try {
            const response = await fetch('/api/shared/programs?limit=1000');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setPrograms(data.data || []);
        } catch (error) {
            console.error('Error fetching programs:', error);
            showNotification('Failed to load programs', true);
            setPrograms([]);
        } finally {
            setProgramsLoading(false);
        }
    };

    const fetchOrganizations = async (programId) => {
        if (!programId) return;

        setOrgsLoading(true);
        try {
            // First, load all RDAP data since those contain organizations we might see in the table
            const response = await fetch(`/api/deeper/rdap?page=1&limit=100${programId ? `&programId=${programId}` : ''}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Filter for only org type records and make sure they have the necessary data
            const orgs = data.data ? data.data
                .filter(item => item.type === 'orgs')
                .map(org => ({
                    ...org,
                    id: org.id,
                    value: org.value || org.name || '',
                    fk_programs_id: org.fk_programs_id
                })) : [];

            console.log('Found organizations:', orgs);
            setOrganizations(orgs);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            showNotification('Failed to load organizations', true);
            setOrganizations([]);
        } finally {
            setOrgsLoading(false);
        }
    };

    const loadAllOrganizations = async () => {
        setOrgsLoading(true);
        try {
            const response = await fetch(`/api/deeper/rdap?page=1&limit=100`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Filter for only org type records
            const orgs = data.data ? data.data
                .filter(item => item.type === 'orgs')
                .map(org => ({
                    ...org,
                    id: org.id,
                    value: org.value || org.name || '',
                    fk_programs_id: org.fk_programs_id
                })) : [];

            console.log('All organizations loaded:', orgs);
            setOrganizations(orgs);
        } catch (error) {
            console.error('Error fetching all organizations:', error);
            showNotification('Failed to load organizations', true);
            setOrganizations([]);
        } finally {
            setOrgsLoading(false);
        }
    };

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <MetricCard title="Total Organizations" value={metrics.orgs}/>
                <MetricCard title="Total Names" value={metrics.names}/>
                <MetricCard title="Total Emails" value={metrics.emails}/>
                <MetricCard title="Total Addresses" value={metrics.addresses}/>
                <MetricCard title="Total Handles" value={metrics.handles}/>
                <MetricCard title="Total Phones" value={metrics.phones}/>
            </div>

            <div className="page-search">
                <input
                    type="text"
                    id="rdapSearchInput"
                    className="filter-input"
                    placeholder="Search RDAP data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    id="rdapSearchButton"
                    className={`action-btn ${activeButtonId === 'rdapSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('rdapSearchButton', handleSearch)}
                >
                    Search
                </button>
                <button
                    id="rdapRefreshButton"
                    className={`action-btn ${activeButtonId === 'rdapRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('rdapRefreshButton', () => loadData(currentPage, perPage, searchTerm))}
                >
                    Refresh
                </button>
                <button
                    id="addRdapButton"
                    className={`action-btn ${activeButtonId === 'addRdapButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('addRdapButton', openAddModal)}
                >
                    Add RDAP
                </button>
            </div>

            <div className="programs-table">
                <DataTable
                    columns={rdapColumns(expandedRows)}
                    data={tableData}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={(newPage) => loadData(newPage, perPage, searchTerm)}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                        loadData(1, newPerPage, searchTerm);
                    }}
                    loading={loading}
                    noDataText="No RDAP data available"
                    loadingText="Loading RDAP data..."
                    toggleRow={toggleRow}
                    copyInfoClipboard={copyInfoClipboard}
                    openEditModal={openEditModal}
                    openDeleteModal={openDeleteModal}
                />
            </div>

            {/* Add RDAP Modal */}
            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add RDAP Item"
                    ariaLabel="Add RDAP Modal"
                    size="large"
                >
                    <form onSubmit={handleAddItem}>
                        {/* Type selection - moved to top */}
                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={newItem.type}
                                onChange={(e) => {
                                    setNewItem({...newItem, type: e.target.value});
                                    setSelectedOrg(null);
                                    setCreateNewOrg(false);
                                }}
                                className="form-control"
                            >
                                <option value="">Select a type</option>
                                <option value="orgs">Organization</option>
                                <option value="names">Name</option>
                                <option value="emails">Email</option>
                                <option value="addresses">Address</option>
                                <option value="nameservers">Nameserver</option>
                                <option value="phones">Phone</option>
                            </select>
                        </div>
                        {/* Program selection - only shown when Organization type is selected */}
                        {newItem.type === 'orgs' && (
                            <div className="form-group">
                                <label>Program</label>
                                <div className="dropdown-container">
                                    <input
                                        type="text"
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="Search programs..."
                                        className="dropdown-search"
                                    />
                                    {isDropdownOpen && (
                                        <div className="dropdown-options show" style={{
                                            maxHeight: '150px',
                                            overflowY: 'auto',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            backgroundColor: '#1e1e1e',
                                            zIndex: 1000,
                                            position: 'absolute',
                                            width: '100%',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                        }}>
                                            {programsLoading ? (
                                                <div className="dropdown-item loading">Loading...</div>
                                            ) : programs.length === 0 ? (
                                                <div className="dropdown-item">No programs found</div>
                                            ) : (
                                                programs
                                                    .filter(program =>
                                                        program.program.toLowerCase().includes(filterText.toLowerCase()))
                                                    .map(program => (
                                                        <div
                                                            key={program.id}
                                                            className="dropdown-item"
                                                            style={{
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #333',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onClick={() => {
                                                                setNewItem({
                                                                    ...newItem,
                                                                    fk_programs_id: program.id
                                                                });
                                                                setFilterText(program.program);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                        >
                                                            {program.program}
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Organization selection - only shown when type is not 'orgs' */}
                        {newItem.type && newItem.type !== 'orgs' && (
                            <div className="form-group">
                                <label>Organization</label>
                                <div className="dropdown-container">
                                    <input
                                        type="text"
                                        value={orgFilterText}
                                        onChange={(e) => setOrgFilterText(e.target.value)}
                                        onFocus={() => setIsOrgDropdownOpen(true)}
                                        placeholder="Search organizations or enter new org name..."
                                        className="dropdown-search"
                                    />
                                    {isOrgDropdownOpen && (
                                        <div className="dropdown-options show" style={{
                                            maxHeight: '150px',
                                            overflowY: 'auto',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            backgroundColor: '#1e1e1e',
                                            zIndex: 1000,
                                            position: 'absolute',
                                            width: '100%',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                        }}>
                                            {orgsLoading ? (
                                                <div className="dropdown-item loading">Loading organizations...</div>
                                            ) : organizations.length === 0 ? (
                                                <div className="dropdown-item">No organizations found. Enter name to create new.</div>
                                            ) : (
                                                <>
                                                    {organizations
                                                        .filter(org =>
                                                            (org.value?.toLowerCase() || '').includes(orgFilterText?.toLowerCase() || ''))
                                                        .map(org => (
                                                            <div
                                                                key={org.id}
                                                                className="dropdown-item"
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    borderBottom: '1px solid #333',
                                                                    transition: 'background-color 0.2s'
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedOrg(org);
                                                                    setNewItem({
                                                                        ...newItem,
                                                                        fk_org_id: org.id,
                                                                        fk_programs_id: org.fk_programs_id
                                                                    });
                                                                    setCreateNewOrg(false);
                                                                    setOrgFilterText(org.value);
                                                                    setIsOrgDropdownOpen(false);
                                                                    setFilterText(programs.find(p => p.id === org.fk_programs_id)?.program || '');
                                                                }}
                                                            >
                                                                {org.value} {org.program && `(${org.program})`}
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            )}
                                            {orgFilterText && (
                                                <div
                                                    className="dropdown-item create-new"
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#2c5f2d',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                    onClick={() => {
                                                        setCreateNewOrg(true);
                                                        setSelectedOrg(null);
                                                        setIsOrgDropdownOpen(false);
                                                        setNewItem({
                                                            ...newItem,
                                                            fk_org_id: null,
                                                            fk_programs_id: ''
                                                        });
                                                        setFilterText('');
                                                    }}
                                                >
                                                    Create New: "{orgFilterText}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="selected-info"
                                     style={{marginTop: '5px', fontSize: '0.9em', color: '#999'}}>
                                    {createNewOrg ? (
                                        <span>Will create new organization: <strong>{orgFilterText}</strong></span>
                                    ) : selectedOrg ? (
                                        <span>Selected organization: <strong>{selectedOrg.value}</strong> (Program: {programs.find(p => p.id === selectedOrg.fk_programs_id)?.program || 'Unknown'})</span>
                                    ) : (
                                        <span className="helper-text">Select an existing organization or create a new one</span>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Value input - only shown when type is selected */}
                        {newItem.type && (
                            <div className="form-group">
                                <label>Value</label>
                                <input
                                    type="text"
                                    value={newItem.value}
                                    onChange={handleNewItemChange}
                                    name="value"
                                    className="form-control"
                                    placeholder={`Enter ${newItem.type ? singularizeType(newItem.type) : ''} value`}
                                />
                            </div>
                        )}
                        {/* Action buttons */}
                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="form-button">
                                Add RDAP
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit RDAP Modal */}
            {showEditModal && editingItem && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit RDAP Item"
                    ariaLabel="Edit RDAP Modal"
                    size="large"
                >
                    <form onSubmit={handleEditItem}>
                        <div className="form-group">
                            <label htmlFor="value">Value</label>
                            <input
                                type="text"
                                id="value"
                                name="value"
                                value={editingItem.value}
                                onChange={handleEditItemChange}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="form-button">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete RDAP Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!itemToDelete}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete RDAP Confirmation"
            >
                <p>Are you sure you want to delete the RDAP {itemToDelete?.type === 'orgs' ? 'organization' : singularizeType(itemToDelete?.type)} <span className="fw-700">{itemToDelete?.value}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="form-button"
                        onClick={handleDeleteItem}
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default RDAPManagement;