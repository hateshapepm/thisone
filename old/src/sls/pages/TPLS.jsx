import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MetricCard from '../../common/components/MetricCard';
import { fetchTPLCategoryMetrics, fetchTPLs, fetchTPLCategories } from '../../api/apiService';
import * as Hooks from '../../hooks';
import DataTable from '../../common/components/DataTable';
import { useEscapeToClose } from '../../hooks';
import { tplsColumns } from '../../common/tableConfigs/tpls';
import { tplsCategoriesColumns } from '../../common/tableConfigs/tplsCategories';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/Dashboard.css';
import Modal from '../../common/components/Modal';

const TPLS = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'tpls');
    const [tpls, setTpls] = useState([]);
    const [tplCurrentPage, setTplCurrentPage] = useState(1);
    const [tplTotalPages, setTplTotalPages] = useState(1);
    const [tplTotalItems, setTplTotalItems] = useState(0);
    const [tplSearch, setTplSearch] = useState('');
    const [tplLoading, setTplLoading] = useState(true);
    const [perPage, setPerPage] = useGlobalPerPage();

    const [categories, setCategories] = useState([]);
    const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
    const [categoryTotalPages, setCategoryTotalPages] = useState(1);
    const [categoryTotalItems, setCategoryTotalItems] = useState(0);
    const [categorySearch, setCategorySearch] = useState('');
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [allCategories, setAllCategories] = useState([]);

    const [tplMetrics, setTplMetrics] = useState({
        total_tpls: 0,
        active_tpls: 0,
        high_value_tpls: 0,
        twofa_required: 0,
        total_categories: 0,
        uncategorized_tpls: 0,
    });

    const [categoryMetrics, setCategoryMetrics] = useState({
        total_categories: 0,
        categories_with_tpls: 0,
        empty_categories: 0,
        avg_tpls_per_category: 0,
        largest_category: 0,
        uncategorized_tpls: 0,
    });

    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    const [showTplAddModal, setShowTplAddModal] = useState(false);
    const [showCategoryAddModal, setShowCategoryAddModal] = useState(false);
    const [showTplEditModal, setShowTplEditModal] = useState(false);
    const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
    const [showTplDeleteModal, setShowTplDeleteModal] = useState(false);
    const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
    const [editingTpl, setEditingTpl] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [tplToDelete, setTplToDelete] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [newTpl, setNewTpl] = useState({
        url: '',
        high_value: 0,
        twofa_required: 0,
        alive: 0,
        fk_category_id: null,
    });

    const {
        activeButtonId: activeTPLSButtonId,
        handleButtonClick: handleTPLSButtonClick
    } = Hooks.useButtonToggle('tplsSearchButton');
    const {
        activeButtonId: activeTPLSCatButtonId,
        handleButtonClick: handleTPLSCatButtonClick
    } = Hooks.useButtonToggle('tplsCatSearchButton');

    const [newCategory, setNewCategory] = useState({category: ''});

    const [tplMetricsLoading, setTplMetricsLoading] = useState(true);
    const [categoryMetricsLoading, setCategoryMetricsLoading] = useState(true);

    // Add state for TPLs in selected category
    const [categoryTpls, setCategoryTpls] = useState([]);
    const [loadingCategoryTpls, setLoadingCategoryTpls] = useState(false);
    const [categoryTplsPage, setCategoryTplsPage] = useState(1);

    const paginatedCategoryTpls = useMemo(() => {
        const start = (categoryTplsPage - 1) * perPage;
        return categoryTpls.slice(start, start + perPage);
    }, [categoryTpls, categoryTplsPage, perPage]);

    const handleCategoryTplsPageChange = (page) => setCategoryTplsPage(page);
    const handleCategoryTplsPerPageChange = (perPage) => {
        setPerPage(perPage);
        setCategoryTplsPage(1);
    };

    useEffect(() => {
        if (!location.state?.activeTab) {
            navigate(location.pathname, {state: {activeTab: 'tpls'}, replace: true});
        }
    }, [location, navigate]);

    useEffect(() => {
        if (location.state?.activeTab && location.state.activeTab !== activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    useEffect(() => {
        if (activeTab === 'tpls') {
            loadTPLs(1, perPage, '');
            loadTplMetrics();
        } else {
            loadCategories(1, perPage, '');
            loadCategoryMetrics();
        }
    }, [activeTab, perPage]);

    // Update the handlePageChange functions
    const handleTplPageChange = (newPage) => {
        setTplCurrentPage(newPage);
        loadTPLs(newPage, perPage, tplSearch);
    };

    const handleCategoryPageChange = (newPage) => {
        setCategoryCurrentPage(newPage);
        loadCategories(newPage, perPage, categorySearch);
    };

    const handleTplPerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setTplCurrentPage(1);
        loadTPLs(1, newPerPage, tplSearch);
    };

    const handleCategoryPerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCategoryCurrentPage(1);
        loadCategories(1, newPerPage, categorySearch);
    };

    const switchTab = (tabName) => {
        setActiveTab(tabName);
        navigate(location.pathname, {state: {activeTab: tabName}});
        if (tabName === 'tpls') {
            loadTPLs(1, perPage, '');
            loadTplMetrics();
        } else {
            loadCategories(1, perPage, '');
            loadCategoryMetrics();
        }
    };
    const loadTPLs = (page = 1, limit = perPage, search = '') => {
        setTplLoading(true);
        let url = `/api/sls/tpls?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setTpls(data);
                    setTplCurrentPage(1);
                    setTplTotalPages(1);
                    setTplTotalItems(data.length);
                } else if (data.data) {
                    setTpls(data.data);
                    setTplCurrentPage(data.pagination?.current_page || 1);
                    setTplTotalPages(data.pagination?.total_pages || 1);
                    setTplTotalItems(data.pagination?.total || 0);
                } else {
                    setTpls([]);
                }
                setTplLoading(false);
            })
            .catch(error => {
                console.error('Error fetching TPLs:', error);
                showNotification(`Error: ${error.message}`, true);
                setTplLoading(false);
            });
    };

    const loadCategories = async (page = 1, limit = perPage, search = '') => {
        setCategoryLoading(true);
        try {
            const data = await fetchTPLCategories(page, limit, search);
            if (Array.isArray(data)) {
                setCategories(data);
                setAllCategories(data);
                setCategoryCurrentPage(1);
                setCategoryTotalPages(1);
                setCategoryTotalItems(data.length);
            } else if (data.data) {
                setCategories(data.data);
                setAllCategories(data.data);
                setCategoryCurrentPage(data.pagination?.current_page || 1);
                setCategoryTotalPages(data.pagination?.total_pages || 1);
                setCategoryTotalItems(data.pagination?.total || 0);
            } else {
                setCategories([]);
                setAllCategories([]);
            }
            setCategoryLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showNotification(`Error: ${error.message}`, true);
            setCategoryLoading(false);
        }
    };

    const loadTplMetrics = () => {
        setTplMetricsLoading(true);
        fetch('/api/sls/tpls-metrics')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(metricsData => {
                setTplMetrics({
                    total_tpls: metricsData.total_tpls || 0,
                    active_tpls: metricsData.active_tpls || 0,
                    high_value_tpls: metricsData.high_value_tpls || 0,
                    twofa_required: metricsData.twofa_required || 0,
                    total_categories: metricsData.total_categories || 0,
                    uncategorized_tpls: metricsData.uncategorized_tpls || 0,
                });
                setTplMetricsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching TPL metrics:', error);
                setTplMetrics({
                    total_tpls: tplTotalItems || tpls.length,
                    active_tpls: 0,
                    high_value_tpls: 0,
                    twofa_required: 0,
                    total_categories: allCategories.length,
                    uncategorized_tpls: 0,
                });
                setTplMetricsLoading(false);
            });
    };

    const loadCategoryMetrics = async () => {
        setCategoryMetricsLoading(true);
        try {
            const metricsData = await fetchTPLCategoryMetrics();
            setCategoryMetrics({
                total_categories: metricsData.total_categories || 0,
                categories_with_tpls: metricsData.categories_with_tpls || 0,
                empty_categories: metricsData.empty_categories || 0,
                avg_tpls_per_category: metricsData.avg_tpls_per_category || 0,
                largest_category: metricsData.largest_category || 0,
                uncategorized_tpls: metricsData.uncategorized_tpls || 0,
            });
            setCategoryMetricsLoading(false);
        } catch (error) {
            console.error('Error fetching category metrics:', error);
            setCategoryMetrics({
                total_categories: categoryTotalItems || categories.length,
                categories_with_tpls: 0,
                empty_categories: 0,
                avg_tpls_per_category: 0,
                largest_category: 0,
                uncategorized_tpls: 0,
            });
            setCategoryMetricsLoading(false);
        }
    };

    const handleTplAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/sls/tpls', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newTpl),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('TPLS added successfully');
                setShowTplAddModal(false);
                setNewTpl({
                    url: '',
                    high_value: 0,
                    twofa_required: 0,
                    alive: 0,
                    fk_category_id: null,
                });
                loadTPLs(tplCurrentPage, perPage, tplSearch);
                loadTplMetrics();
                loadCategoryMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding TPLS:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleCategoryAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/sls/tpl-categories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Category added successfully');
                setShowCategoryAddModal(false);
                setNewCategory({category: ''});
                loadCategories(categoryCurrentPage, perPage, categorySearch);
                loadCategoryMetrics();
                loadTplMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleTplUpdate = async (e) => {
        e.preventDefault();
        if (!editingTpl || !editingTpl.tpls_id) {
            showNotification('Error: TPLS ID is missing for update', true);
            return;
        }
        try {
            const response = await fetch(`/api/sls/tpls/${editingTpl.tpls_id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingTpl),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('TPLS updated successfully');
                setShowTplEditModal(false);
                loadTPLs(tplCurrentPage, perPage, tplSearch);
                loadTplMetrics();
                loadCategoryMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating TPLS:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleCategoryUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/sls/tpl-categories/${editingCategory.tpl_categories_id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingCategory),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Category updated successfully');
                setShowCategoryEditModal(false);
                loadCategories(categoryCurrentPage, perPage, categorySearch);
                loadCategoryMetrics();
                loadTplMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleTplDelete = async () => {
        try {
            const response = await fetch(`/api/sls/tpls/${tplToDelete.tpls_id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('TPLS deleted successfully');
                setShowTplDeleteModal(false);
                setTplToDelete(null);
                loadTPLs(tplCurrentPage, perPage, tplSearch);
                loadTplMetrics();
                loadCategoryMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting TPLS:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleCategoryDelete = async () => {
        try {
            const response = await fetch(`/api/sls/tpl-categories/${categoryToDelete.tpl_categories_id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Category deleted successfully');
                setShowCategoryDeleteModal(false);
                setCategoryToDelete(null);
                loadCategories(categoryCurrentPage, perPage, categorySearch);
                loadCategoryMetrics();
                loadTplMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openTplAddModal = () => setShowTplAddModal(true);
    const openCategoryAddModal = () => setShowCategoryAddModal(true);
    const openTplEditModal = (tpl) => {
        let fk_category_id = tpl.fk_category_id;
        if (!fk_category_id && tpl.category && allCategories.length > 0) {
            const match = allCategories.find(cat => cat.category === tpl.category);
            if (match) fk_category_id = match.tpl_categories_id;
        }
        let url = '';
        if (tpl.protocol && tpl.domain) {
            url = `${tpl.protocol}://${tpl.domain}${tpl.url_path || ''}`;
        }
        setEditingTpl({...tpl, fk_category_id, url});
        setShowTplEditModal(true);
    };
    const openCategoryEditModal = (category) => {
        setEditingCategory({...category});
        setShowCategoryEditModal(true);
    };
    const openTplDeleteModal = (tpl) => {
        setTplToDelete(tpl);
        setShowTplDeleteModal(true);
    };
    const openCategoryDeleteModal = (category) => {
        setCategoryToDelete(category);
        setShowCategoryDeleteModal(true);
    };

    const handleTplSearch = () => {
        setTplCurrentPage(1);
        loadTPLs(1, perPage, tplSearch);
    };

    const handleCategorySearch = () => {
        setCategoryCurrentPage(1);
        loadCategories(1, perPage, categorySearch);
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    const handleNewTplChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewTpl(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const handleNewCategoryChange = (e) => {
        const {name, value} = e.target;
        setNewCategory(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Register Escape key to close modals
    useEscapeToClose(showTplAddModal, () => setShowTplAddModal(false));
    useEscapeToClose(showTplEditModal, () => setShowTplEditModal(false));
    useEscapeToClose(showTplDeleteModal, () => setShowTplDeleteModal(false));
    useEscapeToClose(showCategoryAddModal, () => setShowCategoryAddModal(false));
    useEscapeToClose(showCategoryEditModal, () => setShowCategoryEditModal(false));
    useEscapeToClose(showCategoryDeleteModal, () => setShowCategoryDeleteModal(false));

    // Add state for view modals
    const [showTplViewModal, setShowTplViewModal] = useState(false);
    const [tplToView, setTplToView] = useState(null);
    const [showCategoryViewModal, setShowCategoryViewModal] = useState(false);
    const [categoryToView, setCategoryToView] = useState(null);

    const openTplViewModal = (tpl) => {
        setTplToView(tpl);
        setShowTplViewModal(true);
    };
    const openCategoryViewModal = async (category) => {
        setCategoryToView(category);
        setShowCategoryViewModal(true);
        setLoadingCategoryTpls(true);
        setCategoryTplsPage(1);
        // Fetch all TPLs for this category (no pagination, just show all for now)
        try {
            const res = await fetchTPLs(1, 1000, '');
            let tpls = [];
            if (Array.isArray(res)) {
                tpls = res;
            } else if (res.data) {
                tpls = res.data;
            }
            setCategoryTpls(tpls.filter(tpl => tpl.category === category.category));
        } catch (e) {
            setCategoryTpls([]);
        }
        setLoadingCategoryTpls(false);
    };

    // Register Escape key to close view modals
    useEscapeToClose(showTplViewModal, () => setShowTplViewModal(false));
    useEscapeToClose(showCategoryViewModal, () => setShowCategoryViewModal(false));

    // Add state for custom category dropdown
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');
    const filteredCategories = useMemo(() => [
        {tpl_categories_id: null, category: 'Uncategorized'},
        ...allCategories.filter(cat =>
            cat.category.toLowerCase().includes(categoryFilter.toLowerCase())
        )
    ], [allCategories, categoryFilter]);

    return (
        <div className="programs-container">
            {activeTab === 'tpls' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        {tplMetricsLoading ? (
                            <div className="flex-gap-16">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="metric-card metric-card-skeleton">
                                        <div className="metric-title metric-title-skeleton"></div>
                                        <div className="metric-value metric-value-skeleton"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <MetricCard title="Total TPLs" value={tplMetrics.total_tpls}/>
                                <MetricCard title="Active TPLs" value={tplMetrics.active_tpls}/>
                                <MetricCard title="High Value TPLs" value={tplMetrics.high_value_tpls}/>
                                <MetricCard title="2FA Required" value={tplMetrics.twofa_required}/>
                                <MetricCard title="Total Categories" value={tplMetrics.total_categories}/>
                                <MetricCard title="Uncategorized TPLs" value={tplMetrics.uncategorized_tpls}/>
                            </>
                        )}
                    </div>

                    <div className="page-search">
                        <input
                            type="text"
                            id="tplSearchInput"
                            className="filter-input"
                            placeholder="Search TPLs..."
                            value={tplSearch}
                            onChange={(e) => setTplSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTplSearch()}
                        />
                        <button id="tplsSearchButton"
                                className={`action-btn ${activeTPLSButtonId === 'tplsSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTPLSButtonClick('tplsSearchButton', handleTplSearch)}>Search
                        </button>
                        <button id="tplsRefreshButton"
                                className={`action-btn ${activeTPLSButtonId === 'tplsRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTPLSButtonClick('tplsRefreshButton', () => loadTPLs(tplCurrentPage, perPage, tplSearch))}>Refresh
                        </button>
                        <button id="addsTplButton"
                                className={`action-btn ${activeTPLSButtonId === 'addsTplButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTPLSButtonClick('addsTplButton', openTplAddModal)}>Add TPLS
                        </button>
                    </div>

                    <div className="programs-table">
                        <DataTable
                            columns={tplsColumns}
                            data={tpls}
                            currentPage={tplCurrentPage}
                            totalPages={tplTotalPages}
                            totalItems={tplTotalItems}
                            perPage={perPage}
                            onPageChange={handleTplPageChange}
                            onPerPageChange={handleTplPerPageChange}
                            loading={tplLoading}
                            noDataText="No TPLs available"
                            loadingText="Loading TPLs..."
                            openTplViewModal={openTplViewModal}
                            openTplEditModal={openTplEditModal}
                            openTplDeleteModal={openTplDeleteModal}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        {categoryMetricsLoading ? (
                            <div className="flex-gap-16">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="metric-card metric-card-skeleton">
                                        <div className="metric-title metric-title-skeleton"></div>
                                        <div className="metric-value metric-value-skeleton"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <MetricCard title="Total Categories" value={categoryMetrics.total_categories}/>
                                <MetricCard title="Categories With TPLs" value={categoryMetrics.categories_with_tpls}/>
                                <MetricCard title="Empty Categories" value={categoryMetrics.empty_categories}/>
                                <MetricCard title="Avg TPLs Per Category"
                                            value={categoryMetrics.avg_tpls_per_category}/>
                                <MetricCard title="Largest Category" value={categoryMetrics.largest_category}/>
                                <MetricCard title="Uncategorized TPLs" value={categoryMetrics.uncategorized_tpls}/>
                            </>
                        )}
                    </div>

                    <div className="page-search">
                        <input
                            type="text"
                            id="categorySearchInput"
                            className="filter-input"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCategorySearch()}
                        />
                        <button id="tplsCatSearchButton"
                                className={`action-btn ${activeTPLSCatButtonId === 'tplsCatSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTPLSCatButtonClick('tplsCatSearchButton', handleCategorySearch)}>Search
                        </button>
                        <button id="tplsCatRefreshButton"
                                className={`action-btn ${activeTPLSCatButtonId === 'tplsCatRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTPLSCatButtonClick('tplsCatRefreshButton', () => loadCategories(categoryCurrentPage, perPage, categorySearch))}>Refresh
                        </button>
                        <button id="addTPLSCatButton"
                                className={`action-btn ${activeTPLSCatButtonId === 'addTPLSCatButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTPLSCatButtonClick('addTPLSCatButton', openCategoryAddModal)}>Add
                            Category
                        </button>
                    </div>

                    <div className="programs-table">
                        <DataTable
                            columns={tplsCategoriesColumns}
                            data={categories}
                            currentPage={categoryCurrentPage}
                            totalPages={categoryTotalPages}
                            totalItems={categoryTotalItems}
                            perPage={perPage}
                            onPageChange={handleCategoryPageChange}
                            onPerPageChange={handleCategoryPerPageChange}
                            loading={categoryLoading}
                            noDataText="No categories available"
                            loadingText="Loading categories..."
                            openCategoryViewModal={openCategoryViewModal}
                            openCategoryEditModal={openCategoryEditModal}
                            openCategoryDeleteModal={openCategoryDeleteModal}
                        />
                    </div>
                </div>
            )}

            {/* Add TPLS Modal */}
            {showTplAddModal && (
                <Modal
                    isOpen={showTplAddModal}
                    onClose={() => setShowTplAddModal(false)}
                    title="Add TPLS"
                    ariaLabel="Add TPLS Modal"
                    size="large"
                >
                    <form onSubmit={handleTplAdd}>
                        <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div>
                                <div className="view-label">URL</div>
                                <input
                                    type="text"
                                    name="url"
                                    value={newTpl.url}
                                    onChange={e => setNewTpl(prev => ({...prev, url: e.target.value}))}
                                    required
                                    autoComplete="off"
                                    style={{width: '100%'}}
                                />
                            </div>
                            {/* Add other fields as needed */}
                        </div>
                        <div className="form-actions mt-18">
                            <button
                                type="button"
                                className="action-btn action-btn-neutral"
                                onClick={() => setShowTplAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add TPLS
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Category Modal */}
            {showCategoryAddModal && (
                <Modal
                    isOpen={showCategoryAddModal}
                    onClose={() => setShowCategoryAddModal(false)}
                    title="Add Category"
                    ariaLabel="Add Category Modal"
                    size="large"
                >
                    <form onSubmit={handleCategoryAdd}>
                        <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                            <div>
                                <div className="view-label">Category</div>
                                <input
                                    type="text"
                                    name="category"
                                    value={newCategory.category}
                                    onChange={e => setNewCategory({category: e.target.value})}
                                    required
                                    autoComplete="off"
                                    style={{width: '100%'}}
                                />
                            </div>
                        </div>
                        <div className="form-actions mt-18">
                            <button
                                type="button"
                                className="action-btn action-btn-neutral"
                                onClick={() => setShowCategoryAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add Category
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit TPLS Modal */}
            {showTplEditModal && editingTpl && (
                <div className="modal">
                    <div className="modal-content view-modal-content modal-content-large">
                        <span className="modal-close" onClick={() => setShowTplEditModal(false)}>×</span>
                        <h3 className="mb-1rem">Edit TPLS</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            // Parse URL
                            let protocol = 'https', domain = '', url_path = '/login';
                            try {
                                const urlObj = new URL(editingTpl.url);
                                protocol = urlObj.protocol.replace(':', '');
                                domain = urlObj.hostname;
                                url_path = urlObj.pathname + urlObj.search + urlObj.hash;
                            } catch (err) {
                                showNotification('Invalid URL format', true);
                                return;
                            }
                            const payload = {
                                ...editingTpl,
                                protocol,
                                domain,
                                url_path,
                            };
                            delete payload.url;
                            try {
                                const response = await fetch(`/api/sls/tpls/${editingTpl.tpls_id}`, {
                                    method: 'PUT',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify(payload),
                                });
                                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                                const result = await response.json();
                                if (result.success) {
                                    showNotification('TPLS updated successfully');
                                    setShowTplEditModal(false);
                                    loadTPLs(tplCurrentPage, perPage, tplSearch);
                                    loadTplMetrics();
                                    loadCategoryMetrics();
                                } else {
                                    showNotification(`Error: ${result.error || 'Unknown error'}`, true);
                                }
                            } catch (error) {
                                console.error('Error updating TPLS:', error);
                                showNotification(`Error: ${error.message}`, true);
                            }
                        }}>
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    name="fk_category_id"
                                    value={editingTpl.fk_category_id}
                                    onChange={e => setEditingTpl({...editingTpl, fk_category_id: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="url">URL</label>
                                <input
                                    type="text"
                                    id="url"
                                    name="url"
                                    value={editingTpl.url || ''}
                                    onChange={e => setEditingTpl({...editingTpl, url: e.target.value})}
                                    required
                                    placeholder="https://example.com/login"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <input
                                    type="text"
                                    id="notes"
                                    value={editingTpl.notes || ''}
                                    onChange={e => setEditingTpl({...editingTpl, notes: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={editingTpl.description || ''}
                                    onChange={e => setEditingTpl({...editingTpl, description: e.target.value})}
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${editingTpl.high_value === 1 ? ' enabled' : ' disabled'}`}
                                    aria-pressed={editingTpl.high_value === 1}
                                    onClick={() => setEditingTpl({
                                        ...editingTpl,
                                        high_value: editingTpl.high_value === 1 ? 0 : 1
                                    })}
                                >
                                    High Value
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn${editingTpl.twofa_required === 1 ? ' enabled' : ' disabled'}`}
                                    aria-pressed={editingTpl.twofa_required === 1}
                                    onClick={() => setEditingTpl({
                                        ...editingTpl,
                                        twofa_required: editingTpl.twofa_required === 1 ? 0 : 1
                                    })}
                                >
                                    2FA Required
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn${editingTpl.alive === 1 ? ' enabled' : ' disabled'}`}
                                    aria-pressed={editingTpl.alive === 1}
                                    onClick={() => setEditingTpl({
                                        ...editingTpl,
                                        alive: editingTpl.alive === 1 ? 0 : 1
                                    })}
                                >
                                    Alive
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="action-btn action-btn-green"
                                        onClick={() => setShowTplEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete TPLS Confirmation Modal */}
            <Modal
                isOpen={showTplDeleteModal && !!tplToDelete}
                onClose={() => setShowTplDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete TPLS Confirmation"
            >
                <p>Are you sure you want to delete the TPLS for <span className="fw-700">{tplToDelete?.domain || 'N/A'}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button
                        type="button"
                        className="action-btn action-btn-green"
                        onClick={() => setShowTplDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="action-btn action-btn-primary"
                        onClick={handleTplDelete}
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            {/* Edit Category Modal */}
            {showCategoryEditModal && editingCategory && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="modal-close" onClick={() => setShowCategoryEditModal(false)}>×</span>
                        <h3>Edit Category</h3>
                        <form onSubmit={handleCategoryUpdate}>
                            <div className="form-group">
                                <label htmlFor="categoryName">Category Name</label>
                                <input
                                    type="text"
                                    id="categoryName"
                                    value={editingCategory.category || ''}
                                    onChange={(e) => setEditingCategory({...editingCategory, category: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="action-btn action-btn-green"
                                        onClick={() => setShowCategoryEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Category Confirmation Modal */}
            <Modal
                isOpen={showCategoryDeleteModal && !!categoryToDelete}
                onClose={() => setShowCategoryDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete Category Confirmation"
            >
                <p>Are you sure you want to delete the category <span className="fw-700">{categoryToDelete?.category || 'N/A'}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button
                        type="button"
                        className="action-btn action-btn-green"
                        onClick={() => setShowCategoryDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="action-btn action-btn-primary"
                        onClick={handleCategoryDelete}
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            {showTplViewModal && tplToView && (
                <div className="modal">
                    <div className="modal-content view-modal-content modal-content-large">
                        <span className="modal-close" onClick={() => setShowTplViewModal(false)}>×</span>
                        <h3 className="program-details-header">TPLS DETAILS</h3>
                        <div className="details-section">
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Category</label><span>{tplToView.category || 'Uncategorized'}</span></div>
                                <div className="detail-item"><label>Domain</label><span>{tplToView.domain}</span></div>
                                <div className="detail-item"><label>Protocol</label><span>{tplToView.protocol}</span>
                                </div>
                                <div className="detail-item"><label>URL Path</label><span>{tplToView.url_path}</span>
                                </div>
                                <div className="detail-item"><label>High
                                    Value</label><span>{tplToView.is_high_value ? 'Yes' : 'No'}</span></div>
                                <div className="detail-item"><label>2FA
                                    Required</label><span>{tplToView.is_twofa_required ? 'Yes' : 'No'}</span></div>
                                <div className="detail-item">
                                    <label>Alive</label><span>{tplToView.is_alive ? 'Yes' : 'No'}</span></div>
                                <div className="detail-item"><label>Notes</label><span>{tplToView.notes || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Description</label><span>{tplToView.description || 'N/A'}</span></div>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="action-btn action-btn-green"
                                    onClick={() => setShowTplViewModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryViewModal && categoryToView && (
                <div className="modal">
                    <div className="modal-content view-modal-content modal-content-xlarge">
                        <span className="modal-close" onClick={() => setShowCategoryViewModal(false)}>×</span>
                        <h3 className="program-details-header">CATEGORY DETAILS</h3>
                        <div className="details-section">
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Category</label><span>{categoryToView.category}</span></div>
                                <div className="detail-item"><label>Count</label><span>{categoryTpls.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="details-section">
                            <h4 className="mtb-24-8">TPLS in this Category</h4>
                            <DataTable
                                columns={[
                                    {Header: 'DOMAIN', accessor: 'domain'},
                                    {Header: 'PROTOCOL', accessor: 'protocol'},
                                    {Header: 'URL PATH', accessor: 'url_path'},
                                    {
                                        Header: 'HIGH VALUE',
                                        accessor: 'is_high_value',
                                        Cell: ({value}) => value ? 'Yes' : 'No'
                                    },
                                    {
                                        Header: '2FA REQUIRED',
                                        accessor: 'is_twofa_required',
                                        Cell: ({value}) => value ? 'Yes' : 'No'
                                    },
                                    {Header: 'ALIVE', accessor: 'is_alive', Cell: ({value}) => value ? 'Yes' : 'No'},
                                ]}
                                data={paginatedCategoryTpls}
                                currentPage={categoryTplsPage}
                                totalPages={Math.max(1, Math.ceil(categoryTpls.length / perPage))}
                                totalItems={categoryTpls.length}
                                perPage={perPage}
                                onPageChange={handleCategoryTplsPageChange}
                                onPerPageChange={handleCategoryTplsPerPageChange}
                                loading={loadingCategoryTpls}
                                noDataText="No TPLs in this category"
                                loadingText="Loading TPLs..."
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="action-btn"
                                    onClick={() => setShowCategoryViewModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default TPLS;