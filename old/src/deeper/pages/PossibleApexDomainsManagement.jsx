import React, { useEffect, useState } from 'react';
import MetricCard from '../../common/components/MetricCard';
import DataTable from '../../common/components/DataTable';
import * as Hooks from '../../hooks';
import { copyInfoClipboard } from '../../common/functions';
import { possibleApexColumns } from '../../common/tableConfigs/possibleApex';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import Modal from '../../common/components/Modal';

// --- Custom hook for table data and optimistic actions ---
function usePossibleApexDomainsTableData() {
    const [possibleApexDomains, setPossibleApexDomains] = useState([]);
    const [apexCurrentPage, setApexCurrentPage] = useState(1);
    const [apexTotalPages, setApexTotalPages] = useState(1);
    const [apexTotalItems, setApexTotalItems] = useState(0);
    const [apexSearch, setApexSearch] = useState('');
    const [apexLoading, setApexLoading] = useState(true);
    const [apexPerPage, setApexPerPage] = useGlobalPerPage();

    const loadPossibleApexDomains = async (page = 1, limit = apexPerPage, search = '') => {
        setApexLoading(true);
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setPossibleApexDomains(Array.isArray(data.data) ? data.data : []);
            setApexCurrentPage(data.pagination?.current_page || 1);
            setApexTotalPages(data.pagination?.total_pages || 1);
            setApexTotalItems(data.pagination?.total || 0);
        } catch (error) {
            setPossibleApexDomains([]);
        } finally {
            setApexLoading(false);
        }
    };

    // Optimistic add
    const optimisticAdd = async (item, onSuccess, onError) => {
        const tempId = 'temp-' + Date.now();
        setPossibleApexDomains(prev => [{...item, id: tempId}, ...prev]);
        setApexTotalItems(t => t + 1);
        try {
            const response = await fetch('/api/deeper/possible-apex-domains', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(item),
            });
            const result = await response.json();
            if (result.success) {
                setPossibleApexDomains(prev => prev.map(d => d.id === tempId ? {...result.data} : d));
                onSuccess && onSuccess();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            setPossibleApexDomains(prev => prev.filter(d => d.id !== tempId));
            setApexTotalItems(t => t - 1);
            onError && onError(e.message);
        }
    };

    // Optimistic edit
    const optimisticEdit = async (item, onSuccess, onError) => {
        const old = possibleApexDomains.find(d => d.id === item.id);
        setPossibleApexDomains(prev => prev.map(d => d.id === item.id ? {...d, ...item} : d));
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains/${item.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(item),
            });
            const result = await response.json();
            if (result.success) {
                onSuccess && onSuccess();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            setPossibleApexDomains(prev => prev.map(d => d.id === item.id ? old : d));
            onError && onError(e.message);
        }
    };

    // Optimistic delete
    const optimisticDelete = async (item, onSuccess, onError) => {
        const old = possibleApexDomains.find(d => d.id === item.id);
        setPossibleApexDomains(prev => prev.filter(d => d.id !== item.id));
        setApexTotalItems(t => t - 1);
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains/${item.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            const result = await response.json();
            if (result.success) {
                onSuccess && onSuccess();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            setPossibleApexDomains(prev => [...prev, old]);
            setApexTotalItems(t => t + 1);
            onError && onError(e.message);
        }
    };

    useEffect(() => {
        loadPossibleApexDomains(1, apexPerPage, '');
        // eslint-disable-next-line
    }, []);

    return {
        possibleApexDomains,
        setPossibleApexDomains,
        apexCurrentPage,
        setApexCurrentPage,
        apexTotalPages,
        apexTotalItems,
        setApexTotalItems,
        apexSearch,
        setApexSearch,
        apexLoading,
        apexPerPage,
        setApexPerPage,
        loadPossibleApexDomains,
        optimisticAdd,
        optimisticEdit,
        optimisticDelete,
    };
}

