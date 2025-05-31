import React, { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../common/components/MetricCard';
import DataTable from '../../common/components/DataTable';
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import { Clipboard, Edit, Trash2 } from 'lucide-react';
import { copyInfoClipboard } from '../../common/functions';
import { useEscapeToClose } from '../../hooks';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';

const PossibleApexDomainsSection = () => {
    const [possibleApexDomains, setPossibleApexDomains] = useState([]);
    const [apexCurrentPage, setApexCurrentPage] = useState(1);
    const [apexTotalPages, setApexTotalPages] = useState(1);
    const [apexTotalItems, setApexTotalItems] = useState(0);
    const [apexSearch, setApexSearch] = useState('');
    const [apexLoading, setApexLoading] = useState(true);
    const [showAddApexModal, setShowAddApexModal] = useState(false);
    const [showEditApexModal, setShowEditApexModal] = useState(false);
    const [showDeleteApexModal, setShowDeleteApexModal] = useState(false);
    const [editingApexDomain, setEditingApexDomain] = useState(null);
    const [apexDomainToDelete, setApexDomainToDelete] = useState(null);
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const [newApexDomain, setNewApexDomain] = useState({
        apex_domain: '',
        fk_programs_id: '',
        status: 0,
        viewed: 0
    });
    const [programs, setPrograms] = useState([]);
    const [apexPerPage, setApexPerPage] = useGlobalPerPage();

    const apexColumns = useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
                Cell: ({ value }) => (
                    <div className="copy-cell">
                        <span>{value || 'N/A'}</span>
                        <button
                            className="copy-btn"
                            onClick={() => copyInfoClipboard(value || '')}
                            title="Copy domain id"
                            aria-label="Copy domain id"
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') copyInfoClipboard(value || ''); }}
                        >
                            <Clipboard size={14} />
                        </button>
                    </div>
                )
            },
            {
                Header: 'Program',
                accessor: 'program_name',
                Cell: ({ row }) => (
                    <ProgramWithLogo
                        programName={row.original.program_name || 'Unknown'}
                        platformName={row.original.platform_name || 'manual'}
                    />
                )
            },
            {
                Header: 'Apex Domain',
                accessor: 'apex_domain',
                Cell: ({ value }) => (
                    <div className="copy-cell">
                        <span>{value || 'N/A'}</span>
                        <button
                            className="copy-btn"
                            onClick={() => copyInfoClipboard(value || '')}
                            title="Copy apex domain"
                            aria-label="Copy apex domain"
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') copyInfoClipboard(value || ''); }}
                        >
                            <Clipboard size={14} />
                        </button>
                    </div>
                )
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ value }) => (
                    <span className={`status-badge status-${value ? 'active' : 'inactive'}`}>
                        {value ? 'Confirmed' : 'Possible'}
                    </span>
                )
            },
            {
                Header: 'Viewed',
                accessor: 'viewed',
                Cell: ({ value }) => (
                    <span className={`status-badge status-${value ? 'active' : 'inactive'}`}>
                        {value ? 'Viewed' : 'Unviewed'}
                    </span>
                )
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                width: 100,
                Cell: ({row}) => (
                    <div className="actions-cell">
                        <button
                            className="btn edit-btn"
                            aria-label="Edit apex domain"
                            tabIndex={0}
                            onClick={() => openEditApexModal(row.original)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openEditApexModal(row.original); }}
                        ><Edit size={14}/></button>
                        <button
                            className="btn delete-btn"
                            aria-label="Delete apex domain"
                            tabIndex={0}
                            onClick={() => openDeleteApexModal(row.original)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openDeleteApexModal(row.original); }}
                        ><Trash2 size={14}/></button>
                    </div>
                ),
                disableSortBy: true
            }
        ],
        []
    );

    useEffect(() => {
        loadPossibleApexDomains(1, apexPerPage, '');
        loadPrograms();
    }, []);

    const loadPossibleApexDomains = async (page = 1, limit = apexPerPage, search = '') => {
        setApexLoading(true);
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
                setPossibleApexDomains(data.data);
                setApexCurrentPage(data.pagination?.current_page || 1);
                setApexTotalPages(data.pagination?.total_pages || 1);
                setApexTotalItems(data.pagination?.total || 0);
            } else {
                setPossibleApexDomains([]);
            }
        } catch (error) {
            setPossibleApexDomains([]);
            setApexCurrentPage(1);
            setApexTotalPages(1);
            setApexTotalItems(0);
        } finally {
            setApexLoading(false);
        }
    };

    const loadPrograms = async () => {
        try {
            const response = await fetch('/api/deeper/programs');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
                setPrograms(data.data);
            } else {
                setPrograms([]);
            }
        } catch (error) {
            setPrograms([]);
        }
    };

    const handleApexSearch = () => {
        setApexCurrentPage(1);
        loadPossibleApexDomains(1, apexPerPage, apexSearch);
    };

    const openAddApexModal = () => { setShowAddApexModal(true); };
    const openEditApexModal = (item) => { setEditingApexDomain(item); setShowEditApexModal(true); };
    const openDeleteApexModal = (item) => { setApexDomainToDelete(item); setShowDeleteApexModal(true); };

    const handleAddApexDomain = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/deeper/possible-apex-domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newApexDomain)
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
                setPossibleApexDomains(data.data);
                setShowAddApexModal(false);
            } else {
                setPossibleApexDomains([]);
            }
        } catch (error) {
            setPossibleApexDomains([]);
        }
    };

    const handleEditApexDomain = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains/${editingApexDomain.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingApexDomain)
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
                setPossibleApexDomains(data.data);
                setShowEditApexModal(false);
            } else {
                setPossibleApexDomains([]);
            }
        } catch (error) {
            setPossibleApexDomains([]);
        }
    };

    const handleDeleteApexDomain = async () => {
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains/${apexDomainToDelete.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
                setPossibleApexDomains(data.data);
                setShowDeleteApexModal(false);
            } else {
                setPossibleApexDomains([]);
            }
        } catch (error) {
            setPossibleApexDomains([]);
        }
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleNewApexDomainChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewApexDomain(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditApexDomainChange = (e) => {
        const { name, value } = e.target;
        setEditingApexDomain(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <div className="programs-container">
                <div className="programs-metrics">
                    <MetricCard title="Total Possible Apex Domains" value={apexTotalItems} />
                    <MetricCard title="Viewed Domains" value={possibleApexDomains.filter(d => d.viewed === 1).length} />
                    <MetricCard title="Unviewed Domains" value={possibleApexDomains.filter(d => d.viewed !== 1).length} />
                    <MetricCard title="Confirmed Domains" value={possibleApexDomains.filter(d => d.status === 1).length} />
                    <MetricCard title="Programs With Domains" value={[...new Set(possibleApexDomains.map(d => d.fk_programs_id))].length} />
                    <MetricCard title="Most Recent ID" value={possibleApexDomains.length > 0 ? Math.max(...possibleApexDomains.map(d => d.id)) : 0} />
                </div>
                <div className="page-search">
                    <input
                        type="text"
                        id="apexSearchInput"
                        className="filter-input"
                        placeholder="Search possible apex domains..."
                        value={apexSearch}
                        onChange={(e) => setApexSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApexSearch()}
                    />
                    <button
                        className="action-btn action-btn-active"
                        onClick={handleApexSearch}
                    >
                        Search
                    </button>
                    <button
                        className="action-btn action-btn-active"
                        onClick={() => loadPossibleApexDomains(apexCurrentPage, apexPerPage, apexSearch)}
                    >
                        Refresh
                    </button>
                    <button
                        className="action-btn action-btn-active"
                        onClick={openAddApexModal}
                    >
                        Add Apex Domain
                    </button>
                </div>
                <div className="programs-table">
                    <DataTable
                        columns={apexColumns}
                        data={possibleApexDomains}
                        currentPage={apexCurrentPage}
                        totalPages={apexTotalPages}
                        totalItems={apexTotalItems}
                        perPage={apexPerPage}
                        onPageChange={(newPage) => loadPossibleApexDomains(newPage, apexPerPage, apexSearch)}
                        onPerPageChange={(newPerPage) => {
                            setApexPerPage(newPerPage);
                            setApexCurrentPage(1);
                            loadPossibleApexDomains(1, newPerPage, apexSearch);
                        }}
                        loading={apexLoading}
                        noDataText="No possible apex domains available"
                        loadingText="Loading possible apex domains..."
                    />
                </div>
            </div>
            {showAddApexModal && (
                <div className="modal">
                    <div className="modal-content view-modal-content" style={{ maxWidth: 700, width: '95%', overflowY: 'auto' }}>
                        <span className="modal-close" onClick={() => setShowAddApexModal(false)}>×</span>
                        <h3 style={{ marginBottom: '1rem' }}>Add Possible Apex Domain</h3>
                        <form onSubmit={handleAddApexDomain}>
                            <div className="form-group">
                                <label htmlFor="apexDomain">Apex Domain</label>
                                <input
                                    type="text"
                                    id="apexDomain"
                                    name="apex_domain"
                                    value={newApexDomain.apex_domain}
                                    onChange={handleNewApexDomainChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apexProgram">Program</label>
                                <select
                                    id="apexProgram"
                                    name="fk_programs_id"
                                    value={newApexDomain.fk_programs_id}
                                    onChange={handleNewApexDomainChange}
                                    required
                                >
                                    <option value="">Select Program</option>
                                    {programs.map(program => (
                                        <option key={program.id} value={program.id}>
                                            {program.program}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${newApexDomain.status ? ' enabled' : ' disabled'}`}
                                    aria-pressed={!!newApexDomain.status}
                                    onClick={() => setNewApexDomain(prev => ({ ...prev, status: prev.status ? 0 : 1 }))}
                                >
                                    Confirmed
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn${newApexDomain.viewed ? ' enabled' : ' disabled'}`}
                                    aria-pressed={!!newApexDomain.viewed}
                                    onClick={() => setNewApexDomain(prev => ({ ...prev, viewed: prev.viewed ? 0 : 1 }))}
                                >
                                    Viewed
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="action-btn action-btn-green" onClick={() => setShowAddApexModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">
                                    Add Apex Domain
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showEditApexModal && editingApexDomain && (
                <div className="modal">
                    <div className="modal-content view-modal-content" style={{ maxWidth: 700, width: '95%', overflowY: 'auto' }}>
                        <span className="modal-close" onClick={() => setShowEditApexModal(false)}>×</span>
                        <h3 style={{ marginBottom: '1rem' }}>Edit Possible Apex Domain</h3>
                        <form onSubmit={handleEditApexDomain}>
                            <div className="form-group">
                                <label htmlFor="editApexDomain">Apex Domain</label>
                                <input
                                    type="text"
                                    id="editApexDomain"
                                    name="apex_domain"
                                    value={editingApexDomain.apex_domain}
                                    onChange={handleEditApexDomainChange}
                                    required
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${editingApexDomain.status ? ' enabled' : ' disabled'}`}
                                    aria-pressed={!!editingApexDomain.status}
                                    onClick={() => setEditingApexDomain(prev => ({ ...prev, status: prev.status ? 0 : 1 }))}
                                >
                                    Confirmed
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn${editingApexDomain.viewed ? ' enabled' : ' disabled'}`}
                                    aria-pressed={!!editingApexDomain.viewed}
                                    onClick={() => setEditingApexDomain(prev => ({ ...prev, viewed: prev.viewed ? 0 : 1 }))}
                                >
                                    Viewed
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="action-btn action-btn-green" onClick={() => setShowEditApexModal(false)}>
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
            {showDeleteApexModal && apexDomainToDelete && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="modal-close" onClick={() => setShowDeleteApexModal(false)}>×</span>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete the possible apex domain "{apexDomainToDelete.apex_domain}"? This action cannot be undone.</p>
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green" onClick={() => setShowDeleteApexModal(false)}>
                                Cancel
                            </button>
                            <button type="button" className="action-btn action-btn-primary" onClick={handleDeleteApexDomain}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>{notification.message}</div>
            )}
            {useEscapeToClose(showAddApexModal, () => setShowAddApexModal(false))}
            {useEscapeToClose(showEditApexModal, () => setShowEditApexModal(false))}
            {useEscapeToClose(showDeleteApexModal, () => setShowDeleteApexModal(false))}
        </div>
    );
};

export default PossibleApexDomainsSection; 