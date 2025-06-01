import React, {useState, useEffect, useMemo } from 'react';
import { Clipboard, File, Globe, Network, Server, Share2, ClipboardCheck } from 'lucide-react';
import MetricCard from '../../common/components/MetricCard';
import DataTable from '../../common/components/DataTable';
import { fetchDeeperAlerts, markDeeplikePageAlertsAsViewed, markDeeplikeAlertAsViewed,    markDeeplikeAllAlertsAsViewed } from '../../api/apiService';
import * as Hooks from "../../hooks";
import { copyInfoClipboard } from '../../common/functions/copyToClipboard'
import ProgramWithLogo from '../../common/components/ProgramWithLogo';
import { deeperAlertsColumns } from '../../common/tableConfigs/deeperAlerts';
import { mapDeeperAlerts } from '../../common/utils/dataMappers';
import { useTableData } from '../../common/hooks/useTableData';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/components.css';
import '../../styles/Dashboard.css';

const DeeperDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [dashboardMetrics, setDashboardMetrics] = useState({
        total_discoveries: 0,
        new_domains: 0,
        new_subdomains: 0,
        new_ips: 0,
        unviewed_alerts: 0,
        active_scans: 0,
    });
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [localTableData, setLocalTableData] = useState([]);

    const {activeButtonId, handleButtonClick} = Hooks.useButtonToggle('deeperSearchButton');

    const [perPage, setPerPage] = useGlobalPerPage();

    const {
        data,
        loading: tableLoading,
        totalPages: tableTotalPages,
        totalItems: tableTotalItems
    } = useTableData(fetchDeeperAlerts, {
        page: currentPage,
        perPage,
        search: searchTerm,
        category: activeCategory,
        refreshFlag
    });
    const tableData = mapDeeperAlerts(data);

    useEffect(() => {
        setLocalTableData(tableData);
    }, [tableData]);

    // Define columns for react-table
    const columns = useMemo(
        () => [
            {
                Header: 'Program',
                accessor: 'program',
                Cell: ({row}) => (
                    <ProgramWithLogo
                        programName={row.original.program}
                        platformName={row.original.platform_name}
                    />
                ),
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: ({value}) => (
                    <div className="type-cell">
                        <span className="type-label">{value}</span>
                    </div>
                ),
            },
            {
                Header: 'Value',
                accessor: 'value',
                Cell: ({value, row}) => {
                    const isUrl = row.original.type === 'url';
                    return (
                        <div className="copy-cell">
                            {isUrl ? (
                                <a href={value} target="_blank" rel="noopener noreferrer">
                                    {value}
                                </a>
                            ) : (
                                <span>{value}</span>
                            )}
                            {isUrl && (
                                <a href={value} className="text-gray-400 hover:text-white ml-1"
                                   target="_blank" rel="noopener noreferrer" title="Open in new tab"
                                   onClick={(e) => handleOpen(`${value}`, e)}>
                                    <span className="ml-2 inline-block"/>
                                </a>
                            )}
                            <button className="copy-btn" onClick={() => copyInfoClipboard(value)} title="Copy value">
                                <Clipboard size={14}/>
                            </button>
                        </div>
                    );
                }
            },
            {
                Header: 'Discovery Date',
                accessor: 'discovery_date',
                Cell: ({value}) => new Date(value).toLocaleString(),
            },
            // {
            //     Header: 'Details',
            //     accessor: 'details',
            //     Cell: ({value}) => (
            //         <div className="copy-cell">
            //             <span>{value || 'No details'}</span>
            //             {value && (
            //                 <button className="copy-btn" onClick={() => copyInfoClipboard(value)}
            //                         title="Copy details">
            //                     <Clipboard size={14}/>
            //                 </button>
            //             )}
            //         </div>
            //     ),
            // },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({row}) => (
                    <div className="actions-cell">
                        <button className="ack-btn"
                                onClick={() => handleAck(row.original.id, row.original.type)}
                                title="Acknowledge">
                            <ClipboardCheck size={14}/>
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    // Similar to your current Dashboard.jsx pattern
    useEffect(() => {
        loadMetrics();
        loadAlerts(1, perPage, '', activeCategory);
        // Add 1-minute interval for metrics refresh
        const interval = setInterval(() => {
            loadMetrics();
        }, 60000); // 1 minute
        return () => clearInterval(interval);
    }, []);

    const loadMetrics = async (category = 'all') => {
        try {
            const data = await fetch(`/api/deeper/dashboard-metrics${category !== 'all' ? `?category=${category}` : ''}`).then(res => res.json());
            setDashboardMetrics({
                total_discoveries: data.total_discoveries || 0,
                new_domains: data.new_domains || 0,
                new_subdomains: data.new_subdomains || 0,
                new_ips: data.new_ips || 0,
                active_scans: data.active_scans || 0,
                unviewed_alerts: data.unviewed_alerts || 0,
            });
        } catch (error) {
            console.error('Error fetching metrics:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };
    // Function to update
    const loadAlerts = async (page = 1, limit = perPage, search = '', category = 'all') => {
        setLoading(true);
        try {
            // Request one more item than needed to check if we're getting the correct number
            const requestLimit = limit + 1;
            const response = await fetchDeeperAlerts(page, requestLimit, search, category);

            if (Array.isArray(response.data)) {
                // Only use the expected number of items
                setAlerts(response.data.slice(0, limit));
                console.log(`Requested ${requestLimit} items, received ${response.data.length}`);

                if (response.pagination) {
                    setCurrentPage(response.pagination.current_page || 1);
                    setTotalPages(response.pagination.total_pages || 1);
                    setTotalItems(response.pagination.total || 0);
                    console.log("Pagination data:", response.pagination);
                }
            } else {
                setAlerts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            showNotification(`Error: ${error.message}`, true);
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadAlerts(1, perPage, searchTerm, activeCategory);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setCurrentPage(1);
        loadMetrics(category);
        loadAlerts(1, perPage, searchTerm, category);
    };

    const handleMarkAlertAsViewed = async (id, type) => {
        try {
            const result = await markDeeplikeAlertAsViewed(id, type);
            if (result.success) {
                showNotification('Alert marked as viewed');
                loadMetrics();
                loadAlerts(currentPage, perPage, searchTerm, activeCategory);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error marking alert as viewed:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleMarkPageAlertsAsViewed = async () => {
        if (alerts.length === 0) {
            showNotification('No alerts to mark as viewed');
            return;
        }

        try {
            // Extract IDs and types from current page alerts
            const ids = alerts.map(alert => alert.id);
            const types = alerts.map(alert => alert.type);

            const result = await markDeeplikePageAlertsAsViewed(ids, types);
            if (result.success) {
                showNotification('All alerts on this page marked as viewed');
                loadMetrics();
                loadAlerts(currentPage, perPage, searchTerm, activeCategory);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error marking page alerts as viewed:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleMarkAllAlertsAsViewed = async () => {
        try {
            const result = await markDeeplikeAllAlertsAsViewed();
            if (result.success) {
                showNotification('All alerts marked as viewed');
                loadMetrics();
                // Stay on the same page if possible, but maintain the perPage value
                setCurrentPage(1); // Reset to first page since all alerts are marked
                loadAlerts(1, perPage, searchTerm, activeCategory);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error marking all alerts as viewed:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification((prev) => ({...prev, visible: false})), 3000);
    };

    // Helper function to determine the icon for different asset types
    const getAssetIcon = (type) => {
        switch (type) {
            case 'domain':
                return <Globe size={14}/>;
            case 'subdomain':
                return <Share2 size={14}/>;
            case 'ip':
                return <Server size={14}/>;
            case 'cidr':
                return <Network size={14}/>;
            default:
                return <File size={14}/>;
        }
    };

    const handleOpen = async (url, e) => {
        try {
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                showNotification('Failed to open tab - check popup blocker', true);
            }
        } catch (error) {
            console.error('Clipboard write failed:', error);
            showNotification('Failed to copy to clipboard: ' + error.message, true);
        }
    };

    const afterAction = (removedId) => {
        loadMetrics();
        setLocalTableData(prev => prev.filter(row =>
            row.id !== removedId
        ));
        setRefreshFlag(f => !f);
    };

    const handleAck = async (id, type) => {
        try {
            const result = await markDeeplikeAlertAsViewed(id, type);
            if (result.success) {
                showNotification('Alert marked as viewed');
                afterAction(id);
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error marking alert as viewed:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    return (
        <div className="programs-container">
            {/* Metrics */}
            <div className="programs-metrics">
                <MetricCard title="Alerts" value={dashboardMetrics.unviewed_alerts}/>
                <MetricCard title="Domains" value={dashboardMetrics.new_domains}/>
                <MetricCard title="Subdomains" value={dashboardMetrics.new_subdomains}/>
                <MetricCard title="URLs" value={dashboardMetrics.total_discoveries}/>
                <MetricCard title="IP/CIDR" value={dashboardMetrics.new_ips}/>
                <MetricCard title="Total" value={dashboardMetrics.active_scans}/>
            </div>

            {/* Search bar and category selection */}
            <div className="page-search">
                <input
                    type="text"
                    id="deeperSearchInput"
                    className="filter-input"
                    placeholder="Search discoveries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

                <div className="category-filters">
                    <button
                        className={`action-btn action-btn-active ${activeCategory === 'all' ? 'filter-btn-active' : ''}`}
                        onClick={() => handleCategoryChange('all')}
                    >
                        All
                    </button>
                    <button
                        className={`action-btn action-btn-active ${activeCategory === 'domain' ? 'filter-btn-active' : ''}`}
                        onClick={() => handleCategoryChange('domain')}
                    >
                        Domains
                    </button>
                    <button
                        className={`action-btn action-btn-active ${activeCategory === 'subdomain' ? 'filter-btn-active' : ''}`}
                        onClick={() => handleCategoryChange('subdomain')}
                    >
                        Subdomains
                    </button>
                    <button
                        className={`action-btn action-btn-active ${activeCategory === 'url' ? 'filter-btn-active' : ''}`}
                        onClick={() => handleCategoryChange('url')}
                    >
                        URLs
                    </button>
                    <button
                        className={`action-btn action-btn-active ${activeCategory === 'ip' ? 'filter-btn-active' : ''}`}
                        onClick={() => handleCategoryChange('ip')}
                    >
                        IP/CIDR
                    </button>
                </div>

                <button
                    id="deeperSearchButton"
                    className={`action-btn ${activeButtonId === 'deeperSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('deeperSearchButton', handleSearch)}
                >
                    Search
                </button>
                <button
                    id="deeperRefreshButton"
                    className={`action-btn ${activeButtonId === 'deeperRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                    onClick={() => handleButtonClick('deeperRefreshButton', () => loadAlerts(currentPage, perPage, searchTerm, activeCategory))}
                >
                    Refresh
                </button>
                <button
                    className="action-btn action-btn-active"
                    onClick={handleMarkPageAlertsAsViewed}
                >
                    Mark Page Viewed
                </button>
                <button
                    className="action-btn action-btn-active"
                    onClick={handleMarkAllAlertsAsViewed}
                >
                    Mark All Viewed
                </button>
            </div>

            {/* Assets table */}
            <div className="programs-table">
                <DataTable
                    columns={deeperAlertsColumns}
                    data={localTableData}
                    currentPage={currentPage}
                    totalPages={tableTotalPages}
                    totalItems={tableTotalItems}
                    perPage={perPage}
                    onPageChange={setCurrentPage}
                    onPerPageChange={setPerPage}
                    loading={tableLoading}
                    noDataText="No alerts available"
                    loadingText="Loading alerts..."
                    handleAck={handleAck}
                />
            </div>

            {/* Notification */}
            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default DeeperDashboard;