const PossibleApexDomainsManagement = () => {
    // State
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [showAddApexModal, setShowAddApexModal] = useState(false);
    const [showEditApexModal, setShowEditApexModal] = useState(false);
    const [showDeleteApexModal, setShowDeleteApexModal] = useState(false);
    const [editingApexDomain, setEditingApexDomain] = useState(null);
    const [apexDomainToDelete, setApexDomainToDelete] = useState(null);
    const [newApexDomain, setNewApexDomain] = useState({
        apex_domain: '',
        viewed: false,
        status: false,
        fk_programs_id: ''
    });
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const {
        activeButtonId: activeApexButtonId,
        handleButtonClick: handleApexButtonClick
    } = Hooks.useButtonToggle('apexSearchButton');

    // Data loading
    useEffect(() => {
        fetchPrograms();
        loadPossibleApexDomains(1, apexPerPage, '');
    }, []);

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

    const {
        possibleApexDomains,
        setPossibleApexDomains,
        apexCurrentPage,
        setApexCurrentPage,
        apexTotalPages,
        apexTotalItems,
        setApexTotalItems,
        apexSearch,
        setApexSearch,
        apexLoading,
        apexPerPage,
        setApexPerPage,
        loadPossibleApexDomains,
        optimisticAdd,
        optimisticEdit,
        optimisticDelete,
    } = usePossibleApexDomainsTableData();

    // CRUD handlers
    const handleApexSearch = () => {
        setApexCurrentPage(1);
        loadPossibleApexDomains(1, apexPerPage, apexSearch);
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleAddApexDomain = async (e) => {
        e.preventDefault();
        const item = {
            apex_domain: newApexDomain.apex_domain,
            viewed: newApexDomain.viewed ? 1 : 0,
            status: newApexDomain.status ? 1 : 0,
            fk_programs_id: newApexDomain.fk_programs_id
        };
        optimisticAdd(item, () => {
            showNotification('Possible apex domain added successfully');
            setShowAddApexModal(false);
            setNewApexDomain({apex_domain: '', viewed: false, status: false, fk_programs_id: ''});
        }, (errMsg) => {
            showNotification(`Error: ${errMsg}`, true);
        });
    };

    const handleEditApexDomain = async (e) => {
        e.preventDefault();
        const item = {
            ...editingApexDomain,
            viewed: editingApexDomain.viewed ? 1 : 0,
            status: editingApexDomain.status ? 1 : 0,
        };
        optimisticEdit(item, () => {
            showNotification('Possible apex domain updated successfully');
            setShowEditApexModal(false);
        }, (errMsg) => {
            showNotification(`Error: ${errMsg}`, true);
        });
    };

    const handleDeleteApexDomain = async () => {
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains/${apexDomainToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Possible apex domain deleted successfully');
                setShowDeleteApexModal(false);
                setApexDomainToDelete(null);
                loadPossibleApexDomains(apexCurrentPage, apexPerPage, apexSearch);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openAddApexModal = () => {
        fetchPrograms();
        setShowAddApexModal(true);
    };

    const openEditApexModal = (apexDomain) => {
        setEditingApexDomain({
            ...apexDomain,
            viewed: apexDomain.viewed === 1,
            status: apexDomain.status === 1
        });
        setShowEditApexModal(true);
    };

    const openDeleteApexModal = (apexDomain) => {
        setApexDomainToDelete(apexDomain);
        setShowDeleteApexModal(true);
    };

    const handleNewApexDomainChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewApexDomain(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditApexDomainChange = (e) => {
        const {name, value, type, checked} = e.target;
        setEditingApexDomain(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <MetricCard title="Total Possible Apex Domains" value={apexTotalItems}/>
                <MetricCard title="Viewed Domains" value={possibleApexDomains.filter(d => d.viewed === 1).length}/>
                <MetricCard title="Unviewed Domains" value={possibleApexDomains.filter(d => d.viewed !== 1).length}/>
                <MetricCard title="Confirmed Domains" value={possibleApexDomains.filter(d => d.status === 1).length}/>
                <MetricCard title="Programs With Domains"
                            value={[...new Set(possibleApexDomains.map(d => d.fk_programs_id))].length}/>
                <MetricCard title="Most Recent ID"
                            value={possibleApexDomains.length > 0 ? Math.max(...possibleApexDomains.map(d => d.id)) : 0}/>
            </div>
            <div className="page-search">
                <input
                    type="text"
                    id="apexSearchInput"
                    className="filter-input"
                    placeholder="Search possible apex domains..."
                    value={apexSearch}
                    onChange={e => setApexSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApexSearch()}
                />
                <button id="apexSearchButton"
                        className={`action-btn ${activeApexButtonId === 'apexSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                        onClick={() => handleApexButtonClick('apexSearchButton', handleApexSearch)}>Search
                </button>
                <button id="apexRefreshButton"
                        className={`action-btn ${activeApexButtonId === 'apexRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                        onClick={() => handleApexButtonClick('apexRefreshButton', () => loadPossibleApexDomains(apexCurrentPage, apexPerPage, apexSearch))}>Refresh
                </button>
                <button id="addApexButton"
                        className={`action-btn ${activeApexButtonId === 'addApexButton' ? 'action-btn-active' : 'action-btn-active'}`}
                        onClick={() => handleApexButtonClick('addApexButton', openAddApexModal)}>Add Apex Domain
                </button>
            </div>
            <div className="programs-table">
                <DataTable
                    columns={possibleApexColumns}
                    data={possibleApexDomains}
                    currentPage={apexCurrentPage}
                    totalPages={apexTotalPages}
                    totalItems={apexTotalItems}
                    perPage={apexPerPage}
                    onPageChange={newPage => loadPossibleApexDomains(newPage, apexPerPage, apexSearch)}
                    onPerPageChange={newPerPage => {
                        setApexPerPage(newPerPage);
                        setApexCurrentPage(1);
                        loadPossibleApexDomains(1, newPerPage, apexSearch);
                    }}
                    loading={apexLoading}
                    noDataText="No possible apex domains available"
                    loadingText="Loading possible apex domains..."
                    copyInfoClipboard={copyInfoClipboard}
                    openEditApexModal={openEditApexModal}
                    openDeleteApexModal={openDeleteApexModal}
                />
            </div>
            {/* Add Modal */}
            {showAddApexModal && (
                <Modal
                    isOpen={showAddApexModal}
                    onClose={() => setShowAddApexModal(false)}
                    title="Add Possible Apex Domain"
                    ariaLabel="Add Possible Apex Domain Modal"
                    size="large"
                >
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
                                onClick={() => setNewApexDomain(prev => ({...prev, status: prev.status ? 0 : 1}))}
                            >
                                Confirmed
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn${newApexDomain.viewed ? ' enabled' : ' disabled'}`}
                                aria-pressed={!!newApexDomain.viewed}
                                onClick={() => setNewApexDomain(prev => ({...prev, viewed: prev.viewed ? 0 : 1}))}
                            >
                                Viewed
                            </button>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green"
                                    onClick={() => setShowAddApexModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add Apex Domain
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {/* Edit Modal */}
            {showEditApexModal && editingApexDomain && (
                <Modal
                    isOpen={showEditApexModal}
                    onClose={() => setShowEditApexModal(false)}
                    title="Edit Possible Apex Domain"
                    ariaLabel="Edit Possible Apex Domain Modal"
                    size="large"
                >
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
                        <div className="form-group">
                            <label htmlFor="editApexProgram">Program</label>
                            <select
                                id="editApexProgram"
                                name="fk_programs_id"
                                value={editingApexDomain.fk_programs_id}
                                onChange={handleEditApexDomainChange}
                                required
                            >
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
                                className={`toggle-btn${editingApexDomain.status ? ' enabled' : ' disabled'}`}
                                aria-pressed={!!editingApexDomain.status}
                                onClick={() => setEditingApexDomain(prev => ({
                                    ...prev,
                                    status: prev.status ? 0 : 1
                                }))}
                            >
                                Confirmed
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn${editingApexDomain.viewed ? ' enabled' : ' disabled'}`}
                                aria-pressed={!!editingApexDomain.viewed}
                                onClick={() => setEditingApexDomain(prev => ({
                                    ...prev,
                                    viewed: prev.viewed ? 0 : 1
                                }))}
                            >
                                Viewed
                            </button>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green"
                                    onClick={() => setShowEditApexModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteApexModal && !!apexDomainToDelete}
                onClose={() => setShowDeleteApexModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete Apex Domain Confirmation"
            >
                <p>Are you sure you want to delete the possible apex domain <span className="fw-700">{apexDomainToDelete?.apex_domain}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button type="button" className="action-btn action-btn-green" onClick={() => setShowDeleteApexModal(false)}>
                        Cancel
                    </button>
                    <button type="button" className="action-btn action-btn-primary" onClick={handleDeleteApexDomain}>
                        Delete
                    </button>
                </div>
            </Modal>
            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>{notification.message}</div>
            )}
        </div>
    );
};

export default PossibleApexDomainsManagement;