// ~/my/codes/deeplike/src/common/pages/Programs.jsx
import React, { useEffect, useRef, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { X } from 'lucide-react';
import * as Hooks from '../../hooks';
import { useLocation, useNavigate } from "react-router-dom";
import { copyInfoClipboard } from '../functions';
import { programColumns, apexDomainColumns } from '../tableConfigs/programs';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import { useGlobalPerPage } from '../hooks/useGlobalPerPage';
import '../../styles/components.css';
import '../../styles/Dashboard.css';
import Modal from '../components/Modal';
import ProgramWithLogo from '../components/ProgramWithLogo';
import { usePagination } from '../../context/PaginationContext';
import PaginationFooter from '../components/PaginationFooter';
import CsvFileUploader from '../components/CsvFileUploader';

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useGlobalPerPage();
    const [platforms, setPlatforms] = useState([]);

    const [activeTab, setActiveTab] = useState('programs');
    const [apexDomains, setApexDomains] = useState([]);
    const [apexCurrentPage, setApexCurrentPage] = useState(1);
    const [apexTotalPages, setApexTotalPages] = useState(1);
    const [apexTotalItems, setApexTotalItems] = useState(0);
    const [apexSearch, setApexSearch] = useState('');
    const [apexLoading, setApexLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [programMetrics, setProgramMetrics] = useState({
        total_programs: 0,
        active_programs: 0,
        applied_programs: 0,
        pending_programs: 0,
        rejected_programs: 0,
        archived_programs: 0,
    });

    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    // State for modals and editing
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Added for delete confirmation
    const [editingProgram, setEditingProgram] = useState(null);
    const [programToDelete, setProgramToDelete] = useState(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingProgram, setViewingProgram] = useState(null);

    const [newProgram, setNewProgram] = useState({
        program: '',
        platform: '',
        visibility: 'public',
        status: 'active',
        domains: 0,
        domains_list: [],
    });
    const [showAddApexModal, setShowAddApexModal] = useState(false);
    const [showEditApexModal, setShowEditApexModal] = useState(false);
    const [showDeleteApexModal, setShowDeleteApexModal] = useState(false);
    const [editingApexDomain, setEditingApexDomain] = useState(null);
    const [apexDomainToDelete, setApexDomainToDelete] = useState(null);
    const [newApexDomain, setNewApexDomain] = useState({
        apex_domain: '',
        is_active: true,
        fk_programs_id: ''
    });

    // Add state for Add Apex Domain modal
    const [addApexIsActive, setAddApexIsActive] = useState(newApexDomain.is_active);
    // Add state for Edit Apex Domain modal
    const [editApexIsActive, setEditApexIsActive] = useState(editingApexDomain ? editingApexDomain.is_active : false);

    // hook for apex domain search button
    const {
        activeButtonId: activeApexButtonId,
        handleButtonClick: handleApexButtonClick
    } = Hooks.useButtonToggle('apexSearchButton');

    const [newDomain, setNewDomain] = useState('');

    const searchTermRef = useRef(searchTerm);
    useEffect(() => { searchTermRef.current = searchTerm; }, [searchTerm]);

    // Add domain to newProgram.domains_list
    const addDomainToNewProgram = () => {
        if (!newDomain.trim()) return;
        setNewProgram(prev => ({
            ...prev,
            domains_list: [...(prev.domains_list || []), newDomain.trim()],
        }));
        setNewDomain('');
    };

    // Remove domain from newProgram.domains_list
    const removeDomainFromNewProgram = (domainToRemove) => {
        setNewProgram(prev => ({
            ...prev,
            domains_list: (prev.domains_list || []).filter(domain => domain !== domainToRemove),
        }));
    };

    const { setPagination } = usePagination();

    const loadPlatforms = async () => {
        try {
            const response = await fetch('/api/shared/platforms');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setPlatforms(data.data);
            } else {
                setPlatforms([]);
            }
        } catch (error) {
            console.error('Error fetching platforms:', error);
            showNotification(`Error loading platforms: ${error.message}`, true);
            setPlatforms([]);
        }
    };

    const initialLoadRef = useRef(false);
    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('programSearchButton');

    useEffect(() => {
        if (!initialLoadRef.current) {
            // Load both data types on initial load
            loadPrograms(1, perPage, '');
            loadPlatforms();
            // If we're on the apex domains tab, load that data
            if (location.state?.activeTab === 'apexDomains') {
                loadApexDomains(1, perPage, '');
            }
            initialLoadRef.current = true;
        }
    }, []);

    useEffect(() => {
        const currentTab = location.state?.activeTab || 'programs';
        setActiveTab(currentTab);

        if (currentTab === 'programs') {
            loadPrograms(currentPage, perPage, searchTerm);
        } else if (currentTab === 'apexDomains') {
            loadApexDomains(apexCurrentPage, perPage, apexSearch);
        }
    }, [location.state?.activeTab]);

    // default tab
    useEffect(() => {
        if (!location.state?.activeTab) {
            navigate(location.pathname, {state: {activeTab: 'programs'}, replace: true});
        }
    }, [location, navigate]);

    const loadPrograms = async (page = 1, limit = perPage, search = '') => {
        setLoading(true);
        console.log('loadPrograms called with search:', search);
        try {
            // Load programs and metrics in parallel
            const [programsResponse, metricsResponse] = await Promise.all([
                fetch(`/api/shared/programs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
                fetch('/api/shared/programs-metrics')
            ]);

            if (!programsResponse.ok) throw new Error(`HTTP error! Status: ${programsResponse.status}`);
            if (!metricsResponse.ok) throw new Error(`Metrics HTTP error! Status: ${metricsResponse.status}`);

            const programsData = await programsResponse.json();
            const metricsData = await metricsResponse.json();

            console.log('API returned programsData:', programsData);

            if (Array.isArray(programsData.data)) {
                setPrograms(programsData.data);
                setCurrentPage(programsData.pagination?.current_page || 1);
                setTotalPages(programsData.pagination?.total_pages || 1);
                setTotalItems(programsData.pagination?.total || 0);
            } else {
                setPrograms([]);
            }

            // Set metrics from API response
            setProgramMetrics(metricsData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching programs:', error);
            showNotification(`Error: ${error.message}`, true);
            setLoading(false);

            // Mock data as fallback
            const mockPrograms = [
                {
                    id: 1,
                    program: 'manual',
                    platform: 'N/A',
                    visibility: 'n/a',
                    status: 'active',
                    domains: 0,
                    domains_list: []
                },
                {
                    id: 2,
                    program: 'bla',
                    platform: 'N/A',
                    visibility: 'private',
                    status: 'active',
                    domains: 4,
                    domains_list: ['example.com', 'test.com', 'bla.com', 'domain.com']
                },
                {
                    id: 3,
                    program: 'thisone',
                    platform: 'N/A',
                    visibility: 'n/a',
                    status: 'inactive',
                    domains: 1,
                    domains_list: ['thisone.com']
                },
                {
                    id: 4,
                    program: 'notactive',
                    platform: 'N/A',
                    visibility: 'public',
                    status: 'inactive',
                    domains: 0,
                    domains_list: []
                },
                {
                    id: 5,
                    program: 'another',
                    platform: 'N/A',
                    visibility: 'n/a',
                    status: 'active',
                    domains: 0,
                    domains_list: []
                },
            ];
            setPrograms(mockPrograms);
            setCurrentPage(1);
            setTotalPages(1);
            setTotalItems(mockPrograms.length);

            // Mock metrics
            setProgramMetrics({
                total_programs: mockPrograms.length,
                active_programs: mockPrograms.filter(p => p.status === 'active').length,
                inactive_programs: mockPrograms.filter(p => p.status === 'inactive').length,
                with_domains: mockPrograms.filter(p => p.domains > 0).length,
                public_programs: mockPrograms.filter(p => p.visibility === 'public').length,
                private_programs: mockPrograms.filter(p => p.visibility === 'private').length
            });
        }
    };
    const loadApexDomains = async (page = 1, limit = perPage, search = '') => {
        setApexLoading(true);
        try {
            const response = await fetch(`/api/shared/apex-domains?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&orderBy=id,apex_domain&orderDir=asc`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();

            if (Array.isArray(data.data)) {
                setApexDomains(data.data);
                setApexCurrentPage(data.pagination?.current_page || 1);
                setApexTotalPages(data.pagination?.total_pages || 1);
                setApexTotalItems(data.pagination?.total || 0);
            } else {
                setApexDomains([]);
            }
            setApexLoading(false);
        } catch (error) {
            console.error('Error fetching apex domains:', error);
            showNotification(`Error: ${error.message}`, true);
            setApexLoading(false);

            // Mock data as fallback
            const mockApexDomains = [
                {
                    id: 1,
                    apex_domain: 'example.com',
                    is_active: true,
                    fk_programs_id: 1,
                    program: 'manual'
                },
                {
                    id: 2,
                    apex_domain: 'test.com',
                    is_active: true,
                    fk_programs_id: 2,
                    program: 'bla'
                }
            ];
            setApexDomains(mockApexDomains);
            setApexCurrentPage(1);
            setApexTotalPages(1);
            setApexTotalItems(mockApexDomains.length);
        }
    };
    const calculateProgramMetrics = (data, totalCount) => {
        const activePrograms = data.filter(p => p.status === 'active').length;
        const scaleFactor = totalCount / data.length || 1;

        setProgramMetrics({
            total_programs: totalCount,
            active_programs: Math.round(activePrograms * scaleFactor),
            applied_programs: 0,
            pending_programs: 0,
            rejected_programs: 0,
            archived_programs: totalCount - Math.round(activePrograms * scaleFactor),
        });
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadPrograms(1, perPage, searchTerm);
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleAddProgram = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/shared/programs', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...newProgram,
                    domains: newProgram.domains_list.length,
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Program added successfully');
                setShowAddModal(false);
                setNewProgram({
                    program: '',
                    platform: '',
                    visibility: 'public',
                    status: 'active',
                    domains: 0,
                    domains_list: [],
                });
                loadPrograms(currentPage, perPage, searchTerm);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding program:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditProgram = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/shared/programs/${editingProgram.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...editingProgram,
                    domains: editingProgram.domains_list.length,
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Program updated successfully');
                setShowEditModal(false);
                loadPrograms(currentPage, perPage, searchTerm);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating program:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteProgram = async () => {
        try {
            const response = await fetch(`/api/shared/programs/${programToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Program deleted successfully');
                setShowDeleteModal(false);
                setProgramToDelete(null);
                loadPrograms(currentPage, perPage, searchTerm);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting program:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };
    const openViewModal = async (program) => {
        try {
            // Fetch full program details (including program_url)
            const programRes = await fetch(`/api/shared/programs/${program.id}`);
            if (!programRes.ok) throw new Error(`HTTP error! Status: ${programRes.status}`);
            const programData = await programRes.json();
            if (!programData.success) throw new Error(programData.error || 'Failed to load program details');

            // Fetch program domains
            const response = await fetch(`/api/shared/programs/${program.id}/scope`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            const domainsList = result.success && Array.isArray(result.data)
                ? result.data
                : [];

            setViewingProgram({
                ...programData.data,
                platform_name: programData.data.platform_name || 'N/A',
                domains_list: domainsList,
            });
            setShowViewModal(true);
        } catch (error) {
            console.error('Error fetching program details:', error);
            showNotification(`Error loading program details: ${error.message}`, true);
        }
    };
    const openAddModal = () => {
        setShowAddModal(true);
    };
    const handleApexSearch = () => {
        setApexCurrentPage(1);
        loadApexDomains(1, perPage, apexSearch);
    };

    const handleAddApexDomain = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/shared/programs/${newApexDomain.fk_programs_id}/scope`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    apex_domain: newApexDomain.apex_domain,
                    is_active: addApexIsActive ? 1 : 0
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Apex domain added successfully');
                setShowAddApexModal(false);
                setNewApexDomain({
                    apex_domain: '',
                    is_active: true,
                    fk_programs_id: ''
                });
                loadApexDomains(apexCurrentPage, perPage, apexSearch);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding apex domain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleEditApexDomain = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/shared/programs/scope/${editingApexDomain.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    apex_domain: editingApexDomain.apex_domain,
                    is_active: editApexIsActive ? 1 : 0
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Apex domain updated successfully');
                setShowEditApexModal(false);
                loadApexDomains(apexCurrentPage, perPage, apexSearch);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating apex domain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleDeleteApexDomain = async () => {
        try {
            const response = await fetch(`/api/shared/programs/scope/${apexDomainToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Apex domain deleted successfully');
                setShowDeleteApexModal(false);
                setApexDomainToDelete(null);
                loadApexDomains(apexCurrentPage, perPage, apexSearch);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting apex domain:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openAddApexModal = () => {
        setShowAddApexModal(true);
    };

    const openEditApexModal = (apexDomain) => {
        setEditingApexDomain({
            ...apexDomain,
            is_active: apexDomain.is_active === 1
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

    const handleTabSwitch = (tabName) => {
        setActiveTab(tabName);
        navigate(location.pathname, {state: {activeTab: tabName}});
        if (tabName === 'programs') {
            setSearchTerm('');
            setCurrentPage(1);
            loadPrograms(1, perPage, '');
        } else if (tabName === 'apexDomains') {
            setApexSearch('');
            setApexCurrentPage(1);
            loadApexDomains(1, perPage, '');
        }
    };

    useEffect(() => {
        if (activeTab === 'programs') {
            setSearchTerm('');
            setCurrentPage(1);
            loadPrograms(1, perPage, '');
        } else if (activeTab === 'apexDomains') {
            setApexSearch('');
            setApexCurrentPage(1);
            loadApexDomains(1, perPage, '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const openEditModal = async (program) => {
        try {
            // Fetch program domains
            const response = await fetch(`/api/shared/programs/${program.id}/scope`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            const domainsList = result.success && Array.isArray(result.data)
                ? result.data.map(domain => domain.apex_domain)
                : [];

            // For platform, we need to use the platform id
            // since our dropdown expects ids as values
            setEditingProgram({
                ...program,
                // Handle platform for the dropdown
                platform: program.platform_id || '',
                fk_bb_site: program.platform_id || null,
                domains_list: domainsList,
            });
            setShowEditModal(true);
        } catch (error) {
            console.error('Error fetching program domains:', error);
            showNotification(`Error loading domains: ${error.message}`, true);

            // Still open the modal but with empty domains list
            setEditingProgram({
                ...program,
                platform: program.platform_id || '',
                fk_bb_site: program.platform_id || null,
                domains_list: [],
            });
            setShowEditModal(true);
        }
    }

    const openDeleteModal = (program) => {
        setProgramToDelete(program);
        setShowDeleteModal(true);
    };

    const handleNewProgramChange = (e) => {
        const {name, value} = e.target;
        if (name === 'platform') {
            // Store the platform ID in fk_bb_site
            setNewProgram(prev => ({
                ...prev,
                platform: value,
                fk_bb_site: value || null
            }));
        } else {
            setNewProgram(prev => ({...prev, [name]: value}));
        }
    };

    const handleEditProgramChange = (e) => {
        const {name, value} = e.target;
        if (name === 'platform') {
            // Store the platform ID in fk_bb_site
            setEditingProgram(prev => ({
                ...prev,
                platform: value,
                fk_bb_site: value || null
            }));
        } else {
            setEditingProgram(prev => ({...prev, [name]: value}));
        }
    };

    // Add isEditMode state for consolidated view/edit modal
    const [isEditMode, setIsEditMode] = useState(false);

    // Register escape key to close modals
    useEscapeToClose(showViewModal, () => setShowViewModal(false));
    useEscapeToClose(showDeleteModal, () => setShowDeleteModal(false));
    useEscapeToClose(showAddApexModal, () => setShowAddApexModal(false));
    useEscapeToClose(showEditApexModal, () => setShowEditApexModal(false));
    useEscapeToClose(showAddModal, () => setShowAddModal(false));
    useEscapeToClose(showEditModal, () => setShowEditModal(false));
    useEscapeToClose(showDeleteApexModal, () => setShowDeleteApexModal(false));

    useEffect(() => {
        const handleGlobalEscape = (e) => {
            if (e.key === 'Escape') {
                // If any modal is open and searchTerm has text, clear it and prevent modal close
                if ((showAddModal || showEditModal || showViewModal || showDeleteModal || showAddApexModal || showEditApexModal || showDeleteApexModal)
                    && searchTerm) {
                    setSearchTerm('');
                    e.stopPropagation();
                    e.preventDefault();
                }
                // Otherwise, let the modal close as usual (handled by useEscapeToClose)
            }
        };
        window.addEventListener('keydown', handleGlobalEscape, true);
        return () => window.removeEventListener('keydown', handleGlobalEscape, true);
    }, [showAddModal, showEditModal, showViewModal, showDeleteModal, showAddApexModal, showEditApexModal, showDeleteApexModal, searchTerm]);

    // Helper for cycling visibility
    const VISIBILITY_OPTIONS = ['public', 'private', 'n/a'];
    const getNextVisibility = (current) => {
        const idx = VISIBILITY_OPTIONS.indexOf(current);
        return VISIBILITY_OPTIONS[(idx + 1) % VISIBILITY_OPTIONS.length];
    };
    const getVisibilityLabel = (v) => {
        if (v === 'public') return 'Public';
        if (v === 'private') return 'Private';
        return 'N/A';
    };
    const getVisibilityClass = (v) => {
        if (v === 'public') return 'pill-public';
        if (v === 'private') return 'pill-private';
        return 'pill-na';
    };

    // Update pagination context when programs tab is active
    useEffect(() => {
        if (activeTab === 'programs') {
            setPagination({
                currentPage,
                totalPages,
                totalItems,
                perPage,
                onPageChange: (newPage) => loadPrograms(newPage, perPage, searchTermRef.current),
                onPerPageChange: (newPerPage) => {
                    setPerPage(newPerPage);
                    setCurrentPage(1);
                    loadPrograms(1, newPerPage, searchTermRef.current);
                },
            });
        } else if (activeTab === 'apexDomains') {
            setPagination({
                currentPage: apexCurrentPage,
                totalPages: apexTotalPages,
                totalItems: apexTotalItems,
                perPage,
                onPageChange: (newPage) => loadApexDomains(newPage, perPage, apexSearch),
                onPerPageChange: (newPerPage) => {
                    setPerPage(newPerPage);
                    setApexCurrentPage(1);
                    loadApexDomains(1, newPerPage, apexSearch);
                },
            });
        }
    }, [activeTab, currentPage, totalPages, totalItems, perPage, apexCurrentPage, apexTotalPages, apexTotalItems, apexSearch]);

    // Dynamically adjust table-content padding-bottom to match pagination bar height
    useEffect(() => {
        function updateTablePadding() {
            const paginationBar = document.querySelector('.global-pagination-bar');
            const tableContent = document.querySelector('.table-content');
            if (paginationBar && tableContent) {
                tableContent.style.paddingBottom = `${paginationBar.offsetHeight}px`;
            }
        }
        updateTablePadding();
        window.addEventListener('resize', updateTablePadding);
        return () => window.removeEventListener('resize', updateTablePadding);
    }, []);

    // Add state for CSV import modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [csvData, setCsvData] = useState(null);
    const [csvError, setCsvError] = useState('');
    const [csvImporting, setCsvImporting] = useState(false);
    const [csvImportResult, setCsvImportResult] = useState(null);

    // CSV Import handler
    const handleCsvParsed = (data, error) => {
        setCsvError(error || '');
        setCsvData(error ? null : data);
        setCsvImportResult(null);
    };

    const handleImportCsv = async () => {
        if (!csvData || csvData.length === 0) return;
        setCsvImporting(true);
        setCsvImportResult(null);
        try {
            const response = await fetch('/api/shared/programs/import-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ programs: csvData }),
            });
            const result = await response.json();
            setCsvImportResult(result);
            if (result.success) {
                showNotification('CSV import successful');
                setShowImportModal(false);
                setCsvData(null);
                setCsvError('');
                loadPrograms(currentPage, perPage, searchTerm);
            } else {
                showNotification('CSV import error', true);
            }
        } catch (error) {
            setCsvImportResult({ error: error.message });
            showNotification('CSV import error: ' + error.message, true);
        } finally {
            setCsvImporting(false);
        }
    };

    return (
        <div className="programs-container">
            {activeTab === 'programs' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        <MetricCard title="Total Programs" value={programMetrics.total_programs}/>
                        <MetricCard title="Active Programs" value={programMetrics.active_programs}/>
                        <MetricCard title="Inactive Programs" value={programMetrics.inactive_programs}/>
                        <MetricCard title="With Domains" value={programMetrics.with_domains}/>
                        <MetricCard title="Public Programs" value={programMetrics.public_programs}/>
                        <MetricCard title="Private Programs" value={programMetrics.private_programs}/>
                    </div>

                    <div className="page-search">
                        <input
                            type="text"
                            id="programSearchInput"
                            className="filter-input"
                            placeholder="Search programs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                                if (e.key === 'Escape') {
                                    if (searchTerm) {
                                        setSearchTerm('');
                                        e.stopPropagation();
                                    }
                                }
                            }}
                        />

                        <button id="programSearchButton"
                                className={`action-btn ${activeButtonId === 'programSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleButtonClick('programSearchButton', handleSearch)}>Search
                        </button>
                        <button id="programRefreshButton"
                                className={`action-btn ${activeButtonId === 'programRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleButtonClick('programRefreshButton', () => loadPrograms(currentPage, perPage, searchTerm))}>Refresh
                        </button>
                        <button id="addProgramButton"
                                className={`action-btn ${activeButtonId === 'addProgramButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleButtonClick('addProgramButton', openAddModal)}>Add Program
                        </button>
                        <button id="importProgramsButton"
                                className={`action-btn ${activeButtonId === 'importProgramsButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleButtonClick('importProgramsButton', () => setShowImportModal(true))}>Import Programs (CSV)
                        </button>
                    </div>

                    <div className="programs-table">
                        <DataTable
                            columns={programColumns}
                            data={programs}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            perPage={perPage}
                            onPageChange={(newPage) => loadPrograms(newPage, perPage, searchTermRef.current)}
                            onPerPageChange={(newPerPage) => {
                                setPerPage(newPerPage);
                                setCurrentPage(1);
                                loadPrograms(1, newPerPage, searchTermRef.current);
                            }}
                            loading={loading}
                            noDataText="No programs available"
                            loadingText="Loading programs..."
                            openViewModal={openViewModal}
                            openEditModal={openEditModal}
                            openDeleteModal={openDeleteModal}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'apexDomains' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        <MetricCard title="Total Apex Domains" value={apexTotalItems}/>
                        <MetricCard title="Active Domains" value={apexDomains.filter(d => d.is_active === 1).length}/>
                        <MetricCard title="Inactive Domains" value={apexDomains.filter(d => d.is_active !== 1).length}/>
                        <MetricCard title="Programs With Domains"
                                    value={[...new Set(apexDomains.map(d => d.fk_programs_id))].length}/>
                        <MetricCard title="Domains Per Program"
                                    value={(apexDomains.length / [...new Set(apexDomains.map(d => d.fk_programs_id))].length || 0).toFixed(1)}/>
                        <MetricCard title="Most Recent ID"
                                    value={apexDomains.length > 0 ? Math.max(...apexDomains.map(d => d.id)) : 0}/>
                    </div>

                    <div className="page-search">
                        <input
                            type="text"
                            id="apexSearchInput"
                            className="filter-input"
                            placeholder="Search apex domains..."
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
                                onClick={() => handleApexButtonClick('apexRefreshButton', () => loadApexDomains(apexCurrentPage, perPage, apexSearch))}>Refresh
                        </button>
                        <button id="addApexButton"
                                className={`action-btn ${activeApexButtonId === 'addApexButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleApexButtonClick('addApexButton', openAddApexModal)}>Add Apex Domain
                        </button>
                    </div>

                    <div className="programs-table">
                        <DataTable
                            columns={apexDomainColumns}
                            data={apexDomains}
                            currentPage={apexCurrentPage}
                            totalPages={apexTotalPages}
                            totalItems={apexTotalItems}
                            perPage={perPage}
                            onPageChange={(newPage) => loadApexDomains(newPage, perPage, apexSearch)}
                            onPerPageChange={(newPerPage) => {
                                setPerPage(newPerPage);
                                setApexCurrentPage(1);
                                loadApexDomains(1, newPerPage, apexSearch);
                            }}
                            loading={apexLoading}
                            noDataText="No apex domains available"
                            loadingText="Loading apex domains..."
                            copyInfoClipboard={copyInfoClipboard}
                            openEditApexModal={openEditApexModal}
                            openDeleteApexModal={openDeleteApexModal}
                        />
                    </div>
                </div>
            )}

            {/* Add Program Modal */}
            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add Program"
                    ariaLabel="Add Program Modal"
                >
                    <form onSubmit={handleAddProgram}>
                        <div className="form-group">
                            <label htmlFor="programName">Program Name</label>
                            <input
                                type="text"
                                id="programName"
                                name="program"
                                value={newProgram.program}
                                onChange={handleNewProgramChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="platform">Platform</label>
                            <select
                                id="platform"
                                name="platform"
                                value={newProgram.platform || ''}
                                onChange={handleNewProgramChange}
                            >
                                <option value="">Select Platform</option>
                                {platforms.map((platform) => (
                                    <option key={platform.id} value={platform.id}>
                                        {platform.platform}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Visibility</label>
                            <button
                                type="button"
                                className={`pill visibility-pill ${getVisibilityClass(newProgram.visibility)}`}
                                onClick={() => setNewProgram(prev => ({...prev, visibility: getNextVisibility(prev.visibility)}))}
                                tabIndex={0}
                                aria-label={`Set visibility: ${getVisibilityLabel(newProgram.visibility)}`}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setNewProgram(prev => ({...prev, visibility: getNextVisibility(prev.visibility)}));
                                    }
                                }}
                                style={{fontWeight: 700, fontSize: 14, minWidth: 80, marginTop: 2}}
                            >
                                {getVisibilityLabel(newProgram.visibility)}
                            </button>
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={newProgram.is_active}
                                onChange={handleNewProgramChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Domains ({newProgram.domains_list.length})</label>
                            <div className="domains-list">
                                {(newProgram.domains_list || []).map((domain, index) => (
                                    <div key={index} className="domain-item">
                                        <span>{domain}</span>
                                        <button
                                            type="button"
                                            className="action-btn action-btn-small"
                                            onClick={() => removeDomainFromNewProgram(domain)}
                                            title="Remove domain"
                                        >
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="domain-input">
                                <input
                                    type="text"
                                    placeholder="Add new domain..."
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDomainToNewProgram())}
                                />
                                <button
                                    type="button"
                                    className="action-btn action-btn-primary"
                                    onClick={addDomainToNewProgram}
                                >
                                    Add Domain
                                </button>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="action-btn action-btn-green"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add Program
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {/* View Program Modal */}
            {showViewModal && viewingProgram && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => { setShowViewModal(false); setIsEditMode(false); }}
                    title={null}
                    size="large"
                    ariaLabel="Program Details Modal"
                    header={
                        <>
                            <button
                                className="action-btn action-btn-edit"
                                aria-label="Edit Program"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setShowEditModal(true);
                                }}
                                style={{ width: 80 }}
                            >
                                Edit
                            </button>
                            <h3 className="mb-1rem" style={{ margin: 0, fontWeight: 700, flex: 1, textAlign: 'center' }}>Program Details</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowViewModal(false)}
                                aria-label="Close modal"
                                tabIndex={0}
                                style={{ width: 40, height: 40, fontSize: 28, lineHeight: 1 }}
                            >
                                ×
                            </button>
                        </>
                    }
                >
                    {/* Main details grid: Program | Program URL | Visibility */}
                    <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '16px'}}>
                        <div>
                            <div className="view-label">Program</div>
                            <div className="view-value" style={{display: 'flex', alignItems: 'center', gap: 4}}>
                                <ProgramWithLogo
                                    programName={viewingProgram.program}
                                    platformName={viewingProgram.platform_name || 'N/A'}
                                />
                                <span
                                    className={`pill pill-disabled pill-small ${viewingProgram.is_active === 1 || viewingProgram.is_active === true ? 'in-scope' : 'out-scope'}`}
                                    style={{marginLeft: 4, fontWeight: 700, fontSize: 13}}
                                >
                                    {viewingProgram.is_active === 1 || viewingProgram.is_active === true ? 'Active' : 'Inactive'}
                                </span>
                                <span
                                    className={`pill visibility-pill ${getVisibilityClass(viewingProgram.visibility)}`}
                                    style={{fontWeight: 700, fontSize: 14, minWidth: 80, marginLeft: 4, cursor: 'default'}}
                                    aria-label={`Visibility: ${getVisibilityLabel(viewingProgram.visibility)}`}
                                >
                                    {getVisibilityLabel(viewingProgram.visibility)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="view-label">Program URL</div>
                            <div className="view-value" style={{maxWidth: '100%'}}>
                                {viewingProgram.program_url ? (
                                    <a href={viewingProgram.program_url} target="_blank" rel="noopener noreferrer">
                                        {viewingProgram.program_url}
                                    </a>
                                ) : (
                                    'N/A'
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Domains List */}
                    <div className="view-label mt-8">Domains ({viewingProgram.domains_list.length})</div>
                    {viewingProgram.domains_list.length === 0 ? (
                        <p className="no-data">No domains in scope for this program.</p>
                    ) : (
                        <div className="cidr-list cidr-list-custom mb-16">
                            {viewingProgram.domains_list.map(domain => (
                                <div key={domain.id} className="cidr-item cidr-item-custom">
                                    <span className="cidr-badge" style={{background: '#00C4FF', color: '#181c20', fontWeight: 800, letterSpacing: 1}}>{domain.apex_domain}</span>
                                    <span style={{marginLeft: 'auto', color: '#aaa', fontSize: 13}}>ID: {domain.id}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
            {/* Edit Program Modal */}
            {showEditModal && editingProgram && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title={null}
                    size="large"
                    ariaLabel="Edit Program Modal"
                    header={
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ minWidth: 60 }} />
                            <h3 className="mb-1rem" style={{ flex: 1, margin: 0 }}>Edit Program</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowEditModal(false)}
                                aria-label="Close modal"
                                tabIndex={0}
                            >
                                ×
                            </button>
                        </div>
                    }
                >
                    <form onSubmit={handleEditProgram}>
                        <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div>
                                <div className="view-label">Program Name</div>
                                <div className="view-value" style={{display: 'flex', alignItems: 'center', gap: 4}}>
                                    <input
                                        type="text"
                                        id="programName"
                                        name="program"
                                        value={editingProgram.program}
                                        onChange={handleEditProgramChange}
                                        required
                                        className="view-value"
                                        style={{width: '100%'}}
                                    />
                                    <span
                                        className={`pill pill-disabled pill-small ${editingProgram.is_active === 'active' || editingProgram.is_active === 1 || editingProgram.is_active === true ? 'in-scope' : 'out-scope'}`}
                                        style={{marginLeft: 4, fontWeight: 700, fontSize: 13}}
                                    >
                                        {editingProgram.is_active === 'active' || editingProgram.is_active === 1 || editingProgram.is_active === true ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        type="button"
                                        className={`pill visibility-pill ${getVisibilityClass(editingProgram.visibility)}`}
                                        onClick={() => setEditingProgram(prev => ({...prev, visibility: getNextVisibility(prev.visibility)}))}
                                        tabIndex={0}
                                        aria-label={`Set visibility: ${getVisibilityLabel(editingProgram.visibility)}`}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setEditingProgram(prev => ({...prev, visibility: getNextVisibility(prev.visibility)}));
                                            }
                                        }}
                                        style={{fontWeight: 700, fontSize: 14, minWidth: 80, marginLeft: 4}}
                                    >
                                        {getVisibilityLabel(editingProgram.visibility)}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="view-label">Platform</div>
                                <select
                                    id="platform"
                                    name="platform"
                                    value={editingProgram.platform || ''}
                                    onChange={handleEditProgramChange}
                                    className="view-value"
                                    style={{width: '100%'}}
                                >
                                    <option value="">Select Platform</option>
                                    {platforms.map((platform) => (
                                        <option key={platform.id} value={platform.id}>
                                            {platform.platform}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="view-label">Visibility</div>
                                <button
                                    type="button"
                                    className={`pill visibility-pill ${getVisibilityClass(editingProgram.visibility)}`}
                                    onClick={() => setEditingProgram(prev => ({...prev, visibility: getNextVisibility(prev.visibility)}))}
                                    tabIndex={0}
                                    aria-label={`Set visibility: ${getVisibilityLabel(editingProgram.visibility)}`}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setEditingProgram(prev => ({...prev, visibility: getNextVisibility(prev.visibility)}));
                                        }
                                    }}
                                    style={{fontWeight: 700, fontSize: 14, minWidth: 80, marginTop: 2}}
                                >
                                    {getVisibilityLabel(editingProgram.visibility)}
                                </button>
                            </div>
                            <div>
                                <div className="view-label">Status</div>
                                <select
                                    id="status"
                                    name="status"
                                    value={editingProgram.is_active}
                                    onChange={handleEditProgramChange}
                                    className="view-value"
                                    style={{width: '100%'}}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="view-label mt-8">Domains ({editingProgram.domains_list.length})</div>
                        <div className="domains-list mb-16">
                            {(editingProgram.domains_list || []).map((domain, index) => (
                                <div key={index} className="domain-item">
                                    <span>{domain}</span>
                                    <button
                                        type="button"
                                        className="action-btn action-btn-small"
                                        onClick={() => removeDomainFromNewProgram(domain)}
                                        title="Remove domain"
                                    >
                                        <X size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="domain-input mb-16">
                            <input
                                type="text"
                                placeholder="Add new domain..."
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDomainToNewProgram())}
                            />
                            <button
                                type="button"
                                className="action-btn action-btn-primary"
                                onClick={addDomainToNewProgram}
                            >
                                Add Domain
                            </button>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && programToDelete && (
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Confirm Deletion"
                    ariaLabel="Delete Program Confirmation"
                >
                    <p>Are you sure you want to delete the program "{programToDelete.program}"? This action cannot be undone.</p>
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
                            onClick={handleDeleteProgram}
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            )}

            {/* Add Apex Domain Modal */}
            {showAddApexModal && (
                <Modal
                    isOpen={showAddApexModal}
                    onClose={() => setShowAddApexModal(false)}
                    title="Add Apex Domain"
                    ariaLabel="Add Apex Domain Modal"
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
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.program}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group checkbox-group">
                            <button
                                type="button"
                                className={`toggle-btn${addApexIsActive ? ' enabled' : ' disabled'}`}
                                aria-pressed={addApexIsActive}
                                onClick={() => setAddApexIsActive(prev => !prev)}
                            >
                                Active
                            </button>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="action-btn action-btn-green"
                                onClick={() => setShowAddApexModal(false)}
                            >
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
                    title="Edit Apex Domain"
                    ariaLabel="Edit Apex Domain Modal"
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
                        <div className="form-group checkbox-group">
                            <button
                                type="button"
                                className={`toggle-btn${editApexIsActive ? ' enabled' : ' disabled'}`}
                                aria-pressed={editApexIsActive}
                                onClick={() => setEditApexIsActive(prev => !prev)}
                            >
                                Active
                            </button>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="action-btn action-btn-green"
                                onClick={() => setShowEditApexModal(false)}
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

            {/* Delete Apex Domain Confirmation Modal */}
            {showDeleteApexModal && apexDomainToDelete && (
                <Modal
                    isOpen={showDeleteApexModal}
                    onClose={() => setShowDeleteApexModal(false)}
                    title="Confirm Deletion"
                    ariaLabel="Delete Apex Domain Confirmation"
                >
                    <p>Are you sure you want to delete the apex domain "{apexDomainToDelete.apex_domain}"? This action cannot be undone.</p>
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

            {/* Import Programs CSV Modal */}
            {showImportModal && (
                <Modal
                    isOpen={showImportModal}
                    onClose={() => { setShowImportModal(false); setCsvData(null); setCsvError(''); setCsvImportResult(null); }}
                    title="Import Programs from CSV"
                    ariaLabel="Import Programs CSV Modal"
                >
                    <div className="csv-upload-modal-body">
                        <CsvFileUploader
                            onCsvParsed={handleCsvParsed}
                            label="Select CSV File"
                        />
                        {csvError && <div className="csv-upload-error" role="alert">{csvError}</div>}
                        {csvData && !csvError && (
                            <div className="csv-preview">
                                <h4>Preview ({csvData.length} rows):</h4>
                                <div className="csv-preview-table-wrapper">
                                    <table className="csv-preview-table">
                                        <thead>
                                            <tr>
                                                <th>Program</th>
                                                <th>Platform</th>
                                                <th>Visibility</th>
                                                <th>Status</th>
                                                <th>Apex Domain</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{row.program}</td>
                                                    <td>{row.platform}</td>
                                                    <td>{row.visibility}</td>
                                                    <td>{row.status}</td>
                                                    <td>{row.apex_domain}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {csvData.length > 10 && <div className="csv-preview-more">...and {csvData.length - 10} more rows</div>}
                                </div>
                                <button
                                    className="action-btn action-btn-primary csv-import-btn"
                                    onClick={handleImportCsv}
                                    disabled={csvImporting}
                                    aria-busy={csvImporting}
                                >
                                    {csvImporting ? 'Importing...' : 'Import'}
                                </button>
                            </div>
                        )}
                        {csvImportResult && (
                            <div className="csv-import-result" role="status">
                                {csvImportResult.success ? (
                                    <div className="csv-import-success">Import successful! {csvImportResult.message}</div>
                                ) : (
                                    <div className="csv-import-error">Import failed: {csvImportResult.error || 'Unknown error'}</div>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.message}
                </div>
            )}
            <PaginationFooter />
        </div>
    );
};

export default Programs;