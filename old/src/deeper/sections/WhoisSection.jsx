import React, { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../common/components/MetricCard';
import DataTable from '../../common/components/DataTable';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import { Clipboard, Edit, Trash2 } from 'lucide-react';
import { copyInfoClipboard } from '../../common/functions';
import { useEscapeToClose } from '../../hooks';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';

const WhoisSection = () => {
    const [whoisData, setWhoisData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [expandedRows, setExpandedRows] = useState({});
    const [whoisMetrics, setWhoisMetrics] = useState({
        orgs: 0, names: 0, emails: 0, addresses: 0, nameservers: 0, phones: 0,
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const [filterText, setFilterText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [programsLoading, setProgramsLoading] = useState(true);
    const [programs, setPrograms] = useState([]);
    const [newItem, setNewItem] = useState({});
    const [orgFilterText, setOrgFilterText] = useState('');
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
    const [createNewOrg, setCreateNewOrg] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [orgsLoading, setOrgsLoading] = useState(true);

    const singularizeType = (type) => {
        if (!type) return '';
        if (type === 'emails') return 'email';
        if (type === 'addresses') return 'address';
        if (type === 'phones') return 'phone';
        if (type === 'nameservers') return 'nameserver';
        if (type === 'names') return 'name';
        if (type === 'orgs') return 'organization';
        return typeof type === 'string' ? type.slice(0, -1) : '';
    };

    const whoisColumns = useMemo(() => [
        {
            Header: 'Program',
            accessor: 'program',
            width: 150,
            Cell: ({ row }) => {
                if (row.original.isSectionHeader) return <span className="fw-700">Type</span>;
                return (
                    <div className="nowrap ellipsis pl-0">
                        {row.original.type === 'orgs' ? (
                            <ProgramWithLogo
                                programName={row.original.program || 'Unknown Program'}
                                platformName={row.original.platform_name || 'n/a'}
                                showCopyButton={true}
                            />
                        ) : (
                            singularizeType(row.original.type)
                        )}
                    </div>
                );
            }
        },
        {
            Header: expandedRows && Object.values(expandedRows).some(Boolean) ? 'Value' : 'Org',
            accessor: 'value',
            Cell: ({ row }) => {
                if (row.original.isSectionHeader) return null;
                const value = row.original.value || '';
                const isOrg = row.original.type === 'orgs';
                return (
                    <div className="copy-cell flex-row justify-between align-center pl-0">
                        {isOrg && (
                            <button
                                className="expand-btn"
                                style={{ marginRight: 8 }}
                                onClick={() => toggleRow(row.original.id)}
                                title={expandedRows[row.original.id] ? 'Collapse' : 'Expand'}
                                aria-label={expandedRows[row.original.id] ? 'Collapse row' : 'Expand row'}
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleRow(row.original.id); }}
                            >
                                {expandedRows[row.original.id] ? '-' : '+'}
                            </button>
                        )}
                        <span className="truncate-text">
                            {value}
                        </span>
                        {value && (
                            <button
                                className="copy-btn"
                                onClick={() => copyInfoClipboard(value)}
                                title="Copy value"
                                aria-label="Copy value"
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') copyInfoClipboard(value); }}
                            >
                                <Clipboard size={14} />
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 100,
            Cell: ({row}) => {
                if (row.original.isSectionHeader) return null;
                return (
                    <div className="actions-cell">
                        <button
                            className="btn edit-btn"
                            aria-label="Edit Whois item"
                            tabIndex={0}
                            onClick={() => openEditModal(row.original)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openEditModal(row.original); }}
                        ><Edit size={14}/></button>
                        <button
                            className="btn delete-btn"
                            aria-label="Delete Whois item"
                            tabIndex={0}
                            onClick={() => openDeleteModal(row.original)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openDeleteModal(row.original); }}
                        ><Trash2 size={14}/></button>
                    </div>
                );
            },
            disableSortBy: true
        }
    ], [expandedRows]);

    const tableData = useMemo(() => {
        return whoisData.flatMap(org => {
            const rows = [{ ...org, type: 'orgs', value: org.value || org.name || '' }];
            if (expandedRows[org.id] && org.related && org.related.length > 0) {
                rows.push({
                    isSectionHeader: true,
                    id: `header-${org.id}`,
                });
                rows.push(
                    ...org.related.map(related => ({
                        ...related,
                        program: related.type,
                        type: related.type,
                        value: related.value || '',
                        expander: '',
                        fk_programs_id: org.fk_programs_id
                    }))
                );
            }
            return rows;
        });
    }, [whoisData, expandedRows]);

    useEffect(() => {
        loadData(1, perPage, searchTerm);
        loadWhoisMetrics();
    }, []);

    const loadWhoisMetrics = async () => {
        try {
            const response = await fetch('/api/deeper/whois-metrics');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setWhoisMetrics({
                orgs: data.orgs || 0,
                names: data.names || 0,
                emails: data.emails || 0,
                addresses: data.addresses || 0,
                nameservers: data.nameservers || 0,
                phones: data.phones || 0,
            });
        } catch (error) {
            setWhoisMetrics({ orgs: 0, names: 0, emails: 0, addresses: 0, nameservers: 0, phones: 0 });
        }
    };

    const loadData = async (page = 1, limit = perPage, search = '') => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/deeper/whois?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
            );
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setWhoisData(Array.isArray(data.data) ? data.data : []);
            setCurrentPage(data.pagination?.current_page || 1);
            setTotalPages(data.pagination?.total_pages || 1);
            setTotalItems(data.pagination?.total || 0);
            loadWhoisMetrics();
        } catch (error) {
            setWhoisData([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (orgId) => {
        setExpandedRows(prev => {
            const newState = { ...prev, [orgId]: !prev[orgId] };
            if (!prev[orgId]) {
                fetchRelatedItems(orgId);
            }
            return newState;
        });
    };

    const fetchRelatedItems = async (orgId) => {
        try {
            const org = whoisData.find(item => item.id === orgId);
            if (!org) return;
            const response = await fetch(`/api/deeper/whois/related/${orgId}?programId=${org.fk_programs_id}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                setWhoisData(prevData => {
                    return prevData.map(item => {
                        if (item.id === orgId) {
                            return { ...item, related: result.data || [] };
                        }
                        return item;
                    });
                });
            }
        } catch (error) {
            // ignore for now
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadData(1, perPage, searchTerm);
    };

    const openAddModal = () => { setShowAddModal(true); };
    const openEditModal = (item) => { setEditingItem(item); setShowEditModal(true); };
    const openDeleteModal = (item) => { setItemToDelete(item); setShowDeleteModal(true); };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showEditModal, () => setShowEditModal(false));
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.fk_programs_id) {
            showNotification('Please select a program', true);
            return;
        }
        if (newItem.type !== 'orgs' && !selectedOrg && !createNewOrg) {
            showNotification('Please select an organization or choose to create a new one', true);
            return;
        }
        if (!newItem.value) {
            showNotification('Value is required', true);
            return;
        }
        try {
            let itemToAdd = {...newItem};
            let orgId = null;
            if (newItem.type !== 'orgs' && createNewOrg) {
                const orgResponse = await fetch('/api/deeper/whois', {
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
                if (!orgResult.success) {
                    throw new Error(orgResult.error || 'Failed to create organization');
                }
                orgId = orgResult.id;
            } else if (newItem.type !== 'orgs' && selectedOrg) {
                orgId = selectedOrg.id;
            }
            if (newItem.type !== 'orgs' && orgId) {
                itemToAdd.fk_org_id = orgId;
            }
            const response = await fetch('/api/deeper/whois', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(itemToAdd),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('WHOIS item added successfully');
                setShowAddModal(false);
                setNewItem({type: 'orgs', value: '', fk_programs_id: ''});
                setSelectedOrg(null);
                setCreateNewOrg(false);
                setOrgFilterText('');
                loadData(currentPage, perPage, searchTerm);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        if (!editingItem.fk_programs_id) {
            showNotification('Program ID is missing for this item. Cannot edit.', true);
            return;
        }
        try {
            const response = await fetch(`/api/deeper/whois/${editingItem.type}/${editingItem.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    value: editingItem.value,
                    fk_programs_id: editingItem.fk_programs_id
                }),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('WHOIS item updated successfully');
                setShowEditModal(false);
                loadData(currentPage, perPage, searchTerm);
                loadWhoisMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteItem = async () => {
        try {
            const response = await fetch(`/api/deeper/whois/${itemToDelete.type}/${itemToDelete.id}?fk_programs_id=${itemToDelete.fk_programs_id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('WHOIS item deleted successfully');
                setShowDeleteModal(false);
                setItemToDelete(null);
                loadData(currentPage, perPage, searchTerm);
                loadWhoisMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleNewItemChange = (e) => {
        const {name, value} = e.target;
        setNewItem(prev => ({...prev, [name]: value}));
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
            setPrograms([]);
        } finally {
            setProgramsLoading(false);
        }
    };

    const loadAllOrganizations = async () => {
        setOrgsLoading(true);
        try {
            const response = await fetch(`/api/deeper/whois?page=1&limit=1000`);
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
            setOrganizations(orgs);
        } catch (error) {
            setOrganizations([]);
        } finally {
            setOrgsLoading(false);
        }
    };

    return (
        <div>
            <div className="programs-container">
                <div className="programs-metrics">
                    <MetricCard title="Organizations" value={whoisMetrics.orgs} />
                    <MetricCard title="Names" value={whoisMetrics.names} />
                    <MetricCard title="Emails" value={whoisMetrics.emails} />
                    <MetricCard title="Addresses" value={whoisMetrics.addresses} />
                    <MetricCard title="Nameservers" value={whoisMetrics.nameservers} />
                    <MetricCard title="Phones" value={whoisMetrics.phones} />
                </div>
                <div className="page-search">
                    <input
                        type="text"
                        id="whoisSearchInput"
                        className="filter-input"
                        placeholder="Search WHOIS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="action-btn action-btn-active"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                    <button
                        className="action-btn action-btn-active"
                        onClick={() => loadData(currentPage, perPage, searchTerm)}
                    >
                        Refresh
                    </button>
                    <button
                        className="action-btn action-btn-active"
                        onClick={openAddModal}
                    >
                        Add WHOIS
                    </button>
                </div>
                <DataTable
                    columns={whoisColumns}
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
                    noDataText="No WHOIS data available"
                    loadingText="Loading WHOIS data..."
                />
            </div>
            {showAddModal && (
                <div className="modal">
                    <div className="modal-content view-modal-content" style={{maxWidth: 700, width: '95%', overflowY: 'auto'}}>
                        <span className="modal-close" onClick={() => setShowAddModal(false)}>×</span>
                        <h3 style={{marginBottom: '1rem'}}>Add WHOIS Item</h3>
                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={newItem.type}
                                    onChange={(e) => {
                                        setNewItem({...newItem, type: e.target.value});
                                        setSelectedOrg(null);
                                        setCreateNewOrg(false);
                                        setOrgFilterText('');
                                        if (e.target.value === 'orgs') {
                                            // Load programs for org creation
                                            if (typeof fetchPrograms === 'function') fetchPrograms();
                                        } else {
                                            // Load organizations for other types
                                            if (typeof loadAllOrganizations === 'function') loadAllOrganizations();
                                        }
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
                                                    organizations
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
                            {newItem.type && newItem.type !== 'orgs' && createNewOrg && (
                                <div className="form-group">
                                    <label>Program for New Organization</label>
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
                            {newItem.type && (
                                <div className="form-group">
                                    <label>Value</label>
                                    <input
                                        type="text"
                                        value={newItem.value}
                                        onChange={handleNewItemChange}
                                        name="value"
                                        className="form-control"
                                        placeholder={`Enter ${singularizeType(newItem.type)} value`}
                                    />
                                </div>
                            )}
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="form-button">
                                    Add WHOIS
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showEditModal && editingItem && (
                <div className="modal">
                    <div className="modal-content view-modal-content" style={{maxWidth: 700, width: '95%', overflowY: 'auto'}}>
                        <span className="modal-close" onClick={() => setShowEditModal(false)}>×</span>
                        <h3 style={{marginBottom: '1rem'}}>Edit WHOIS Item</h3>
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
                                <button type="button" className="action-btn action-btn-green" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDeleteModal && itemToDelete && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="modal-close" onClick={() => setShowDeleteModal(false)}>×</span>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete the
                            WHOIS {itemToDelete.type ? (itemToDelete.type === 'orgs' ? 'organization' : singularizeType(itemToDelete.type)) : ''} "{itemToDelete.value}"? This action cannot be
                            undone.</p>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="action-btn action-btn-green"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="action-btn action-btn-primary"
                                onClick={handleDeleteItem}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>{notification.message}</div>
            )}
        </div>
    );
};

export default WhoisSection; 