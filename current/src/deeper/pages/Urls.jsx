import React, {useEffect, useMemo, useState} from 'react';
import MetricCard from '../../common/components/MetricCard';
import {Edit, Trash2, ExternalLink, Eye, Clipboard} from 'lucide-react';
import * as Hooks from '../../hooks';
import {copyInfoClipboard, handleOpen} from '../../common/functions';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import DataTable from '../../common/components/DataTable';
import {useEscapeToClose} from '../../hooks';
import {useGlobalPerPage} from '../../common/hooks/useGlobalPerPage';
import Modal from '../../common/components/Modal';
import '../../styles/Dashboard.css';

// const TECHNOLOGY_OPTIONS = ['Apache', 'nginx', 'IIS', 'Tomcat', 'Express', 'Node.js', 'Django', 'Flask'];

const Urls = () => {
    const [urls, setUrls] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    const [urlMetrics, setUrlMetrics] = useState({
        total_urls: 0,
        active_urls: 0,
        in_scope_urls: 0,
        urls_with_technologies: 0,
        urls_added_today: 0,
        average_technologies_per_url: 0,
    });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsUrl, setDetailsUrl] = useState(null);
    const [detailsUrlData, setDetailsUrlData] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [urlToDelete, setUrlToDelete] = useState(null);
    const [newUrl, setNewUrl] = useState({
        url: '', url_inscope: true,
    });

    // Subdomains dropdown states
    const [subdomains, setSubdomains] = useState([]);
    const [subdomainsLoading, setSubdomainsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('urlSearchButton');

    const urlColumns = useMemo(
        () => [
            {
                Header: 'Program',
                accessor: 'program',
                Cell: ({row}) => (
                    <ProgramWithLogo
                        programName={row.original.program}
                        platformName={row.original.platform_name || 'manual'}
                    />
                )
            },
            {
                Header: 'URL',
                accessor: 'url',
                Cell: ({value}) => (
                    <div className="copy-cell">
                        <span className="url-text">{value}</span>
                        <a href={value} className="text-gray-400 hover:text-white ml-1"
                           target="_blank" rel="noopener noreferrer" title="Open in new tab"
                           onClick={(e) => handleOpen(`${value}`, e)}>
                            <span className="ml-2 inline-block"/>
                            <ExternalLink size={14}/>
                        </a>
                        <button className="copy-btn" onClick={() => copyInfoClipboard(value)}
                                title="Copy value">
                            <Clipboard size={14}/>
                        </button>
                    </div>
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
                                title="Copy CIDR value">
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
                        {row.original.is_alive !== undefined && (
                            <span className={`status-badge ${row.original.alive ? 'status-yes' : 'status-no'}`}>
                            {row.original.alive ? 'Active' : 'Inactive'}
                        </span>
                        )}
                        <span className={`status-badge ${row.original.is_inscope ? 'status-yes' : 'status-no'}`}>
                        {row.original.is_inscope ? 'In Scope' : 'Out of Scope'}
                    </span>
                    </>
                )
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({row}) => (
                    <div className="actions-cell">
                        <button className="view-btn" title="View URL"
                                onClick={() => openDetailsModal(row.original, false)}>
                            <Eye size={14}/>
                        </button>
                        <button className="edit-btn" title="Edit URL"
                                onClick={() => openDetailsModal(row.original, true)}>
                            <Edit size={14}/>
                        </button>
                        <button className="delete-btn" title="Delete URL"
                                onClick={() => openDeleteModal(row.original)}>
                            <Trash2 size={14}/>
                        </button>
                    </div>
                )
            }
        ],
        []
    );

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    useEffect(() => {
        loadUrls(1, perPage, '');
        fetchUrlMetrics();
        fetchSubdomains();
    }, []);

    const fetchSubdomains = async () => {
        setSubdomainsLoading(true);
        try {
            const response = await fetch('/api/deeper/subdomains?limit=1000');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setSubdomains(data.data || []);
        } catch (error) {
            console.error('Error fetching subdomains:', error);
            showNotification('Failed to load subdomains', true);
            setSubdomains([]);
        } finally {
            setSubdomainsLoading(false);
        }
    };

    const loadUrls = async (page = 1, limit = perPage, search = '') => {
        setLoading(true);
        let url = `/api/deeper/urls?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setUrls(data);
                setCurrentPage(1);
                setTotalPages(1);
                setTotalItems(data.length);
            } else if (data.data) {
                setUrls(data.data);
                setCurrentPage(data.pagination?.current_page || 1);
                setTotalPages(data.pagination?.total_pages || 1);
                setTotalItems(data.pagination?.total || 0);
            } else {
                setUrls([]);
            }

            // Fetch metrics separately instead of calculating from current page data
            fetchUrlMetrics();
            setLoading(false);
        } catch (error) {
            console.error('Error fetching URLs:', error);
            showNotification(`Error: ${error.message}`, true);
            setLoading(false);
        }
    };

    const fetchUrlMetrics = async () => {
        try {
            const response = await fetch('/api/deeper/urls-metrics');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const metrics = await response.json();
            setUrlMetrics(metrics);
        } catch (error) {
            console.error('Error fetching URL metrics:', error);
            // Fallback to calculated metrics if API fails
            calculateUrlMetrics();
        }
    };

    const calculateUrlMetrics = (data = urls) => {
        try {
            const inScopeUrls = data.filter(u => u.url_inscope === 1).length;
            const activeUrls = data.filter(u => u.alive === 1).length;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const addedToday = data.filter(u => {
                if (!u.first_seen) return false;
                const firstSeen = new Date(u.first_seen);
                return firstSeen >= today;
            }).length;

            setUrlMetrics({
                total_urls: data.length,
                active_urls: activeUrls,
                in_scope_urls: inScopeUrls,
                urls_with_technologies: 0, // Placeholder
                urls_added_today: addedToday,
                average_technologies_per_url: 0, // Placeholder
            });
        } catch (error) {
            console.error('Error calculating URL metrics:', error);
            setUrlMetrics({
                total_urls: data.length,
                active_urls: Math.round(data.length * 0.6),
                in_scope_urls: Math.round(data.length * 0.5),
                urls_with_technologies: 0,
                urls_added_today: Math.round(data.length * 0.1),
                average_technologies_per_url: 0,
            });
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadUrls(1, perPage, searchTerm);
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

    const handleAddUrl = async (e) => {
        e.preventDefault();
        if (!newUrl.url) {
            showNotification('URL is required', true);
            return;
        }

        try {
            // Extract subdomain from URL
            let subdomain;
            try {
                const url = new URL(newUrl.url);
                subdomain = url.hostname;
            } catch (error) {
                // If URL is invalid, try to extract domain directly
                const match = newUrl.url.match(/^(?:https?:\/\/)?([^\/]+)/i);
                if (match && match[1]) {
                    subdomain = match[1];
                } else {
                    showNotification('Invalid URL format', true);
                    return;
                }
            }

            // Find the subdomain ID and program ID
            const subResponse = await fetch(`/api/deeper/subdomains?search=${encodeURIComponent(subdomain)}&limit=1`);
            if (!subResponse.ok) throw new Error(`HTTP error! Status: ${subResponse.status}`);
            const subData = await subResponse.json();

            // Check if the subdomain exists
            if (!subData.data || subData.data.length === 0) {
                // Show confirmation dialog
                setConfirmMessage(`Subdomain "${subdomain}" not found. Would you like to add it first?`);
                setConfirmAction(() => async () => {
                    try {
                        // Extract apex domain from subdomain
                        const parts = subdomain.split('.');
                        if (parts.length < 2) {
                            showNotification('Invalid subdomain format', true);
                            return;
                        }

                        // Get apex domain (last two parts of the subdomain)
                        const apexDomain = parts.slice(-2).join('.');

                        // Find the apex domain ID and program ID
                        const apexResponse = await fetch(`/api/shared/apex-domains?search=${encodeURIComponent(apexDomain)}`);
                        if (!apexResponse.ok) throw new Error(`HTTP error! Status: ${apexResponse.status}`);
                        const apexData = await apexResponse.json();

                        if (!apexData.data || apexData.data.length === 0) {
                            showNotification(`Apex domain "${apexDomain}" not found. Add this apex domain first.`, true);
                            setShowAddModal(false);
                            return;
                        }

                        // Use the first matching apex domain
                        const fk_apex_domains_id = apexData.data[0].id;
                        const fk_programs_id = apexData.data[0].fk_programs_id;

                        // Add the subdomain first
                        const subAddResponse = await fetch('/api/deeper/subdomains', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                subdomain: subdomain,
                                is_active: true,
                                fk_apex_domains_id: fk_apex_domains_id
                            }),
                        });

                        if (!subAddResponse.ok) {
                            const errorData = await subAddResponse.json();
                            throw new Error(`Failed to add subdomain: ${errorData.error || subAddResponse.statusText}`);
                        }

                        // Refetch the subdomain
                        const newSubResponse = await fetch(`/api/deeper/subdomains?search=${encodeURIComponent(subdomain)}&limit=1`);
                        if (!newSubResponse.ok) throw new Error(`HTTP error! Status: ${newSubResponse.status}`);
                        const newSubData = await newSubResponse.json();

                        if (!newSubData.data || newSubData.data.length === 0) {
                            throw new Error('Failed to retrieve the newly added subdomain');
                        }

                        // Use the newly added subdomain ID
                        const fk_subdomains_id = newSubData.data[0].id;

                        // Now add the URL with the program ID
                        const response = await fetch('/api/deeper/urls', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                url: newUrl.url,
                                url_inscope: newUrl.url_inscope,
                                fk_subdomains_id: fk_subdomains_id,
                                fk_programs_id: fk_programs_id
                            }),
                        });

                        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                        const result = await response.json();
                        if (result.success) {
                            showNotification('Subdomain and URL added successfully');
                            setShowAddModal(false);
                            setNewUrl({url: '', url_inscope: true});
                            loadUrls(currentPage, perPage, searchTerm);
                        } else {
                            showNotification(`Error: ${result.error || 'Unknown error'}`, true);
                        }
                    } catch (error) {
                        console.error('Error adding subdomain and URL:', error);
                        showNotification(`Error: ${error.message}`, true);
                    }
                });
                setShowConfirmModal(true);
                return;
            }

            // If subdomain exists, continue with adding the URL
            const fk_subdomains_id = subData.data[0].id;
            // Get the program ID from the subdomain's apex domain
            const fk_programs_id = subData.data[0].fk_programs_id;

            const response = await fetch('/api/deeper/urls', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    url: newUrl.url,
                    url_inscope: newUrl.url_inscope,
                    fk_subdomains_id: fk_subdomains_id,
                    fk_programs_id: fk_programs_id
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('URL added successfully');
                setShowAddModal(false);
                setNewUrl({url: '', url_inscope: true});
                loadUrls(currentPage, perPage, searchTerm);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding URL:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteUrl = async () => {
        try {
            const response = await fetch(`/api/deeper/urls/${urlToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('URL deleted successfully');
                setShowDeleteModal(false);
                setUrlToDelete(null);
                loadUrls(currentPage, perPage, searchTerm);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting URL:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openAddModal = () => {
        fetchSubdomains();
        setShowAddModal(true);
    };

    const openDetailsModal = async (url, edit = false) => {
        setDetailsUrl(url);
        setShowDetailsModal(true);
        setIsEditMode(edit);
        setDetailsLoading(true);
        try {
            const response = await fetch(`/api/deeper/urls/${url.id}/details`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setDetailsUrlData(data);
        } catch (error) {
            showNotification('Failed to load URL details', true);
            setDetailsUrlData(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const openDeleteModal = (url) => {
        setUrlToDelete(url);
        setShowDeleteModal(true);
    };

    const handleNewUrlChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewUrl(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };

    // Register Escape key to close modals
    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showDetailsModal, () => {
        setShowDetailsModal(false);
        setIsEditMode(false);
    });
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <MetricCard title="Total URLs" value={urlMetrics.total_urls}/>
                <MetricCard title="Active URLs" value={urlMetrics.active_urls}/>
                <MetricCard title="In Scope URLs" value={urlMetrics.in_scope_urls}/>
                <MetricCard title="URLs with Technologies" value={urlMetrics.urls_with_technologies}/>
                <MetricCard title="URLs Added Today" value={urlMetrics.urls_added_today}/>
                <MetricCard title="Avg Technologies per URL" value={urlMetrics.average_technologies_per_url}/>
            </div>

            <div className="page-search">
                <input
                    type="text"
                    id="urlSearchInput"
                    className="filter-input"
                    placeholder="Search URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    id="urlSearchButton"
                    className={`action-btn ${activeButtonId === 'urlSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('urlSearchButton', handleSearch)}
                >
                    Search
                </button>
                <button
                    id="refreshButton"
                    className={`action-btn ${activeButtonId === 'refreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('refreshButton', () => loadUrls(currentPage, perPage, searchTerm))}
                >
                    Refresh
                </button>
                <button
                    id="addUrlButton"
                    className={`action-btn ${activeButtonId === 'addUrlButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('addUrlButton', openAddModal)}
                >
                    Add URL
                </button>
            </div>

            <div className="programs-table">
                <DataTable
                    columns={urlColumns}
                    data={urls}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={(newPage) => loadUrls(newPage, perPage, searchTerm)}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                        loadUrls(1, newPerPage, searchTerm);
                    }}
                    loading={loading}
                    noDataText="No URLs available"
                    loadingText="Loading URLs..."
                />
            </div>
            {/* Add URL Modal */}
            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add URL"
                    ariaLabel="Add URL Modal"
                    size="large"
                >
                    <form onSubmit={handleAddUrl}>
                        <div className="form-group">
                            <label htmlFor="url">URL</label>
                            <input
                                type="text"
                                id="url"
                                name="url"
                                placeholder="https://sub.example.com/path"
                                value={newUrl.url}
                                onChange={handleNewUrlChange}
                                required
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <button
                                type="button"
                                className={`toggle-btn${newUrl.url_inscope ? ' enabled' : ' disabled'}`}
                                aria-pressed={!!newUrl.url_inscope}
                                onClick={() => setNewUrl(prev => ({
                                    ...prev,
                                    url_inscope: prev.url_inscope ? 0 : 1
                                }))}
                            >
                                In Scope
                            </button>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green"
                                    onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add URL
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <Modal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    title="Confirmation"
                    ariaLabel="Confirmation Modal"
                >
                    <p>{confirmMessage}</p>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="action-btn action-btn-green"
                            onClick={() => {
                                setShowConfirmModal(false);
                                setShowAddModal(false);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="action-btn action-btn-primary"
                            onClick={() => {
                                confirmAction && confirmAction();
                                setShowConfirmModal(false);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </Modal>
            )}
            {showDetailsModal && detailsUrl && (
                <Modal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setIsEditMode(false);
                    }}
                    title="URL Details"
                    ariaLabel="URL Details Modal"
                    size="large"
                    header={
                        <div className="modal-header" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 24
                        }}>
                            <div style={{minWidth: 60, display: 'flex', gap: 8}}>
                                {isEditMode ? (
                                    <button
                                        className="action-btn action-btn-neutral"
                                        aria-label="Cancel Edit"
                                        onClick={() => setIsEditMode(false)}
                                        style={{minWidth: 90, fontWeight: 700}}
                                    >
                                        Cancel
                                    </button>
                                ) : (
                                    <button
                                        className="action-btn action-btn-edit"
                                        aria-label="Edit URL"
                                        onClick={() => setIsEditMode(true)}
                                        style={{minWidth: 60}}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <h3 style={{flex: 1, textAlign: 'center', margin: 0}}>
                                URL Details
                            </h3>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setIsEditMode(false);
                                }}
                                aria-label="Close modal"
                                tabIndex={0}
                            >
                                ×
                            </button>
                        </div>
                    }
                >
                    {/* First row: Program | URL */}
                    <div className="details-grid"
                         style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 8}}>
                        <div>
                            <div className="view-label">Program</div>
                            <div className="view-value">
                                <ProgramWithLogo
                                    programName={detailsUrlData?.program || detailsUrl?.program || ''}
                                    platformName={detailsUrlData?.platform_name || detailsUrl?.platform_name || ''}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="view-label">URL</div>
                            <div className="view-value" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <span>{detailsUrlData?.url || detailsUrl?.url || ''}</span>
                                {typeof detailsUrlData?.url_inscope !== 'undefined' && (
                                    <span
                                        className={`pill pill-disabled pill-small ${detailsUrlData.url_inscope ? 'in-scope' : 'out-scope'}`}>{detailsUrlData.url_inscope ? 'In Scope' : 'Out of Scope'}</span>
                                )}
                                {typeof detailsUrlData?.is_alive !== 'undefined' && (
                                    <span
                                        className={`pill pill-small ${detailsUrlData.is_alive ? 'in-scope' : 'out-scope'}`}>{detailsUrlData.is_alive ? 'Active' : 'Inactive'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* First Seen | Last Seen row */}
                    <div className="details-grid"
                         style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16}}>
                        <div>
                            <div className="view-label">First Seen</div>
                            <div
                                className="view-value">{detailsUrlData ? formatDate(detailsUrlData.first_seen) : ''}</div>
                        </div>
                        <div>
                            <div className="view-label">Last Seen</div>
                            <div
                                className="view-value">{detailsUrlData ? formatDate(detailsUrlData.last_seen) : ''}</div>
                        </div>
                    </div>
                    {isEditMode ? (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const response = await fetch(`/api/deeper/urls/${detailsUrl.id}`, {
                                    method: 'PUT',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify(detailsUrlData),
                                });
                                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                                const result = await response.json();
                                if (result.success) {
                                    showNotification('URL updated successfully');
                                    setIsEditMode(false);
                                    setShowDetailsModal(false);
                                    loadUrls(currentPage, perPage, searchTerm);
                                } else {
                                    showNotification(`Error: ${result.error || 'Unknown error'}`, true);
                                }
                            } catch (error) {
                                showNotification(`Error: ${error.message}`, true);
                            }
                        }}>
                            <div className="form-group">
                                <label htmlFor="url">URL</label>
                                <input
                                    type="text"
                                    id="url"
                                    name="url"
                                    value={detailsUrlData.url || ''}
                                    onChange={e => setDetailsUrlData(prev => ({...prev, url: e.target.value}))}
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${detailsUrlData.url_inscope ? ' enabled' : ' disabled'}`}
                                    aria-pressed={!!detailsUrlData.url_inscope}
                                    onClick={() => setDetailsUrlData(prev => ({
                                        ...prev,
                                        url_inscope: prev.url_inscope ? 0 : 1
                                    }))}
                                >
                                    In Scope
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
                            <div className="view-label">Status</div>
                            <div className="view-value">
                                {typeof detailsUrlData?.is_alive !== 'undefined' ? (
                                    <span
                                        className={`pill pill-small ${detailsUrlData.is_alive ? 'in-scope' : 'out-scope'}`}>{detailsUrlData.is_alive ? 'Active' : 'Inactive'}</span>
                                ) : 'N/A'}
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* Delete URL Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!urlToDelete}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete URL Confirmation"
            >
                <p>Are you sure you want to delete the URL <span className="fw-700">{urlToDelete?.url}</span>? This
                    action cannot be undone.</p>
                <div className="form-actions">
                    <button type="button" className="action-btn action-btn-green"
                            onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </button>
                    <button type="button" className="action-btn action-btn-primary" onClick={handleDeleteUrl}>
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

export default Urls;