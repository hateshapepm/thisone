import React, { useState, useEffect } from 'react';
import MetricCard from '../../common/components/MetricCard';
import DataTable from '../../common/components/DataTable';
import { Clipboard, Edit } from 'lucide-react';
import * as Hooks from '../../hooks';
import { copyInfoClipboard } from '../../common/functions';
import { asnColumns } from '../../common/tableConfigs/asn';
import { useEscapeToClose } from '../../hooks';
import { useTableData } from '../../common/hooks/useTableData';
import { fetchASN } from '../../api/apiService';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import Modal from '../../common/components/Modal';

const ASNManagement = () => {
    const [asnMetrics, setAsnMetrics] = useState({
        total_asns: 0,
        asns_with_names: 0,
        total_names: 0,
        asns_with_country: 0,
        most_names_for_single_asn: 0,
        added_today: 0,
    });

    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingAsn, setEditingAsn] = useState(null);
    const [asnToDelete, setAsnToDelete] = useState(null);
    const [newAsn, setNewAsn] = useState({
        asn: '',
        name: '',
        country: '',
        fk_programs_id: '',
    });

    // State for program dropdown
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // State for view modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingAsn, setViewingAsn] = useState(null);
    const [asnDetails, setAsnDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // State for Edit CIDR modal
    const [showEditCidrModal, setShowEditCidrModal] = useState(false);
    const [editingCidr, setEditingCidr] = useState(null);

    // Add isEditMode state for consolidated view/edit modal
    const [isEditMode, setIsEditMode] = useState(false);

    // Refactor: CIDR state is now array of objects
    const [cidrRanges, setCidrRanges] = useState([]); // [{ range, ip_version, scope }]
    const [newCidr, setNewCidr] = useState({ range: '', ip_version: 'IPv4', scope: 'In Scope' });
    const [editingCidrIndex, setEditingCidrIndex] = useState(null);
    const [editCidrDraft, setEditCidrDraft] = useState(null);

    // Register Escape key to close modals
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));
    useEscapeToClose(showViewModal, () => setShowViewModal(false));
    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showEditModal, () => setShowEditModal(false));

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('asnSearchButton');

    // Use the new useTableData hook for data and actions
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const {
        data: asns,
        loading,
        totalPages,
        totalItems,
    } = useTableData(fetchASN, {
        page: currentPage,
        perPage,
        search: searchTerm,
    });

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

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleNewAsnChange = (e) => {
        const {name, value} = e.target;
        setNewAsn(prev => ({...prev, [name]: value}));
    };

    const handleEditAsnChange = (e) => {
        const {name, value} = e.target;
        setEditingAsn(prev => ({...prev, [name]: value}));
    };

    const openAddModal = () => {
        fetchPrograms();
        setEditingAsn({ asn: '', name: '', country: '', fk_programs_id: '' });
        setIsEditMode(true);
        setShowViewModal(true);
    };

    const openEditModal = (asn) => {
        setEditingAsn({
            id: asn.id,
            asn: asn.asn,
            name: asn.names[0] || '', // Use the first name
            country: asn.countries[0] || '', // Use the first country
            fk_programs_id: asn.fk_programs_id,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (asn) => {
        setAsnToDelete(asn);
        setShowDeleteModal(true);
    };

    const openViewModal = async (asn) => {
        setViewingAsn(asn);
        setShowViewModal(true);
        setLoadingDetails(true);
        try {
            const response = await fetch(`/api/deeper/asn/${asn.asn}/details`);
            if (!response.ok) throw new Error('Failed to fetch ASN details');
            const details = await response.json();
            setAsnDetails(details);
        } catch (e) {
            setAsnDetails(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Handler to open the Edit CIDR modal
    const openEditCidrModal = (cidr) => {
        setEditingCidr({
            cidr_range: cidr,
            // Add more fields if available in asnDetails (e.g., isInScope, isIPv4, etc.)
        });
        setShowEditCidrModal(true);
    };

    // Handler for form changes in Edit CIDR modal
    const handleEditCidrChange = (e) => {
        const {name, value, type, checked} = e.target;
        setEditingCidr(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handler for submitting the Edit CIDR modal
    const handleEditCidrSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement API call to update CIDR (requires backend endpoint)
        setShowEditCidrModal(false);
        // Optionally refresh ASN details here
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setRefreshFlag(f => !f);
    };

    const reload = () => setRefreshFlag(f => !f);

    const handleAddAsn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/deeper/asn', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ...editingAsn, cidr_ranges: cidrRanges }),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('ASN added successfully');
                setShowViewModal(false); setIsEditMode(false); setEditingAsn(null); setViewingAsn(null);
                setCurrentPage(1);
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditAsn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/deeper/asn/${editingAsn.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ...editingAsn, cidr_ranges: cidrRanges }),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('ASN updated successfully');
                setShowViewModal(false); setIsEditMode(false); setEditingAsn(null); setViewingAsn(null);
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteAsn = async () => {
        try {
            const response = await fetch(`/api/deeper/asn/${asnToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('ASN deleted successfully');
                setShowDeleteModal(false);
                setAsnToDelete(null);
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    // Handlers for CIDR actions (stub implementations)
    const handleDeleteCidr = (cidr) => {
        // TODO: Implement API call to delete CIDR
        showNotification('Delete CIDR not yet implemented', true);
    };
    const handleToggleScope = (cidr) => {
        // TODO: Implement API call to toggle scope
        showNotification('Toggle scope not yet implemented', true);
    };

    // When entering Add/Edit mode, set cidrRanges
    useEffect(() => {
        if (isEditMode) {
            if (editingAsn && editingAsn.id && asnDetails && asnDetails.cidr_ranges) {
                setCidrRanges(
                    asnDetails.cidr_ranges.map(c => {
                        if (typeof c === 'string') {
                            return {
                                range: c,
                                ip_version: c.includes(':') ? 'IPv6' : 'IPv4',
                                scope: 'In Scope',
                            };
                        }
                        return {
                            range: c.range || c,
                            ip_version: c.ip_version || (c.range && c.range.includes(':') ? 'IPv6' : 'IPv4'),
                            scope: c.scope || 'In Scope',
                        };
                    })
                );
            } else if (!editingAsn?.id) {
                setCidrRanges([]);
            }
        }
    }, [isEditMode, editingAsn, asnDetails]);

    // Add CIDR handlers
    const handleAddCidr = () => {
        const trimmed = newCidr.range.trim();
        if (!trimmed || cidrRanges.some(c => c.range === trimmed)) return;
        setCidrRanges(prev => [...prev, { ...newCidr, range: trimmed }]);
        setNewCidr({ range: '', ip_version: 'IPv4', scope: 'In Scope' });
    };
    const handleRemoveCidr = (cidr) => {
        setCidrRanges(prev => prev.filter(c => c.range !== cidr.range));
    };
    const handleEditCidrClick = (index) => {
        setEditingCidrIndex(index);
        setEditCidrDraft({ ...cidrRanges[index] });
    };
    const handleEditCidrDraftChange = (e) => {
        const { name, value } = e.target;
        setEditCidrDraft(prev => ({ ...prev, [name]: value }));
    };
    const handleEditCidrSave = () => {
        setCidrRanges(prev => prev.map((c, i) => i === editingCidrIndex ? { ...editCidrDraft, range: editCidrDraft.range.trim() } : c));
        setEditingCidrIndex(null);
        setEditCidrDraft(null);
    };
    const handleEditCidrCancel = () => {
        setEditingCidrIndex(null);
        setEditCidrDraft(null);
    };

    useEffect(() => {
        document.title = 'Deeplike - ASN';
    }, []);

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <MetricCard title="Total ASNs" value={asnMetrics.total_asns}/>
                <MetricCard title="ASNs With Names" value={asnMetrics.asns_with_names}/>
                <MetricCard title="Total Names" value={asnMetrics.total_names}/>
                <MetricCard title="ASNs With Country" value={asnMetrics.asns_with_country}/>
                <MetricCard title="Max Names Per ASN" value={asnMetrics.most_names_for_single_asn}/>
                <MetricCard title="Added Today" value={asnMetrics.added_today}/>
            </div>

            <div className="page-search">
                <input
                    type="text"
                    id="asnSearchInput"
                    className="filter-input"
                    placeholder="Search ASNs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    id="asnSearchButton"
                    className={`action-btn ${activeButtonId === 'asnSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('asnSearchButton', handleSearch)}
                >
                    Search
                </button>
                <button
                    id="asnRefreshButton"
                    className={`action-btn ${activeButtonId === 'asnRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('asnRefreshButton', () => reload())}
                >
                    Refresh
                </button>
                <button
                    id="addAsnButton"
                    className={`action-btn ${activeButtonId === 'addAsnButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('addAsnButton', openAddModal)}
                >
                    Add ASN
                </button>
            </div>

            <div className="programs-table">
                <DataTable
                    columns={asnColumns}
                    data={asns}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={setCurrentPage}
                    onPerPageChange={setPerPage}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSearch={handleSearch}
                    onAdd={openAddModal}
                    loading={loading}
                    noDataText="No ASNs available"
                    loadingText="Loading ASNs..."
                    copyInfoClipboard={copyInfoClipboard}
                    openViewModal={openViewModal}
                    openEditModal={openEditModal}
                    openDeleteModal={openDeleteModal}
                />
            </div>

            {/* Add ASN Modal */}
            {showViewModal && (isEditMode || viewingAsn) && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => { setShowViewModal(false); setIsEditMode(false); setEditingAsn(null); setViewingAsn(null); }}
                    title={isEditMode ? (editingAsn && editingAsn.id ? 'Edit ASN' : 'Add ASN') : null}
                    size="large"
                    ariaLabel={isEditMode ? (editingAsn && editingAsn.id ? 'Edit ASN Modal' : 'Add ASN Modal') : 'ASN Details Modal'}
                    header={
                        isEditMode ? (
                            <>
                                <div style={{ minWidth: 60 }} />
                                <h3 className="mb-1rem" style={{ flex: 1, textAlign: 'center', margin: 0 }}>{editingAsn && editingAsn.id ? 'Edit ASN' : 'Add ASN'}</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => { setShowViewModal(false); setIsEditMode(false); setEditingAsn(null); setViewingAsn(null); }}
                                    aria-label="Close modal"
                                    tabIndex={0}
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <>
                                {!loadingDetails && !isEditMode ? (
                                    <button
                                        className="action-btn action-btn-edit"
                                        aria-label="Edit ASN"
                                        onClick={() => {
                                            setIsEditMode(true);
                                            setEditingAsn({
                                                id: viewingAsn.id,
                                                asn: viewingAsn.asn,
                                                name: viewingAsn.names?.[0] || '',
                                                country: viewingAsn.countries?.[0] || '',
                                                fk_programs_id: viewingAsn.fk_programs_id,
                                            });
                                            fetchPrograms();
                                        }}
                                        style={{ minWidth: 60 }}
                                    >
                                        Edit
                                    </button>
                                ) : <div style={{ minWidth: 60 }} />}
                                <h3 className="mb-1rem" style={{ flex: 1, textAlign: 'center', margin: 0 }}>ASN Details</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => { setShowViewModal(false); setIsEditMode(false); setEditingAsn(null); setViewingAsn(null); }}
                                    aria-label="Close modal"
                                    tabIndex={0}
                                >
                                    ×
                                </button>
                            </>
                        )
                    }
                >
                    {isEditMode ? (
                        <form onSubmit={editingAsn && editingAsn.id ? handleEditAsn : handleAddAsn}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program</div>
                                    <div className="custom-dropdown">
                                        <input
                                            type="text"
                                            id="fk_programs_id"
                                            value={filterText || programs.find(p => p.id === editingAsn.fk_programs_id)?.program || ''}
                                            onChange={(e) => {
                                                setFilterText(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                                            placeholder="Type to filter programs..."
                                            disabled={programsLoading}
                                            required
                                            autoComplete="off"
                                        />
                                        {isDropdownOpen && (
                                            <ul className="dropdown-list">
                                                {programsLoading ? (
                                                    <li className="dropdown-item disabled">Loading programs...</li>
                                                ) : programs.length === 0 ? (
                                                    <li className="dropdown-item disabled">No active programs available</li>
                                                ) : (
                                                    programs
                                                        .filter(program =>
                                                            program.program.toLowerCase().includes((filterText || '').toLowerCase())
                                                        )
                                                        .map(program => (
                                                            <li
                                                                key={program.id}
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setEditingAsn(prev => ({
                                                                        ...prev,
                                                                        fk_programs_id: program.id
                                                                    }));
                                                                    setFilterText(program.program);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                            >
                                                                {program.program}
                                                            </li>
                                                        ))
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="view-label">ASN Number</div>
                                    <input
                                        type="text"
                                        id="asn"
                                        name="asn"
                                        value={editingAsn.asn}
                                        onChange={handleEditAsnChange}
                                        required
                                        style={{width: '100%'}}
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Name</div>
                                    <input
                                        type="text"
                                        id="asn_names_input"
                                        name="asn_names_input"
                                        value={editingAsn.name || ''}
                                        onChange={handleEditAsnChange}
                                        style={{width: '100%'}}
                                        autoComplete="nope"
                                        inputMode="text"
                                    />
                                </div>
                                <div>
                                    <div className="view-label">Country</div>
                                    <input
                                        type="text"
                                        id="asn_countries_input"
                                        name="asn_countries_input"
                                        value={editingAsn.country || ''}
                                        onChange={handleEditAsnChange}
                                        style={{width: '100%'}}
                                        autoComplete="nope"
                                        inputMode="text"
                                    />
                                </div>
                            </div>
                            <div className="view-label mt-8">CIDR Ranges ({cidrRanges.length})</div>
                            <div className="cidr-list mb-16" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                                {cidrRanges.map((cidr, idx) => (
                                    <div key={cidr.range} style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
                                        {editingCidrIndex === idx ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name="range"
                                                    value={editCidrDraft.range}
                                                    onChange={handleEditCidrDraftChange}
                                                    style={{width: 180}}
                                                    aria-label="CIDR Range"
                                                />
                                                <select
                                                    name="ip_version"
                                                    value={editCidrDraft.ip_version}
                                                    onChange={handleEditCidrDraftChange}
                                                    aria-label="IP Version"
                                                >
                                                    <option value="IPv4">IPv4</option>
                                                    <option value="IPv6">IPv6</option>
                                                    <option value="TBD">TBD</option>
                                                </select>
                                                <select
                                                    name="scope"
                                                    value={editCidrDraft.scope}
                                                    onChange={handleEditCidrDraftChange}
                                                    aria-label="Scope"
                                                >
                                                    <option value="In Scope">In Scope</option>
                                                    <option value="Out of Scope">Out of Scope</option>
                                                    <option value="TBD">TBD</option>
                                                </select>
                                                <button type="button" className="action-btn action-btn-primary" onClick={handleEditCidrSave} aria-label="Save CIDR">Save</button>
                                                <button type="button" className="action-btn action-btn-neutral" onClick={handleEditCidrCancel} aria-label="Cancel Edit">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="pill pill-disabled pill-small">{cidr.range}</span>
                                                <span className={`pill pill-disabled pill-small ${cidr.ip_version === 'IPv6' ? 'ipv6-pill' : 'ipv4-pill'}`}>{cidr.ip_version}</span>
                                                <span className={`pill pill-disabled pill-small ${cidr.scope === 'In Scope' ? 'in-scope' : cidr.scope === 'Out of Scope' ? 'out-scope' : ''}`}>{cidr.scope}</span>
                                                <button type="button" className="action-btn action-btn-small" onClick={() => handleEditCidrClick(idx)} aria-label={`Edit CIDR ${cidr.range}`}>Edit</button>
                                                <button type="button" className="action-btn action-btn-small" onClick={() => handleRemoveCidr(cidr)} aria-label={`Remove CIDR ${cidr.range}`}>×</button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="cidr-input-row mb-24" style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                                <input
                                    type="text"
                                    placeholder="Add new CIDR (e.g. 1.2.3.0/24)"
                                    value={newCidr.range}
                                    onChange={e => setNewCidr(prev => ({ ...prev, range: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCidr(); } }}
                                    className="filter-input"
                                    aria-label="New CIDR Range"
                                />
                                <select
                                    value={newCidr.ip_version}
                                    onChange={e => setNewCidr(prev => ({ ...prev, ip_version: e.target.value }))}
                                    aria-label="New CIDR IP Version"
                                >
                                    <option value="IPv4">IPv4</option>
                                    <option value="IPv6">IPv6</option>
                                    <option value="TBD">TBD</option>
                                </select>
                                <select
                                    value={newCidr.scope}
                                    onChange={e => setNewCidr(prev => ({ ...prev, scope: e.target.value }))}
                                    aria-label="New CIDR Scope"
                                >
                                    <option value="In Scope">In Scope</option>
                                    <option value="Out of Scope">Out of Scope</option>
                                    <option value="TBD">TBD</option>
                                </select>
                                <button
                                    type="button"
                                    className="action-btn action-btn-primary"
                                    onClick={handleAddCidr}
                                    aria-label="Add CIDR"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="form-actions mt-18">
                                <button
                                    type="button"
                                    className="action-btn action-btn-neutral"
                                    onClick={() => { setShowViewModal(false); setIsEditMode(false); setEditingAsn(null); setViewingAsn(null); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">
                                    {editingAsn && editingAsn.id ? 'Save Changes' : 'Add ASN'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* Two-column grid for main details */}
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                {/* Row 1: Program | ASN Number */}
                                <div>
                                    <div className="view-label">Program</div>
                                    <div className="view-value">
                                        <ProgramWithLogo
                                            programName={viewingAsn.program_name}
                                            platformName={viewingAsn.platform_name || 'manual'}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="view-label">ASN Number</div>
                                    <div className="view-value">
                                        {viewingAsn.asn}
                                        {asnDetails.additional_data?.scope_statuses && (
                                            <span className="pill pill-disabled pill-small ml-8">
                                                {asnDetails.additional_data.scope_statuses === 'Out of Scope' ? 'Out of Scope' : 'In Scope'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Row 2: Names | Countries */}
                                <div>
                                    <div className="view-label">Names</div>
                                    <div className="view-value">
                                        {viewingAsn.names && viewingAsn.names.length > 0 ? viewingAsn.names.join(', ') : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="view-label">Countries</div>
                                    <div className="view-value">
                                        {viewingAsn.countries && viewingAsn.countries.length > 0 ? viewingAsn.countries.join(', ') : 'N/A'}
                                    </div>
                                </div>
                            </div>
                            {/* CIDR Ranges (view/edit) */}
                            {asnDetails.cidr_ranges && asnDetails.cidr_ranges.length > 0 && (
                                <>
                                    <div className="view-label mt-1_5rem">CIDR Ranges</div>
                                    <div className="cidr-list cidr-list-custom mb-16">
                                        {asnDetails.cidr_ranges.map((cidr, index) => {
                                            const isIPv6 = (cidr.range ? cidr.range.includes(':') : cidr.includes(':'));
                                            const scope = cidr.scope || (asnDetails.additional_data?.scope_statuses === 'Out of Scope' ? 'Out of Scope' : 'In Scope');
                                            const cidrValue = cidr.range || cidr;
                                            return (
                                                <div key={index} className="cidr-item cidr-item-custom">
                                                    <span className="cidr-badge">{cidrValue}</span>
                                                    <span
                                                        className={`pill pill-disabled pill-small scope-toggle-btn ${scope === 'In Scope' ? 'in-scope' : 'out-scope'}`}
                                                        style={{cursor: 'default'}}
                                                        aria-label={`Scope for ${cidrValue}`}
                                                    >
                                                        {scope === 'Out of Scope' ? 'Out of Scope' : 'In Scope'}
                                                    </span>
                                                    <span
                                                        className={`pill pill-disabled pill-small ${isIPv6 ? 'ipv6-pill' : 'ipv4-pill'}`}
                                                        style={{cursor: 'default'}}
                                                        aria-label={isIPv6 ? 'IPv6' : 'IPv4'}
                                                    >
                                                        {isIPv6 ? 'IPv6' : 'IPv4'}
                                                    </span>
                                                    <div className="cidr-actions">
                                                        {isEditMode && (
                                                            <button
                                                                className="cidr-action-btn delete"
                                                                onClick={() => handleDeleteCidr(cidr)}
                                                                title={`Delete CIDR ${cidrValue}`}
                                                                aria-label={`Delete CIDR ${cidrValue}`}
                                                                type="button"
                                                                style={{fontWeight: 700, fontSize: 18, color: '#ff4343', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px'}}
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </Modal>
            )}

            {/* Edit CIDR Modal */}
            {showEditCidrModal && editingCidr && (
                <Modal
                    isOpen={showEditCidrModal}
                    onClose={() => setShowEditCidrModal(false)}
                    title="Edit CIDR"
                    ariaLabel="Edit CIDR Modal"
                    size="normal"
                >
                    <form onSubmit={handleEditCidrSubmit}>
                        <div className="form-group">
                            <label htmlFor="cidr_range">CIDR Range</label>
                            <input
                                type="text"
                                id="cidr_range"
                                name="cidr_range"
                                value={editingCidr.cidr_range}
                                onChange={handleEditCidrChange}
                                required
                                className="edit-cidr-input"
                            />
                        </div>
                        {/* Add more fields here if needed (e.g., IPv4/IPv6, In Scope) */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="action-btn action-btn-green"
                                onClick={() => setShowEditCidrModal(false)}
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

            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default ASNManagement;