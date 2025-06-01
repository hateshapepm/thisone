import React, { useState, useEffect } from 'react';
import MetricCard from '../../common/components/MetricCard';
import DataTable from '../../common/components/DataTable';
import * as Hooks from '../../hooks';
import { copyInfoClipboard } from '../../common/functions/copyToClipboard'
import { cidrColumns } from '../../common/tableConfigs/cidr';
import { useEscapeToClose } from '../../hooks';
import { useTableData } from '../../common/hooks/useTableData';
import { fetchCIDR } from '../../api/apiService';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';

const CIDRManagement = () => {
    const [cidrMetrics, setCidrMetrics] = useState({
        total_cidr_ranges: 0,
        ipv4_cidr_ranges: 0,
        ipv6_cidr_ranges: 0,
        inscope_cidr_ranges: 0,
        total_names: 0,
        cidr_ranges_with_names: 0,
        cidr_ranges_with_country: 0,
    });

    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    // State for modals
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingCidr, setViewingCidr] = useState(null);
    const [cidrDetails, setCidrDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCidr, setEditingCidr] = useState(null);

    // State for programs dropdown
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('cidrSearchButton');

    // Register Escape key to close modals
    useEscapeToClose(showViewModal, () => setShowViewModal(false));

    // Modal handler functions
    const openAddModal = () => {
        setEditingCidr({ cidr_range: '', ip_version: 'IPv4', scope: 'In Scope', fk_programs_id: '' });
        setIsEditMode(true);
        setShowViewModal(true);
    };
    const openEditModal = (cidr) => {
        // Try all possible property names for the range
        const cidrRange =
            cidr.cidr_range ||
            cidr.cidr ||
            (cidr.cidrDetails && cidr.cidrDetails.cidr) ||
            '';

        setEditingCidr({
            ...cidr,
            cidr_range: cidrRange,
            fk_programs_id: cidr.fk_programs_id || '',
            ip_version: cidr.ip_version || (cidr.cidr_range_ipv4 === false ? 'IPv6' : 'IPv4'),
            scope: cidr.scope || (cidr.cidr_range_inscope === false ? 'Out of Scope' : 'In Scope'),
        });
        setFilterText(cidr.program_name || '');
        setIsEditMode(true);
        setShowViewModal(true);
    };
    const openViewModal = async (cidr) => {
        setViewingCidr(cidr);
        setShowViewModal(true);
        setIsEditMode(false);
        setLoadingDetails(true);
        try {
            const response = await fetch(`/api/deeper/cidr/${encodeURIComponent(cidr.cidr)}/details`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setCidrDetails(data);
        } catch (error) {
            console.error('Error fetching CIDR details:', error);
            showNotification('Failed to load CIDR details', true);
            setCidrDetails(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        reload();
        fetchPrograms();
    }, []);

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

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const {
        data: cidrs,
        loading,
        totalPages,
        totalItems,
    } = useTableData(fetchCIDR, {
        page: currentPage,
        perPage,
        search: searchTerm,
        refreshFlag,
    });

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleNewCidrChange = (e) => {
        const {name, value, type, checked} = e.target;
        setEditingCidr(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEditCidrChange = (e) => {
        const {name, value} = e.target;
        setEditingCidr(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setRefreshFlag(f => !f);
    };

    const reload = () => setRefreshFlag(f => !f);

    const handleAddCidr = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/deeper/cidr', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingCidr),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('CIDR added successfully');
                setShowViewModal(false);
                setEditingCidr({cidr_range: '', ip_version: 'IPv4', scope: 'In Scope', fk_programs_id: ''});
                setCurrentPage(1);
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditCidr = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/deeper/cidr/${editingCidr.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingCidr),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('CIDR updated successfully');
                setShowViewModal(false);
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <MetricCard title="Total CIDRs" value={cidrMetrics.total_cidr_ranges}/>
                <MetricCard title="IPv4 CIDRs" value={cidrMetrics.ipv4_cidr_ranges}/>
                <MetricCard title="IPv6 CIDRs" value={cidrMetrics.ipv6_cidr_ranges}/>
                <MetricCard title="In-Scope CIDRs" value={cidrMetrics.inscope_cidr_ranges}/>
            </div>

            <div className="page-search">
                <input
                    type="text"
                    id="cidrSearchInput"
                    className="filter-input"
                    placeholder="Search CIDRs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    id="cidrSearchButton"
                    className={`action-btn ${activeButtonId === 'cidrSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('cidrSearchButton', handleSearch)}
                >
                    Search
                </button>
                <button
                    id="cidrRefreshButton"
                    className={`action-btn ${activeButtonId === 'cidrRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('cidrRefreshButton', () => reload())}
                >
                    Refresh
                </button>
                <button
                    id="addCidrButton"
                    className={`action-btn ${activeButtonId === 'addCidrButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('addCidrButton', openAddModal)}
                >
                    Add CIDR
                </button>
            </div>

            <div className="programs-table">
                <DataTable
                    columns={cidrColumns}
                    data={cidrs}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={(newPage) => reload()}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                        reload();
                    }}
                    loading={loading}
                    noDataText="No CIDRs available"
                    loadingText="Loading CIDRs..."
                    copyInfoClipboard={copyInfoClipboard}
                    openViewModal={openViewModal}
                    openEditModal={openEditModal}
                />
            </div>

            {showViewModal && (isEditMode || viewingCidr) && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => { setShowViewModal(false); setIsEditMode(false); setEditingCidr(null); setViewingCidr(null); }}
                    title={isEditMode ? (editingCidr && editingCidr.id ? 'Edit CIDR' : 'Add CIDR') : null}
                    size="large"
                    ariaLabel={isEditMode ? (editingCidr && editingCidr.id ? 'Edit CIDR Modal' : 'Add CIDR Modal') : 'CIDR Details Modal'}
                    header={
                        isEditMode ? (
                            <>
                                <div style={{ minWidth: 60 }} />
                                <h3 className="mb-1rem" style={{ flex: 1, textAlign: 'center', margin: 0 }}>{editingCidr && editingCidr.id ? 'Edit CIDR' : 'Add CIDR'}</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => { setShowViewModal(false); setIsEditMode(false); setEditingCidr(null); setViewingCidr(null); }}
                                    aria-label="Close modal"
                                    tabIndex={0}
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <>
                                {!isEditMode ? (
                                    <button
                                        className="action-btn action-btn-edit"
                                        aria-label="Edit CIDR"
                                        onClick={() => {
                                            setIsEditMode(true);
                                            setEditingCidr({ ...cidrDetails });
                                        }}
                                        style={{ minWidth: 60 }}
                                    >
                                        Edit
                                    </button>
                                ) : <div style={{ minWidth: 60 }} />}
                                <h3 className="mb-1rem" style={{ flex: 1, textAlign: 'center', margin: 0 }}>CIDR Details</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => { setShowViewModal(false); setIsEditMode(false); setEditingCidr(null); setViewingCidr(null); }}
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
                        <form onSubmit={editingCidr && editingCidr.id ? handleEditCidr : handleAddCidr}>
                            <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <div className="view-label">Program</div>
                                    <div className="custom-dropdown">
                                        <input
                                            type="text"
                                            id="fk_programs_id"
                                            value={filterText || programs.find(p => p.id === editingCidr.fk_programs_id)?.program || ''}
                                            onChange={(e) => {
                                                setFilterText(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            placeholder="Type to filter programs..."
                                            disabled={programsLoading}
                                            required
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
                                                                    setEditingCidr(prev => ({
                                                                        ...prev,
                                                                        fk_programs_id: program.id,
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
                                    <div className="view-label">CIDR Range</div>
                                    <input
                                        type="text"
                                        id="cidr_range"
                                        name="cidr_range"
                                        value={editingCidr.cidr_range}
                                        onChange={handleEditCidrChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="view-label">IP Version</div>
                                    <select
                                        name="ip_version"
                                        value={editingCidr.ip_version}
                                        onChange={handleEditCidrChange}
                                        aria-label="IP Version"
                                    >
                                        <option value="IPv4">IPv4</option>
                                        <option value="IPv6">IPv6</option>
                                        <option value="TBD">TBD</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="view-label">Scope</div>
                                    <select
                                        name="scope"
                                        value={editingCidr.scope}
                                        onChange={handleEditCidrChange}
                                        aria-label="Scope"
                                    >
                                        <option value="In Scope">In Scope</option>
                                        <option value="Out of Scope">Out of Scope</option>
                                        <option value="TBD">TBD</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions mt-18">
                                <button
                                    type="button"
                                    className="action-btn action-btn-neutral"
                                    onClick={() => { setShowViewModal(false); setIsEditMode(false); setEditingCidr(null); setViewingCidr(null); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">
                                    {editingCidr && editingCidr.id ? 'Save Changes' : 'Add CIDR'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        cidrDetails ? (
                            <>
                                <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    {/* Program (with logo) */}
                                    <div>
                                        <div className="view-label">Program</div>
                                        <div className="view-value">
                                            <ProgramWithLogo
                                                programName={cidrDetails.program_name}
                                                platformName={cidrDetails.platform_name || 'manual'}
                                            />
                                        </div>
                                    </div>
                                    {/* CIDR Range + Pills */}
                                    <div>
                                        <div className="view-label">CIDR Range</div>
                                        <div className="view-value" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                            <span style={{flex: 1}}>{cidrDetails.cidr}</span>
                                            <span className={`pill pill-disabled pill-small ${cidrDetails.scope === 'In Scope' ? 'in-scope' : cidrDetails.scope === 'Out of Scope' ? 'out-scope' : ''}`}>{cidrDetails.scope || (cidrDetails.isInScope ? 'In Scope' : 'Out of Scope')}</span>
                                            <span className={`pill pill-disabled pill-small ${cidrDetails.ip_version === 'IPv6' ? 'ipv6-pill' : 'ipv4-pill'}`}>{cidrDetails.ip_version || (cidrDetails.isIPv4 ? 'IPv4' : 'IPv6')}</span>
                                            {cidrDetails.asn && <span className="pill pill-disabled pill-small">ASN {cidrDetails.asn}</span>}
                                        </div>
                                    </div>
                                </div>
                                {/* Close button (bottom left) */}
                                {!isEditMode && (
                                    <div className="close-button-container">
                                        <button
                                            type="button"
                                            className="action-btn action-btn-neutral close-btn"
                                            onClick={() => setShowViewModal(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : loadingDetails ? (
                            <div style={{textAlign: 'center', padding: '2rem'}}>Loading details...</div>
                        ) : (
                            <div style={{textAlign: 'center', padding: '2rem'}}>No details available.</div>
                        )
                    )}
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

export default CIDRManagement;