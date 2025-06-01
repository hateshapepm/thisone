// Telegram.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MetricCard from '../../common/components/MetricCard';
import { fetchTelegramChannelMetrics, fetchTelegramFileMetrics } from '../../api/apiService';
import * as Hooks from '../../hooks';
import DataTable from '../../common/components/DataTable';
import { telegramChannelsColumns } from '../../common/tableConfigs/telegramChannels';
import { telegramFilesColumns } from '../../common/tableConfigs/telegramFiles';
import { useEscapeToClose } from '../../hooks';
import { useGlobalPerPage } from '../../common/hooks/useGlobalPerPage';
import '../../styles/components.css';
import Modal from '../../common/components/Modal';

const Telegram = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'channels');
    const [channels, setChannels] = useState([]);
    const [channelCurrentPage, setChannelCurrentPage] = useState(1);
    const [channelTotalPages, setChannelTotalPages] = useState(1);
    const [channelTotalItems, setChannelTotalItems] = useState(0);
    const [channelSearch, setChannelSearch] = useState('');
    const [channelLoading, setChannelLoading] = useState(true);
    const [perPage, setPerPage] = useGlobalPerPage();

    const [files, setFiles] = useState([]);
    const [fileCurrentPage, setFileCurrentPage] = useState(1);
    const [fileTotalPages, setFileTotalPages] = useState(1);
    const [fileTotalItems, setFileTotalItems] = useState(0);
    const [fileSearch, setFileSearch] = useState('');
    const [fileLoading, setFileLoading] = useState(true);

    const [showChannelEditModal, setShowChannelEditModal] = useState(false);
    const [showFileEditModal, setShowFileEditModal] = useState(false);
    const [showChannelDeleteModal, setShowChannelDeleteModal] = useState(false);
    const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const [channelToDelete, setChannelToDelete] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);

    // Around line 36-37, after the other modal states
    const [showChannelAddModal, setShowChannelAddModal] = useState(false);
    const [showFileAddModal, setShowFileAddModal] = useState(false);
    const [newChannel, setNewChannel] = useState({
        channel: '',
        title: '',
        url: '',
        channel_id: '',
        access_hash: '',
        active: 1
    });
    const [newFile, setNewFile] = useState({
        file_id: '',
        filename: '',
        file_size: '',
        file_date: '',
        downloaded: 0,
        processed: 0,
        fk_tg_channels_id: ''
    });

    const [channelMetrics, setChannelMetrics] = useState({
        total_channels: 0,
        active_channels: 0,
        monitored_channels: 0,
        new_messages: 0,
        archived_channels: 0,
        flagged_channels: 0,
    });

    const [fileMetrics, setFileMetrics] = useState({
        total_files: 0,
        pending_files: 0,
        processed_files: 0,
        failed_files: 0,
        downloaded_today: 0,
        storage_used: "0 MB",
    });

    const {
        activeButtonId: activeTelegramChannelButtonId,
        handleButtonClick: handleTelegramChannelButtonClick
    } = Hooks.useButtonToggle('tgChannelSearchButton');
    const {
        activeButtonId: activeTelegramFileButtonId,
        handleButtonClick: handleTelegramFileButtonClick
    } = Hooks.useButtonToggle('tgFileSearchButton');

    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    // showNotification must be defined before any function that uses it
    const showNotification = useCallback((message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    }, []);

    // Register Escape key to close modals
    useEscapeToClose(showChannelAddModal, () => setShowChannelAddModal(false));
    useEscapeToClose(showFileAddModal, () => setShowFileAddModal(false));
    useEscapeToClose(showChannelEditModal, () => setShowChannelEditModal(false));
    useEscapeToClose(showFileEditModal, () => setShowFileEditModal(false));
    useEscapeToClose(showChannelDeleteModal, () => setShowChannelDeleteModal(false));
    useEscapeToClose(showFileDeleteModal, () => setShowFileDeleteModal(false));

    const loadTelegramChannels = useCallback((page = 1, limit = perPage, search = '') => {
        setChannelLoading(true);
        let url = `/api/sls/telegram-channels?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setChannels(data);
                    setChannelCurrentPage(1);
                    setChannelTotalPages(1);
                    setChannelTotalItems(data.length);
                } else if (data.data) {
                    setChannels(data.data);
                    setChannelCurrentPage(data.pagination?.current_page || 1);
                    setChannelTotalPages(data.pagination?.total_pages || 1);
                    setChannelTotalItems(data.pagination?.total || 0);
                } else {
                    setChannels([]);
                }
                setChannelLoading(false);
            })
            .catch(error => {
                console.error('Error fetching telegram channels:', error);
                showNotification(`Error: ${error.message}`, true);
                setChannelLoading(false);
            });
    }, [perPage, showNotification]);

    const loadTelegramFiles = useCallback((page = 1, limit = perPage, search = '') => {
        setFileLoading(true);
        let url = `/api/sls/telegram-files?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setFiles(data);
                    setFileCurrentPage(1);
                    setFileTotalPages(1);
                    setFileTotalItems(data.length);
                } else if (data.data) {
                    setFiles(data.data);
                    setFileCurrentPage(data.pagination?.current_page || 1);
                    setFileTotalPages(data.pagination?.total_pages || 1);
                    setFileTotalItems(data.pagination?.total || 0);
                } else {
                    setFiles([]);
                }
                setFileLoading(false);
            })
            .catch(error => {
                console.error('Error fetching telegram files:', error);
                showNotification(`Error: ${error.message}`, true);
                setFileLoading(false);
            });
    }, [perPage, showNotification]);

    const loadChannelMetrics = useCallback(async () => {
        try {
            const metricsData = await fetchTelegramChannelMetrics();
            setChannelMetrics({
                total_channels: metricsData.total_channels || 0,
                active_channels: metricsData.active_channels || 0,
                monitored_channels: metricsData.monitored_channels || 0,
                new_messages: metricsData.new_messages || 0,
                archived_channels: metricsData.archived_channels || 0,
                flagged_channels: metricsData.flagged_channels || 0,
            });
        } catch (error) {
            console.error('Error fetching channel metrics:', error);
            setChannelMetrics({
                total_channels: channelTotalItems || channels.length,
                active_channels: 0,
                monitored_channels: 0,
                new_messages: 0,
                archived_channels: 0,
                flagged_channels: 0,
            });
        }
    }, [channelTotalItems, channels.length]);

    const loadFileMetrics = useCallback(async () => {
        try {
            const metricsData = await fetchTelegramFileMetrics();
            setFileMetrics({
                total_files: metricsData.total_files || 0,
                pending_files: metricsData.pending_files || 0,
                processed_files: metricsData.processed_files || 0,
                failed_files: metricsData.failed_files || 0,
                downloaded_today: metricsData.downloaded_today || 0,
                storage_used: metricsData.storage_used || "0 MB",
            });
        } catch (error) {
            console.error('Error fetching file metrics:', error);
            setFileMetrics({
                total_files: fileTotalItems || files.length,
                pending_files: 0,
                processed_files: 0,
                failed_files: 0,
                downloaded_today: 0,
                storage_used: "0 MB",
            });
        }
    }, [fileTotalItems, files.length]);

    useEffect(() => {
        if (!location.state?.activeTab) {
            navigate(location.pathname, {state: {activeTab: 'channels'}, replace: true});
        }
    }, [location, navigate]);

    useEffect(() => {
        if (location.state?.activeTab && location.state.activeTab !== activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state, activeTab]);

    useEffect(() => {
        if (activeTab === 'channels') {
            loadTelegramChannels(1, perPage, '');
            loadChannelMetrics();
        } else {
            loadTelegramFiles(1, perPage, '');
            loadFileMetrics();
        }
    }, [activeTab, perPage, loadTelegramChannels, loadChannelMetrics, loadTelegramFiles, loadFileMetrics]);

    const handleChannelPageChange = (newPage) => {
        setChannelCurrentPage(newPage);
        loadTelegramChannels(newPage, perPage, channelSearch);
    };

    const handleFilePageChange = (newPage) => {
        setFileCurrentPage(newPage);
        loadTelegramFiles(newPage, perPage, fileSearch);
    };

    const handleChannelPerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setChannelCurrentPage(1);
        loadTelegramChannels(1, newPerPage, channelSearch);
    };

    const handleFilePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setFileCurrentPage(1);
        loadTelegramFiles(1, newPerPage, fileSearch);
    };

    const handleChannelAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/sls/telegram-channels', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newChannel),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                showNotification('Channel added successfully');
                setShowChannelAddModal(false);
                setNewChannel({channel: '', title: '', url: '', channel_id: '', access_hash: '', active: 1});
                loadTelegramChannels(channelCurrentPage, perPage, channelSearch);
                loadChannelMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding telegram channel:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleFileAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/sls/telegram-files', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newFile),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                showNotification('File added successfully');
                setShowFileAddModal(false);
                setNewFile({
                    file_id: '',
                    filename: '',
                    file_size: '',
                    file_date: '',
                    downloaded: 0,
                    processed: 0,
                    fk_tg_channels_id: ''
                });
                loadTelegramFiles(fileCurrentPage, perPage, fileSearch);
                loadFileMetrics();
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error adding telegram file:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleChannelUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/sls/telegram-channels/${editingChannel.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingChannel),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                showNotification('Channel updated successfully');
                setShowChannelEditModal(false);
                loadTelegramChannels(channelCurrentPage, perPage, channelSearch);
                loadChannelMetrics(); // Refresh metrics
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating telegram channel:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleFileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/sls/telegram-files/${editingFile.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingFile),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                showNotification('File updated successfully');
                setShowFileEditModal(false);
                loadTelegramFiles(fileCurrentPage, perPage, fileSearch);
                loadFileMetrics(); // Refresh metrics
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating telegram file:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleChannelDelete = async () => {
        try {
            const response = await fetch(`/api/sls/telegram-channels/${channelToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('Channel deleted successfully');
                setShowChannelDeleteModal(false);
                setChannelToDelete(null);
                loadTelegramChannels(channelCurrentPage, perPage, channelSearch);
                loadChannelMetrics(); // Refresh metrics
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting telegram channel:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const handleFileDelete = async () => {
        try {
            const response = await fetch(`/api/sls/telegram-files/${fileToDelete.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                showNotification('File deleted successfully');
                setShowFileDeleteModal(false);
                setFileToDelete(null);
                loadTelegramFiles(fileCurrentPage, perPage, fileSearch);
                loadFileMetrics(); // Refresh metrics
            } else {
                showNotification(`Error: ${result.error || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error deleting telegram file:', error);
            showNotification(`Error: ${error.message}`, true);
        }
    };

    const openChannelEditModal = (channel) => {
        setEditingChannel({...channel});
        setShowChannelEditModal(true);
    };

    const openFileEditModal = (file) => {
        setEditingFile({...file});
        setShowFileEditModal(true);
    };

    const openChannelDeleteModal = (channel) => {
        setChannelToDelete(channel);
        setShowChannelDeleteModal(true);
    };

    const openFileDeleteModal = (file) => {
        setFileToDelete(file);
        setShowFileDeleteModal(true);
    };

    const handleChannelSearch = () => {
        setChannelCurrentPage(1);
        loadTelegramChannels(1, perPage, channelSearch);
    };

    const handleFileSearch = () => {
        setFileCurrentPage(1);
        loadTelegramFiles(1, perPage, fileSearch);
    };

    return (
        <div className="programs-container">
            {activeTab === 'channels' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        <MetricCard title="Total Channels" value={channelMetrics.total_channels}/>
                        <MetricCard title="Active Channels" value={channelMetrics.active_channels}/>
                        <MetricCard title="Monitored Channels" value={channelMetrics.monitored_channels}/>
                        <MetricCard title="New Messages" value={channelMetrics.new_messages}/>
                        <MetricCard title="Archived Channels" value={channelMetrics.archived_channels}/>
                        <MetricCard title="Flagged Channels" value={channelMetrics.flagged_channels}/>
                    </div>

                    <div className="page-search">
                        <input
                            type="text"
                            id="channelSearchInput"
                            className="filter-input"
                            placeholder="Search channels..."
                            value={channelSearch}
                            onChange={(e) => setChannelSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChannelSearch()}
                        />
                        <button id="tgChannelSearchButton"
                                className={`action-btn ${activeTelegramChannelButtonId === 'tgChannelSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTelegramChannelButtonClick('tgChannelSearchButton', handleChannelSearch)}>Search
                        </button>

                        <button id="tgChannelRefreshButton"
                                className={`action-btn ${activeTelegramChannelButtonId === 'tgChannelRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTelegramChannelButtonClick('tgChannelRefreshButton', () => loadTelegramChannels(channelCurrentPage, perPage, channelSearch))}>Refresh
                        </button>
                        <button id="tgChannelAddButton"
                                className="action-btn action-btn-active"
                                onClick={() => setShowChannelAddModal(true)}>
                            Add Channel
                        </button>
                    </div>

                    <div className="programs-table">
                        <DataTable
                            columns={telegramChannelsColumns}
                            data={channels}
                            currentPage={channelCurrentPage}
                            totalPages={channelTotalPages}
                            totalItems={channelTotalItems}
                            perPage={perPage}
                            onPageChange={handleChannelPageChange}
                            onPerPageChange={handleChannelPerPageChange}
                            loading={channelLoading}
                            noDataText="No Telegram channels available"
                            loadingText="Loading Telegram channels..."
                            openChannelEditModal={openChannelEditModal}
                            loadTelegramChannels={loadTelegramChannels}
                            showNotification={showNotification}
                            loadChannelMetrics={loadChannelMetrics}
                            openChannelDeleteModal={openChannelDeleteModal}
                            channelCurrentPage={channelCurrentPage}
                            channelPerPage={perPage}
                            channelSearch={channelSearch}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'files' && (
                <div className="tab-content active">
                    <div className="programs-metrics">
                        <MetricCard title="Total Files" value={fileMetrics.total_files}/>
                        <MetricCard title="Pending Files" value={fileMetrics.pending_files}/>
                        <MetricCard title="Processed Files" value={fileMetrics.processed_files}/>
                        <MetricCard title="Failed Files" value={fileMetrics.failed_files}/>
                        <MetricCard title="Downloaded Today" value={fileMetrics.downloaded_today}/>
                        <MetricCard title="Storage Used" value={fileMetrics.storage_used}/>
                    </div>

                    <div className="page-search">
                        <input
                            type="text"
                            id="fileSearchInput"
                            className="filter-input"
                            placeholder="Search files..."
                            value={fileSearch}
                            onChange={(e) => setFileSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFileSearch()}
                        />
                        <button id="tgFileSearchButton"
                                className={`action-btn ${activeTelegramFileButtonId === 'tgFileSearchButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTelegramFileButtonClick('tgFileSearchButton', handleFileSearch)}>Search
                        </button>

                        <button id="tgFileRefreshButton"
                                className={`action-btn ${activeTelegramFileButtonId === 'tgFileRefreshButton' ? 'action-btn-active' : 'action-btn-active'}`}
                                onClick={() => handleTelegramFileButtonClick('tgFileRefreshButton', () => loadTelegramFiles(fileCurrentPage, perPage, fileSearch))}>Refresh
                        </button>
                        <button id="tgFileAddButton"
                                className="action-btn action-btn-active"
                                onClick={() => setShowFileAddModal(true)}>
                            Add File
                        </button>
                    </div>


                    <div className="programs-table">
                        <DataTable
                            columns={telegramFilesColumns}
                            data={files}
                            currentPage={fileCurrentPage}
                            totalPages={fileTotalPages}
                            totalItems={fileTotalItems}
                            perPage={perPage}
                            onPageChange={handleFilePageChange}
                            onPerPageChange={handleFilePerPageChange}
                            loading={fileLoading}
                            noDataText="No Telegram files available"
                            loadingText="Loading Telegram files..."
                            openFileEditModal={openFileEditModal}
                            loadTelegramFiles={loadTelegramFiles}
                            showNotification={showNotification}
                            loadFileMetrics={loadFileMetrics}
                            openFileDeleteModal={openFileDeleteModal}
                            fileCurrentPage={fileCurrentPage}
                            filePerPage={perPage}
                            fileSearch={fileSearch}
                        />
                    </div>
                </div>
            )}

            {showChannelAddModal && (
                <Modal
                    isOpen={showChannelAddModal}
                    onClose={() => setShowChannelAddModal(false)}
                    title="Add New Telegram Channel"
                    ariaLabel="Add Telegram Channel Modal"
                    size="large"
                >
                    <form onSubmit={handleChannelAdd}>
                        <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div>
                                <div className="view-label">Channel</div>
                                <input
                                    type="text"
                                    name="channel"
                                    value={newChannel.channel}
                                    onChange={e => setNewChannel(prev => ({...prev, channel: e.target.value}))}
                                    required
                                    autoComplete="off"
                                    style={{width: '100%'}}
                                />
                            </div>
                            <div>
                                <div className="view-label">Title</div>
                                <input
                                    type="text"
                                    name="title"
                                    value={newChannel.title}
                                    onChange={e => setNewChannel(prev => ({...prev, title: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">URL</div>
                                <input
                                    type="text"
                                    name="url"
                                    value={newChannel.url}
                                    onChange={e => setNewChannel(prev => ({...prev, url: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">Channel ID</div>
                                <input
                                    type="text"
                                    name="channel_id"
                                    value={newChannel.channel_id}
                                    onChange={e => setNewChannel(prev => ({...prev, channel_id: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">Access Hash</div>
                                <input
                                    type="text"
                                    name="access_hash"
                                    value={newChannel.access_hash}
                                    onChange={e => setNewChannel(prev => ({...prev, access_hash: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">Active</div>
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={!!newChannel.active}
                                    onChange={e => setNewChannel(prev => ({...prev, active: e.target.checked ? 1 : 0}))}
                                    aria-label="Active"
                                />
                            </div>
                        </div>
                        <div className="form-actions mt-18">
                            <button
                                type="button"
                                className="action-btn action-btn-neutral"
                                onClick={() => setShowChannelAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add Channel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showFileAddModal && (
                <Modal
                    isOpen={showFileAddModal}
                    onClose={() => setShowFileAddModal(false)}
                    title="Add New Telegram File"
                    ariaLabel="Add Telegram File Modal"
                    size="large"
                >
                    <form onSubmit={handleFileAdd}>
                        <div className="details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div>
                                <div className="view-label">File ID</div>
                                <input
                                    type="text"
                                    name="file_id"
                                    value={newFile.file_id}
                                    onChange={e => setNewFile(prev => ({...prev, file_id: e.target.value}))}
                                    required
                                    autoComplete="off"
                                    style={{width: '100%'}}
                                />
                            </div>
                            <div>
                                <div className="view-label">Filename</div>
                                <input
                                    type="text"
                                    name="filename"
                                    value={newFile.filename}
                                    onChange={e => setNewFile(prev => ({...prev, filename: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">File Size</div>
                                <input
                                    type="text"
                                    name="file_size"
                                    value={newFile.file_size}
                                    onChange={e => setNewFile(prev => ({...prev, file_size: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">File Date</div>
                                <input
                                    type="text"
                                    name="file_date"
                                    value={newFile.file_date}
                                    onChange={e => setNewFile(prev => ({...prev, file_date: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="view-label">Downloaded</div>
                                <input
                                    type="checkbox"
                                    name="downloaded"
                                    checked={!!newFile.downloaded}
                                    onChange={e => setNewFile(prev => ({...prev, downloaded: e.target.checked ? 1 : 0}))}
                                    aria-label="Downloaded"
                                />
                            </div>
                            <div>
                                <div className="view-label">Processed</div>
                                <input
                                    type="checkbox"
                                    name="processed"
                                    checked={!!newFile.processed}
                                    onChange={e => setNewFile(prev => ({...prev, processed: e.target.checked ? 1 : 0}))}
                                    aria-label="Processed"
                                />
                            </div>
                            <div>
                                <div className="view-label">Channel ID</div>
                                <input
                                    type="text"
                                    name="fk_tg_channels_id"
                                    value={newFile.fk_tg_channels_id}
                                    onChange={e => setNewFile(prev => ({...prev, fk_tg_channels_id: e.target.value}))}
                                    style={{width: '100%'}}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div className="form-actions mt-18">
                            <button
                                type="button"
                                className="action-btn action-btn-neutral"
                                onClick={() => setShowFileAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="action-btn action-btn-primary">
                                Add File
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Channel Modal */}
            {showChannelEditModal && editingChannel && (
                <div className="modal">
                    <div className="modal-content view-modal-content modal-content-large">
                        <span className="modal-close" onClick={() => setShowChannelEditModal(false)}>×</span>
                        <h3 className="mb-1rem">Edit Telegram Channel</h3>
                        <form onSubmit={handleChannelUpdate}>
                            <div className="form-group">
                                <label htmlFor="channelName">Channel Name</label>
                                <input
                                    type="text"
                                    id="channelName"
                                    value={editingChannel.channel || ''}
                                    onChange={(e) => setEditingChannel({...editingChannel, channel: e.target.value})}
                                    required
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="channelTitle">Channel Title</label>
                                <input
                                    type="text"
                                    id="channelTitle"
                                    value={editingChannel.title || ''}
                                    onChange={(e) => setEditingChannel({...editingChannel, title: e.target.value})}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="channelUrl">Channel URL</label>
                                <input
                                    type="text"
                                    id="channelUrl"
                                    value={editingChannel.url || ''}
                                    onChange={(e) => setEditingChannel({...editingChannel, url: e.target.value})}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="channelId">Channel ID</label>
                                <input
                                    type="text"
                                    id="channelId"
                                    value={editingChannel.channel_id || ''}
                                    onChange={(e) => setEditingChannel({...editingChannel, channel_id: e.target.value})}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="accessHash">Access Hash</label>
                                <input
                                    type="text"
                                    id="accessHash"
                                    value={editingChannel.access_hash || ''}
                                    onChange={(e) => setEditingChannel({
                                        ...editingChannel,
                                        access_hash: e.target.value
                                    })}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${editingChannel.active === 1 ? ' enabled' : ' disabled'}`}
                                    aria-pressed={editingChannel.active === 1}
                                    onClick={() => setEditingChannel({
                                        ...editingChannel,
                                        active: editingChannel.active === 1 ? 0 : 1
                                    })}
                                >
                                    Active
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="action-btn action-btn-green"
                                        onClick={() => setShowChannelEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Channel Confirmation Modal */}
            <Modal
                isOpen={showChannelDeleteModal && !!channelToDelete}
                onClose={() => setShowChannelDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete Channel Confirmation"
            >
                <p>Are you sure you want to delete the channel <span className="fw-700">{channelToDelete?.channel || 'N/A'}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button
                        type="button"
                        className="action-btn action-btn-green"
                        onClick={() => setShowChannelDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="action-btn action-btn-primary"
                        onClick={handleChannelDelete}
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            {/* Edit File Modal */}
            {showFileEditModal && editingFile && (
                <div className="modal">
                    <div className="modal-content view-modal-content modal-content-large">
                        <span className="modal-close" onClick={() => setShowFileEditModal(false)}>×</span>
                        <h3 className="mb-1rem">Edit Telegram File</h3>
                        <form onSubmit={handleFileUpdate}>
                            <div className="form-group">
                                <label htmlFor="fileName">Filename</label>
                                <input
                                    type="text"
                                    id="fileName"
                                    value={editingFile.filename || ''}
                                    onChange={(e) => setEditingFile({...editingFile, filename: e.target.value})}
                                    required
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fileSize">File Size</label>
                                <input
                                    type="text"
                                    id="fileSize"
                                    value={editingFile.file_size || ''}
                                    onChange={(e) => setEditingFile({...editingFile, file_size: e.target.value})}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fileDate">File Date</label>
                                <input
                                    type="text"
                                    id="fileDate"
                                    value={editingFile.file_date || ''}
                                    onChange={(e) => setEditingFile({...editingFile, file_date: e.target.value})}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fileId">File ID</label>
                                <input
                                    type="text"
                                    id="fileId"
                                    value={editingFile.file_id || ''}
                                    onChange={(e) => setEditingFile({...editingFile, file_id: e.target.value})}
                                    placeholder="N/A"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${editingFile.downloaded === 1 ? ' enabled' : ' disabled'}`}
                                    aria-pressed={editingFile.downloaded === 1}
                                    onClick={() => setEditingFile({
                                        ...editingFile,
                                        downloaded: editingFile.downloaded === 1 ? 0 : 1
                                    })}
                                >
                                    Downloaded
                                </button>
                            </div>
                            <div className="form-group checkbox-group">
                                <button
                                    type="button"
                                    className={`toggle-btn${editingFile.processed === 1 ? ' enabled' : ' disabled'}`}
                                    aria-pressed={editingFile.processed === 1}
                                    onClick={() => setEditingFile({
                                        ...editingFile,
                                        processed: editingFile.processed === 1 ? 0 : 1
                                    })}
                                >
                                    Processed
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="action-btn action-btn-green"
                                        onClick={() => setShowFileEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="action-btn action-btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete File Confirmation Modal */}
            <Modal
                isOpen={showFileDeleteModal && !!fileToDelete}
                onClose={() => setShowFileDeleteModal(false)}
                title="Confirm Deletion"
                ariaLabel="Delete File Confirmation"
            >
                <p>Are you sure you want to delete the file <span className="fw-700">{fileToDelete?.filename || 'N/A'}</span>? This action cannot be undone.</p>
                <div className="form-actions">
                    <button
                        type="button"
                        className="action-btn action-btn-green"
                        onClick={() => setShowFileDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="action-btn action-btn-primary"
                        onClick={handleFileDelete}
                    >
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

export default Telegram;