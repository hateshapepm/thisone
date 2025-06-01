import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MetricCard from '../../common/components/MetricCard';
import Header from '../../common/components/Header';
import * as Hooks from '../../hooks';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import { whoisColumns, apexColumns } from '../../common/tableConfigs/whois';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';

const WhoisManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [whoisData, setWhoisData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [expandedRows, setExpandedRows] = useState({});
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    const [whoisMetrics, setWhoisMetrics] = useState({
        orgs: 0, names: 0, emails: 0, addresses: 0, nameservers: 0, phones: 0,
    });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [newItem, setNewItem] = useState({type: 'orgs', value: '', fk_programs_id: ''});

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

    // Tab state
    const [activeTab, setActiveTab] = useState(() => {
        return location?.state?.activeTab || 'whois';
    });

    const tabs = [
        {id: 'whois', name: 'WHOIS Data'},
        {id: 'possibleApexDomains', name: 'Possible Apex Domains'},
    ];

    // Possible apex domains states
    const [possibleApexDomains, setPossibleApexDomains] = useState([]);
    const [apexCurrentPage, setApexCurrentPage] = useState(1);
    const [apexTotalPages, setApexTotalPages] = useState(1);
    const [apexTotalItems, setApexTotalItems] = useState(0);
    const [apexSearch, setApexSearch] = useState('');
    const [apexLoading, setApexLoading] = useState(true);
    const [apexPerPage, setApexPerPage] = useGlobalPerPage();

    // State for apex domain modals
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

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('whoisSearchButton');

    // Add this hook for apex search button
    const {
        activeButtonId: activeApexButtonId,
        handleButtonClick: handleApexButtonClick
    } = Hooks.useButtonToggle('apexSearchButton');

    // Register Escape key to close modals
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));
    useEscapeToClose(showAddApexModal, () => setShowAddApexModal(false));
    useEscapeToClose(showEditApexModal, () => setShowEditApexModal(false));
    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showEditModal, () => setShowEditModal(false));

    const [refreshFlag, setRefreshFlag] = useState(false);
    const [localWhoisTableData, setLocalWhoisTableData] = useState([]);

    useEffect(() => {
        setLocalWhoisTableData(whoisData);
    }, [whoisData]);

    const whoisColumnsConfig = useMemo(() =>
            whoisColumns(expandedRows, toggleRow, openEditModal, openDeleteModal),
        [expandedRows]
    );

    // Add this useEffect to respond to location state changes
    useEffect(() => {
        const locationState = location?.state;
        if (locationState && locationState.activeTab) {
            setActiveTab(locationState.activeTab);
        }
    }, [location?.state]);

    useEffect(() => {
        // Initial data loading
        loadWhoisMetrics();
        fetchPrograms();

        // Load data based on which tab is initially active
        if (activeTab === 'whois') {
            loadData(1, perPage, '');
        } else if (activeTab === 'possibleApexDomains') {
            loadPossibleApexDomains(1, apexPerPage, '');
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'possibleApexDomains') {
            loadPossibleApexDomains(1, apexPerPage, apexSearch);
        }
    }, [activeTab, apexPerPage, apexSearch]);

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

    const loadData = async (page = 1, limit = perPage, search = '') => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/deeper/whois?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
            );
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Check if data.data exists and is an array
            if (data.success && Array.isArray(data.data)) {
                setWhoisData(data.data);
                setCurrentPage(data.pagination?.current_page || 1);
                setTotalPages(data.pagination?.total_pages || 1);
                setTotalItems(data.pagination?.total || 0);
            } else {
                console.error('Unexpected API response format:', data);
                setWhoisData([]);
                setCurrentPage(1);
                setTotalPages(1);
                setTotalItems(0);
            }

            // Always fetch the metrics when loading data
            loadWhoisMetrics();
            setLoading(false);
        } catch (error) {
            console.error('Error fetching WHOIS data:', error);
            showNotification(`Error: ${error.message}`, true);
            setLoading(false);
        }
    };

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
            setApexLoading(false);
        } catch (error) {
            console.error('Error fetching possible apex domains:', error);
            showNotification(`Error: ${error.message}`, true);
            setApexLoading(false);

            // Mock data as fallback
            const mockApexDomains = [
                {
                    id: 1,
                    apex_domain: 'example.com',
                    viewed: 0,
                    status: 0,
                    fk_programs_id: 1,
                    program_name: 'manual'
                },
                {
                    id: 2,
                    apex_domain: 'test.com',
                    viewed: 0,
                    status: 1,
                    fk_programs_id: 2,
                    program_name: 'example'
                }
            ];
            setPossibleApexDomains(mockApexDomains);
            setApexCurrentPage(1);
            setApexTotalPages(1);
            setApexTotalItems(mockApexDomains.length);
        }
    };

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
            console.error('Error fetching WHOIS metrics:', error);
            // Don't show notification for metrics failure to avoid being too noisy
        }
    };
    const calculateWhoisMetrics = (data = whoisData) => {
        try {
            // This is trying to calculate from the component data instead of using API metrics
            setWhoisMetrics({
                orgs: data.length,
                names: data.reduce((sum, org) => sum + (org.related?.filter(r => r.type === 'names').length || 0), 0),
                emails: data.reduce((sum, org) => sum + (org.related?.filter(r => r.type === 'emails').length || 0), 0),
                addresses: data.reduce((sum, org) => sum + (org.related?.filter(r => r.type === 'addresses').length || 0), 0),
                nameservers: data.reduce((sum, org) => sum + (org.related?.filter(r => r.type === 'nameservers').length || 0), 0),
                phones: data.reduce((sum, org) => sum + (org.related?.filter(r => r.type === 'phones').length || 0), 0),
            });
        } catch (error) {
            console.error('Error calculating WHOIS metrics:', error);
            setWhoisMetrics({
                orgs: data.length,
                names: Math.round(data.length * 0.5),
                emails: Math.round(data.length * 0.4),
                addresses: Math.round(data.length * 0.3),
                nameservers: Math.round(data.length * 0.6),
                phones: Math.round(data.length * 0.2),
            });
        }
    };
    const toggleRow = (orgId) => {
        setExpandedRows(prev => {
            const newState = {...prev, [orgId]: !prev[orgId]};

            // If we're expanding a row, fetch related data
            if (newState[orgId]) {
                fetchRelatedItems(orgId);
            }

            return newState;
        });
    };

    // Function to fetch related items for an organization
    const fetchRelatedItems = async (orgId) => {
        try {
            const org = whoisData.find(item => item.id === orgId);
            if (!org) return;

            const response = await fetch(`/api/deeper/whois/related/${orgId}?programId=${org.fk_programs_id}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                // Update the whoisData with the related items
                setWhoisData(prevData => {
                    return prevData.map(item => {
                        if (item.id === orgId) {
                            return {...item, related: result.data || []};
                        }
                        return item;
                    });
                });

                // Update metrics after fetching related items
                calculateWhoisMetrics();
            }
        } catch (error) {
            console.error('Error fetching related items:', error);
            showNotification(`Error fetching related items: ${error.message}`, true);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadData(1, perPage, searchTerm);
    };

    const handleApexSearch = () => {
        setApexCurrentPage(1);
        loadPossibleApexDomains(1, apexPerPage, apexSearch);
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/deeper/whois', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newItem),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Item added successfully');
                setShowAddModal(false);
                afterAction(); // Just refresh, don't remove
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/deeper/whois/${editingItem.type}/${editingItem.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingItem),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Item updated successfully');
                setShowEditModal(false);
                afterAction(); // Just refresh, don't remove
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/deeper/whois/${itemToDelete.type}/${itemToDelete.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                showNotification('Item deleted successfully');
                setShowDeleteModal(false);
                afterAction(itemToDelete.id);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddApexDomain = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/deeper/possible-apex-domains', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    apex_domain: newApexDomain.apex_domain,
                    viewed: newApexDomain.viewed ? 1 : 0,
                    status: newApexDomain.status ? 1 : 0,
                    fk_programs_id: newApexDomain.fk_programs_id
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Possible apex domain added successfully');
                setShowAddApexModal(false);
                setNewApexDomain({
                    apex_domain: '',
                    viewed: false,
                    status: false,
                    fk_programs_id: ''
                });
                loadPossibleApexDomains(apexCurrentPage, apexPerPage, apexSearch);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding possible apex domain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditApexDomain = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/deeper/possible-apex-domains/${editingApexDomain.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    apex_domain: editingApexDomain.apex_domain,
                    viewed: editingApexDomain.viewed ? 1 : 0,
                    status: editingApexDomain.status ? 1 : 0,
                    fk_programs_id: editingApexDomain.fk_programs_id
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Possible apex domain updated successfully');
                setShowEditApexModal(false);
                loadPossibleApexDomains(apexCurrentPage, apexPerPage, apexSearch);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating possible apex domain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
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
            console.error('Error deleting possible apex domain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openAddModal = () => {
        fetchPrograms();
        setShowAddModal(true);
        setNewItem({type: 'orgs', value: '', fk_programs_id: ''});
        setSelectedOrg(null);
        setCreateNewOrg(false);
        setOrgFilterText('');
    };

    const openAddApexModal = () => {
        fetchPrograms();
        setShowAddApexModal(true);
    };

    const openEditModal = (item) => {
        console.log('Opening edit modal with item:', item);

        // For organizations, ensure we use the correct ID from the database and always set fk_programs_id
        if (item.type === 'orgs') {
            const correctedItem = {
                ...item,
                id: item.id, // This should be the actual organization ID
                fk_programs_id: item.fk_programs_id || item.program_id || ''
            };
            setEditingItem(correctedItem);
        } else {
            setEditingItem({...item});
        }

        setShowEditModal(true);
    };

    const openEditApexModal = (apexDomain) => {
        setEditingApexDomain({
            ...apexDomain,
            viewed: apexDomain.viewed === 1,
            status: apexDomain.status === 1
        });
        setShowEditApexModal(true);
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const openDeleteApexModal = (apexDomain) => {
        setApexDomainToDelete(apexDomain);
        setShowDeleteApexModal(true);
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

    const switchTab = (tabName) => {
        console.log('Switching to tab:', tabName);
        setActiveTab(tabName);
        if (tabName === 'possibleApexDomains') {
            loadPossibleApexDomains(1, apexPerPage, apexSearch);
        }
    };

    const tableData = useMemo(() => {
        return whoisData.flatMap(org => {
            const rows = [{...org, type: 'orgs', value: org.value || org.name || ''}];
            if (expandedRows[org.id] && org.related && org.related.length > 0) {
                // Insert a header row for the expanded section
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
                        expander: ''
                    }))
                );
            }
            return rows;
        });
    }, [whoisData, expandedRows]);

    // Add useEffect to fetch organizations when program is selected
    useEffect(() => {
        // When a program is selected in the add modal, fetch organizations for that program
        if (newItem.fk_programs_id) {
            fetchOrganizations(newItem.fk_programs_id);
        }
    }, [newItem.fk_programs_id]);

    // Add organization fetching function
    const fetchOrganizations = async (programId) => {
        if (!programId) return;

        setOrgsLoading(true);
        try {
            const response = await fetch(`/api/deeper/whois?page=1&limit=100&programId=${programId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Filter for only org type records
            const orgs = data.data ? data.data.filter(item => item.type === 'orgs') : [];
            setOrganizations(orgs);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            showNotification('Failed to load organizations', true);
            setOrganizations([]);
        } finally {
            setOrgsLoading(false);
        }
    };

    // Helper function to singularize type names
    const singularizeType = (type) => {
        if (type === 'emails') return 'email';
        if (type === 'addresses') return 'address';
        if (type === 'phones') return 'phone';
        if (type === 'nameservers') return 'nameserver';
        if (type === 'names') return 'name';
        if (type === 'orgs') return 'organization';
        return type.slice(0, -1); // Default: remove trailing 's'
    };

    const afterAction = (removedId) => {
        loadWhoisMetrics();
        setLocalWhoisTableData(prev => prev.filter(row =>
            row.id !== removedId
        ));
        setRefreshFlag(f => !f);
    };

    const handleApexPerPageChange = (newPerPage) => {
        setApexPerPage(newPerPage);
        setApexCurrentPage(1);
        loadPossibleApexDomains(1, newPerPage, apexSearch);
    };

    return (
        <div className="programs-container">
            <Header
                pageName="WHOIS Management"
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={switchTab} // Pass the switchTab function
            />
            {activeTab === 'whois' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        <MetricCard title="Organizations" value={whoisMetrics.orgs}/>
                        <MetricCard title="Names" value={whoisMetrics.names}/>
                        <MetricCard title="Emails" value={whoisMetrics.emails}/>
                        <MetricCard title="Addresses" value={whoisMetrics.addresses}/>
                        <MetricCard title="Nameservers" value={whoisMetrics.nameservers}/>
                        <MetricCard title="Phones" value={whoisMetrics.phones}/>
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
                            id="whoisSearchButton"
                            className={`action-btn ${activeButtonId === 'whoisSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                            onClick={() => handleButtonClick('whoisSearchButton', handleSearch)}
                        >
                            Search
                        </button>
                        <button
                            id="refreshButton"
                            className={`action-btn ${activeButtonId === 'refreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                            onClick={() => handleButtonClick('refreshButton', () => loadData(currentPage, perPage, searchTerm))}
                        >
                            Refresh
                        </button>
                        <button
                            id="addWhoisButton"
                            className={`action-btn ${activeButtonId === 'addWhoisButton' ? 'action-btn-active' : 'action-btn-active'}`}
                            onClick={() => handleButtonClick('addWhoisButton', openAddModal)}
                        >
                            Add WHOIS
                        </button>
                    </div>
                    <DataTable
                        columns={whoisColumnsConfig}
                        data={localWhoisTableData}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={setPerPage}
                        loading={loading}
                        noDataText="No data available"
                        loadingText="Loading..."
                    />
                </div>
            )}

            {activeTab === 'possibleApexDomains' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        <MetricCard title="Total Possible Apex Domains" value={apexTotalItems}/>
                        <MetricCard title="Viewed Domains"
                                    value={possibleApexDomains.filter(d => d.viewed === 1).length}/>
                        <MetricCard title="Unviewed Domains"
                                    value={possibleApexDomains.filter(d => d.viewed !== 1).length}/>
                        <MetricCard title="Confirmed Domains"
                                    value={possibleApexDomains.filter(d => d.status === 1).length}/>
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
                            onChange={(e) => setApexSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApexSearch()}
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

                    {/*Possible Apex Domains tab */}
                    <div className="programs-table">
                        <DataTable
                            columns={apexColumns}
                            data={possibleApexDomains}
                            currentPage={apexCurrentPage}
                            totalPages={apexTotalPages}
                            totalItems={apexTotalItems}
                            perPage={apexPerPage}
                            onPageChange={(newPage) => loadPossibleApexDomains(newPage, apexPerPage, apexSearch)}
                            onPerPageChange={handleApexPerPageChange}
                            openEditApexModal={openEditApexModal}
                            openDeleteApexModal={openDeleteApexModal}
                            loading={apexLoading}
                            noDataText="No possible apex domains available"
                            loadingText="Loading possible apex domains..."
                        />
                    </div>
                </div>
            )}

            {/* Add WHOIS Modal */}
            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add WHOIS Item"
                    ariaLabel="Add WHOIS Modal"
                    size="large"
                >
                    <form onSubmit={handleAddItem}>
                        {/* Program selection - always shown */}
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
                                <div className={`dropdown-options ${isDropdownOpen ? 'show' : ''}`}> 
                                    {programsLoading ? (
                                        <div className="dropdown-item loading">Loading...</div>
                                    ) : (
                                        programs
                                            .filter(program =>
                                                program.program.toLowerCase().includes(filterText.toLowerCase()))
                                            .map(program => (
                                                <div
                                                    key={program.id}
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setNewItem({...newItem, fk_programs_id: program.id});
                                                        setFilterText(program.program);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    {program.program}
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Type selection */}
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
                                <option value="orgs">Organization</option>
                                <option value="names">Name</option>
                                <option value="emails">Email</option>
                                <option value="addresses">Address</option>
                                <option value="nameservers">Nameserver</option>
                                <option value="phones">Phone</option>
                            </select>
                        </div>
                        {/* Organization selection - only shown when type is not 'orgs' */}
                        {newItem.type !== 'orgs' && (
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
                                        <div className="dropdown-options show">
                                            {orgsLoading ? (
                                                <div className="dropdown-item loading">Loading...</div>
                                            ) : (
                                                <>
                                                    <div
                                                        className="dropdown-item create-new"
                                                        onClick={() => {
                                                            setCreateNewOrg(true);
                                                            setSelectedOrg(null);
                                                            setIsOrgDropdownOpen(false);
                                                        }}
                                                    >
                                                        Create New: "{orgFilterText}"
                                                    </div>
                                                    {organizations
                                                        .filter(org =>
                                                            org.value.toLowerCase().includes(orgFilterText.toLowerCase()))
                                                        .map(org => (
                                                            <div
                                                                key={org.id}
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setSelectedOrg(org);
                                                                    setNewItem({...newItem, fk_org_id: org.id});
                                                                    setCreateNewOrg(false);
                                                                    setOrgFilterText(org.value);
                                                                    setIsOrgDropdownOpen(false);
                                                                }}
                                                            >
                                                                {org.value}
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="selected-info">
                                    {createNewOrg ? (
                                        <span>Will create new organization: <strong>{orgFilterText}</strong></span>
                                    ) : selectedOrg ? (
                                        <span>Selected organization: <strong>{selectedOrg.value}</strong></span>
                                    ) : (
                                        <span className="helper-text">Select an existing organization or create a new one</span>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Value input */}
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
                        {/* Action buttons */}
                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="form-button">
                                Add WHOIS
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit WHOIS Modal */}
            {showEditModal && editingItem && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit WHOIS Item"
                    ariaLabel="Edit WHOIS Modal"
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
                            <button type="button" className="action-btn action-btn-green"
                                    onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete WHOIS Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!itemToDelete}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete WHOIS Confirmation"
            >
                <p>Are you sure you want to delete the WHOIS {itemToDelete?.type?.slice(0, -1)} <span className="fw-700">{itemToDelete?.value}</span>? This action cannot be undone.</p>
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
            </Modal>

            {/* Add Apex Domain Modal */}
            {showAddApexModal && (
                <Modal
                    isOpen={showAddApexModal}
                    onClose={() => setShowAddApexModal(false)}
                    title="Add Possible Apex Domain"
                    ariaLabel="Add Apex Domain Modal"
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
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green" onClick={() => setShowAddApexModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add Apex Domain
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Apex Domain Modal */}
            {showEditApexModal && editingApexDomain && (
                <Modal
                    isOpen={showEditApexModal}
                    onClose={() => setShowEditApexModal(false)}
                    title="Edit Possible Apex Domain"
                    ariaLabel="Edit Apex Domain Modal"
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
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green" onClick={() => setShowEditApexModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Apex Domain Confirmation Modal */}
            {showDeleteApexModal && apexDomainToDelete && (
                <Modal
                    isOpen={showDeleteApexModal && !!apexDomainToDelete}
                    onClose={() => setShowDeleteApexModal(false)}
                    title="Confirm Deletion"
                    ariaLabel="Delete Apex Domain Confirmation"
                >
                    <p>Are you sure you want to delete the possible apex domain <span className="fw-700">{apexDomainToDelete.apex_domain}</span>? This action cannot be undone.</p>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="action-btn action-btn-green"
                            onClick={() => setShowDeleteApexModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="action-btn action-btn-primary"
                            onClick={handleDeleteApexDomain}
                        >
                            Delete
                        </button>
                    </div>
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

export default WhoisManagement;