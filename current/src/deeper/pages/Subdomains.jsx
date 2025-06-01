import React, { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../common/components/MetricCard';
import { Edit, Trash2, Clipboard, Eye } from 'lucide-react';
import * as Hooks from '../../hooks';
import { copyInfoClipboard } from '../../common/functions';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import { useTableData } from '../../common/hooks/useTableData';
import { fetchSubdomains } from '../../api/apiService';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';

const SubdomainManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const {
        data: subdomains,
        loading,
        totalPages,
        totalItems,
    } = useTableData(fetchSubdomains, {
        page: currentPage,
        perPage,
        search: searchTerm,
        refreshFlag,
    });
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    const [subdomainMetrics, setSubdomainMetrics] = useState({
        total_subdomains: 0,
        active_subdomains: 0,
        new_today: 0,
        total_apex_domains: 0,
        http_servers: 0,
        https_servers: 0,
    });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsSubdomain, setDetailsSubdomain] = useState(null);
    const [detailsSubdomainData, setDetailsSubdomainData] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subdomainToDelete, setSubdomainToDelete] = useState(null);
    const [newSubdomain, setNewSubdomain] = useState({
        subdomain: '', ip_address: '', is_active: true,
    });

    // Apex domains dropdown states
    const [apexDomains, setApexDomains] = useState([]);
    const [apexLoading, setApexLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('subdomainSearchButton');

    // Register Escape key to close modals
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));
    useEscapeToClose(showDetailsModal, () => { setShowDetailsModal(false); setIsEditMode(false); });
    useEscapeToClose(showAddModal, () => setShowAddModal(false));

    const subdomainColumns = useMemo(
        () => [
            {
                Header: 'Program',
                accessor: 'program',
                Cell: ({row}) => (
                    <ProgramWithLogo
                        programName={row.original.program || 'N/A'}
                        platformName={row.original.platform_name}
                    />
                )
            },
            {
                Header: 'Subdomain',
                accessor: 'subdomain',
                Cell: ({value}) => (
                    <div className="copy-cell">
                        <span>{value}</span>
                        <button className="copy-btn"
                                onClick={() => copyInfoClipboard(value)}
                                title="Copy Subdomain">
                            <Clipboard size={14}/>
                        </button>
                    </div>
                )
            },
            {
                Header: 'IP Address',
                accessor: 'ip_address',
                Cell: ({value}) => (
                    <div className="copy-cell">
                        <span>{value || 'N/A'}</span>
                        <button className="copy-btn"
                                onClick={() => copyInfoClipboard(value)}
                                title="Copy IP Address">
                            <Clipboard size={14}/>
                        </button>
                    </div>
                )
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({row}) => (
                    <>
                    <span className={`status-badge ${row.original.is_active ? 'status-yes' : 'status-no'}`}>
                        {row.original.is_active ? 'Active' : 'Inactive'}
                    </span>
                        {row.original.subdomain_inscope !== undefined && (
                            <span
                                className={`status-badge ${row.original.subdomain_inscope ? 'status-yes' : 'status-no'}`}>
                            {row.original.subdomain_inscope ? 'In Scope' : 'Out of Scope'}
                        </span>
                        )}
                        {row.original.status_code && (
                            <span
                                className={`status-badge ${row.original.status_code < 400 ? 'status-yes' : 'status-no'}`}>
                            {row.original.status_code}
                        </span>
                        )}
                    </>
                )
            },
            {
                Header: 'Discovery Date',
                accessor: 'discovery_date',
                Cell: ({value}) => formatDate(value)
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({row}) => (
                    <div className="actions-cell">
                        <button className="view-btn" title="View subdomain"
                                onClick={() => openDetailsModal(row.original, false)}>
                            <Eye size={14}/>
                        </button>
                        <button className="edit-btn" title="Edit subdomain"
                                onClick={() => openDetailsModal(row.original, true)}>
                            <Edit size={14}/>
                        </button>
                        <button className="delete-btn" title="Delete subdomain"
                                onClick={() => openDeleteModal(row.original)}>
                            <Trash2 size={14}/>
                        </button>
                    </div>
                )
            }
        ],
        []
    );

    useEffect(() => {
        fetchApexDomains();
    }, []);

    const fetchApexDomains = async () => {
        setApexLoading(true);
        try {
            const response = await fetch('/api/shared/apex-domains?limit=1000'); // Adjust endpoint as needed
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setApexDomains(data.data || []);
        } catch (error) {
            console.error('Error fetching apex domains:', error);
            showNotification('Failed to load apex domains', true);
            setApexDomains([]);
        } finally {
            setApexLoading(false);
        }
    };

    const calculateSubdomainMetrics = (data = subdomains) => {
        try {
            const activeSubdomains = data.filter(s => s.is_active === 1).length;
            const httpServers = data.filter(s => s.status_code && s.status_code < 600).length;
            const uniqueApexIds = new Set(data.map(s => s.fk_apex_domains_id)).size;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const newToday = data.filter(s => {
                if (!s.discovery_date) return false;
                const discoveryDate = new Date(s.discovery_date);
                return discoveryDate >= today;
            }).length;

            setSubdomainMetrics({
                total_subdomains: data.length,
                active_subdomains: activeSubdomains,
                new_today: newToday,
                total_apex_domains: uniqueApexIds,
                http_servers: httpServers,
                https_servers: 0, // Placeholder
            });
        } catch (error) {
            console.error('Error calculating subdomain metrics:', error);
            // Don't use multiplication factors - use actual counts or zeros
            setSubdomainMetrics({
                total_subdomains: data.length || 0,
                active_subdomains: 0,
                new_today: 0,
                total_apex_domains: 0,
                http_servers: 0,
                https_servers: 0,
            });
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setRefreshFlag(f => !f);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleAddSubdomain = async (e) => {
        e.preventDefault();
        if (!newSubdomain.subdomain) {
            showNotification('Subdomain is required', true);
            return;
        }

        try {
            // Extract apex domain from subdomain
            const parts = newSubdomain.subdomain.split('.');
            if (parts.length < 2) {
                showNotification('Invalid subdomain format', true);
                return;
            }

            // Get apex domain (last two parts of the subdomain)
            const apexDomain = parts.slice(-2).join('.');

            // Find the apex domain ID
            const apexResponse = await fetch(`/api/shared/apex-domains?search=${encodeURIComponent(apexDomain)}`);
            if (!apexResponse.ok) throw new Error(`HTTP error! Status: ${apexResponse.status}`);
            const apexData = await apexResponse.json();

            // Check if the apex domain exists
            if (!apexData.data || apexData.data.length === 0) {
                showNotification(`Apex domain "${apexDomain}" not found`, true);
                return;
            }

            // Use the first matching apex domain
            const fk_apex_domains_id = apexData.data[0].id;

            const response = await fetch('/api/deeper/subdomains', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    subdomain: newSubdomain.subdomain,
                    ip_address: newSubdomain.ip_address || null,
                    is_active: newSubdomain.is_active,
                    fk_apex_domains_id: fk_apex_domains_id
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Subdomain added successfully');
                setShowAddModal(false);
                setNewSubdomain({subdomain: '', ip_address: '', is_active: true});
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding subdomain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteSubdomain = async () => {
        try {
            const response = await fetch(`/api/deeper/subdomains/${subdomainToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Subdomain deleted successfully');
                setShowDeleteModal(false);
                setSubdomainToDelete(null);
                setRefreshFlag(f => !f);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting subdomain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openAddModal = () => {
        fetchApexDomains();
        setShowAddModal(true);
    };

    const openDetailsModal = async (subdomain, edit = false) => {
        setDetailsSubdomain(subdomain);
        setShowDetailsModal(true);
        setIsEditMode(edit);
        setDetailsLoading(true);
        try {
            const response = await fetch(`/api/deeper/subdomains/${subdomain.id}/details`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setDetailsSubdomainData(data);
        } catch (error) {
            showNotification('Failed to load subdomain details', true);
            setDetailsSubdomainData(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const openDeleteModal = (subdomain) => {
        setSubdomainToDelete(subdomain);
        setShowDeleteModal(true);
    };

    const handleNewSubdomainChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewSubdomain(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <MetricCard title="Total Subdomains" value={subdomainMetrics.total_subdomains}/>
                <MetricCard title="Active Subdomains" value={subdomainMetrics.active_subdomains}/>
                <MetricCard title="New Today" value={subdomainMetrics.new_today}/>
                <MetricCard title="Total Apex Domains" value={subdomainMetrics.total_apex_domains}/>
                <MetricCard title="HTTP Servers" value={subdomainMetrics.http_servers}/>
                <MetricCard title="HTTPS Servers" value={subdomainMetrics.https_servers}/>
            </div>

            <div className="page-search">
                <input
                    type="text"
                    id="subdomainSearchInput"
                    className="filter-input"
                    placeholder="Search subdomains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    id="subdomainSearchButton"
                    className={`action-btn ${activeButtonId === 'subdomainSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('subdomainSearchButton', handleSearch)}
                >
                    Search
                </button>
                <button
                    id="refreshButton"
                    className={`action-btn ${activeButtonId === 'refreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('refreshButton', () => setRefreshFlag(f => !f))}
                >
                    Refresh
                </button>
                <button
                    id="addSubdomainButton"
                    className={`action-btn ${activeButtonId === 'addSubdomainButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('addSubdomainButton', openAddModal)}
                >
                    Add Subdomain
                </button>
            </div>

            <div className="programs-table">
                <DataTable
                    columns={subdomainColumns}
                    data={subdomains}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                        setRefreshFlag(f => !f);
                    }}
                    loading={loading}
                    noDataText="No subdomains available"
                    loadingText="Loading subdomains..."
                />
            </div>

            {/* Add Subdomain Modal */}
            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add Subdomain"
                    ariaLabel="Add Subdomain Modal"
                    size="large"
                >
                    <form onSubmit={handleAddSubdomain}>
                        <div className="form-group">
                            <label htmlFor="subdomain">Subdomain</label>
                            <input
                                type="text"
                                id="subdomain"
                                name="subdomain"
                                placeholder="sub.example.com"
                                value={newSubdomain.subdomain}
                                onChange={handleNewSubdomainChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="ip_address">IP Address</label>
                            <input
                                type="text"
                                id="ip_address"
                                name="ip_address"
                                value={newSubdomain.ip_address}
                                onChange={handleNewSubdomainChange}
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <button
                                type="button"
                                className={`toggle-btn${newSubdomain.is_active ? ' enabled' : ' disabled'}`}
                                aria-pressed={!!newSubdomain.is_active}
                                onClick={() => setNewSubdomain(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
                            >
                                Active
                            </button>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-neutral"
                                    onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add Subdomain
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Subdomain Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!subdomainToDelete}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete Subdomain Confirmation"
            >
                <p>Are you sure you want to delete the subdomain <span className="fw-700">{subdomainToDelete?.subdomain}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button type="button" className="action-btn action-btn-neutral" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </button>
                    <button type="button" className="action-btn action-btn-primary" onClick={handleDeleteSubdomain}>
                        Delete
                    </button>
                </div>
            </Modal>

            {/* View Subdomain Details Modal */}
            {showDetailsModal && detailsSubdomain && (
                <Modal
                    isOpen={showDetailsModal}
                    onClose={() => { setShowDetailsModal(false); setIsEditMode(false); }}
                    title="Subdomain Details"
                    ariaLabel="Subdomain Details Modal"
                    size="large"
                    header={
                        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ minWidth: 60, display: 'flex', gap: 8 }}>
                                {isEditMode ? (
                                    <button
                                        className="action-btn action-btn-neutral"
                                        aria-label="Cancel Edit"
                                        onClick={() => setIsEditMode(false)}
                                        style={{ minWidth: 90, fontWeight: 700 }}
                                    >
                                        Cancel
                                    </button>
                                ) : (
                                    <button
                                        className="action-btn action-btn-edit"
                                        aria-label="Edit Subdomain"
                                        onClick={() => setIsEditMode(true)}
                                        style={{ minWidth: 60 }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <h3 style={{ flex: 1, textAlign: 'center', margin: 0 }}>
                                Subdomain Details
                            </h3>
                            <button
                                className="modal-close"
                                onClick={() => { setShowDetailsModal(false); setIsEditMode(false); }}
                                aria-label="Close modal"
                                tabIndex={0}
                            >
                                ×
                            </button>
                        </div>
                    }
                >
                    {/* First row: Program | Subdomain (with pills, subdomain wider) */}
                    <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: 8}}>
                        <div>
                            <div className="view-label">Program</div>
                            <div className="view-value">
                                <ProgramWithLogo
                                    programName={detailsSubdomainData?.program || detailsSubdomain?.program || ''}
                                    platformName={detailsSubdomainData?.platform_name || detailsSubdomain?.platform_name || ''}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="view-label">Subdomain</div>
                            <div className="view-value" style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap'}}>
                                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>{detailsSubdomainData?.subdomain || detailsSubdomain?.subdomain || ''}</span>
                                {typeof detailsSubdomainData?.is_inscope !== 'undefined' && (
                                    <span className={`pill pill-disabled pill-small ${detailsSubdomainData.is_inscope ? 'in-scope' : 'out-scope'}`}>{detailsSubdomainData.is_inscope ? 'In Scope' : 'Out of Scope'}</span>
                                )}
                                {typeof detailsSubdomainData?.is_active !== 'undefined' && (
                                    <span className={`pill pill-small ${detailsSubdomainData.is_active ? 'in-scope' : 'out-scope'}`}>{detailsSubdomainData.is_active ? 'Active' : 'Inactive'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* First Seen | Last Seen row */}
                    <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16}}>
                        <div>
                            <div className="view-label">First Seen</div>
                            <div className="view-value">{detailsSubdomainData ? formatDate(detailsSubdomainData.first_seen) : ''}</div>
                        </div>
                        <div>
                            <div className="view-label">Last Seen</div>
                            <div className="view-value">{detailsSubdomainData ? formatDate(detailsSubdomainData.last_seen) : ''}</div>
                        </div>
                    </div>
                    {detailsLoading ? (
                        <div className="loading-spinner">Loading subdomain details...</div>
                    ) : detailsSubdomainData ? (
                        isEditMode ? (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const response = await fetch(`/api/deeper/subdomains/${detailsSubdomain.id}`, {
                                        method: 'PUT',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify(detailsSubdomainData),
                                    });
                                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                                    const result = await response.json();
                                    if (result.success) {
                                        showNotification('Subdomain updated successfully');
                                        setIsEditMode(false);
                                        setShowDetailsModal(false);
                                        setRefreshFlag(f => !f);
                                    } else {
                                        showNotification(`Error: ${result.error || 'Unknown error'}`, true);
                                    }
                                } catch (error) {
                                    showNotification(`Error: ${error.message}`, true);
                                }
                            }}>
                                <div className="form-group">
                                    <label htmlFor="ip_address">IP Address</label>
                                    <input
                                        type="text"
                                        id="ip_address"
                                        name="ip_address"
                                        value={detailsSubdomainData.ip_address || ''}
                                        onChange={e => setDetailsSubdomainData(prev => ({...prev, ip_address: e.target.value}))}
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <button
                                        type="button"
                                        className={`toggle-btn${detailsSubdomainData.is_active ? ' enabled' : ' disabled'}`}
                                        aria-pressed={!!detailsSubdomainData.is_active}
                                        onClick={() => setDetailsSubdomainData(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
                                    >
                                        Active
                                    </button>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="action-btn action-btn-neutral"
                                            onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="action-btn action-btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="view-label">IP Address</div>
                                <div className="view-value">{detailsSubdomainData.ip_address || 'N/A'}</div>
                                <div className="view-label" style={{marginTop: '1.5rem'}}>URLs</div>
                                <div className="cidr-list" style={{background: 'var(--background)', border: '1px solid var(--primary)', borderRadius: 8, padding: 12, marginBottom: 16}}>
                                    {detailsSubdomainData.urls && detailsSubdomainData.urls.length > 0 ? (
                                        detailsSubdomainData.urls.map((url, idx) => (
                                            <div key={idx} className="cidr-item" style={{display: 'flex', alignItems: 'center', marginBottom: '8px', background: 'rgba(18,27,29,0.7)', borderRadius: 6, padding: '6px 10px'}}>
                                                <span className="status-badge status-active" style={{marginRight: '12px', color: '#7fffd4', background: '#16443a', border: '1.5px solid #22d3ee', fontWeight: 700, letterSpacing: 1}}>{url.url}</span>
                                                <button className="copy-btn" onClick={() => copyInfoClipboard(url.url)} title="Copy URL" style={{marginLeft: 'auto', marginRight: 8}}>
                                                    <Clipboard size={14}/>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div>No URLs found for this subdomain.</div>
                                    )}
                                </div>
                            </>
                        )
                    ) : (
                        <div className="error-message">No details found.</div>
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

export default SubdomainManagement;