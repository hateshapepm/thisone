import React from 'react';
import {Edit, Check, Trash2} from 'lucide-react';

export const telegramChannelsColumns = [
    {
        Header: 'ID',
        accessor: 'id',
        Cell: ({value}) => <span>{value}</span>,
    },
    {
        Header: 'Channel',
        accessor: 'channel',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Channel ID',
        accessor: 'channel_id',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Access Hash',
        accessor: 'access_hash',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Title',
        accessor: 'title',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'URL',
        accessor: 'url',
        Cell: ({value}) => (
            value ? (
                <a href={value} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            ) : 'N/A'
        ),
    },
    {
        Header: 'Actions',
        Cell: ({
                   row,
                   openChannelEditModal,
                   loadTelegramChannels,
                   showNotification,
                   loadChannelMetrics,
                   openChannelDeleteModal,
                   channelCurrentPage,
                   channelPerPage,
                   channelSearch
               }) => (
            <div className="actions-cell">
                <button className="edit-btn"
                        onClick={() => openChannelEditModal(row.original)}
                        title="Edit channel">
                    <Edit size={14}/>
                </button>
                <button
                    className="activate-btn"
                    onClick={() => {
                        const updatedChannel = {
                            ...row.original,
                            active: row.original.active === 1 ? 0 : 1
                        };
                        fetch(`/api/sls/telegram-channels/${row.original.id}`, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(updatedChannel),
                        })
                            .then(response => {
                                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                                return response.json();
                            })
                            .then(result => {
                                if (result.success) {
                                    showNotification('Channel status updated successfully');
                                    loadTelegramChannels(channelCurrentPage, channelPerPage, channelSearch);
                                    loadChannelMetrics();
                                } else {
                                    showNotification(`Error: ${result.error || 'Unknown error'}`, true);
                                }
                            })
                            .catch(error => {
                                console.error('Error updating channel status:', error);
                                showNotification(`Error: ${error.message}`, true);
                            });
                    }}
                    title={row.original.active === 1 ? "Deactivate channel" : "Activate channel"}
                >
                    <Check size={14} className={row.original.active === 1 ? 'text-success' : 'text-muted'} />
                </button>
                <button className="delete-btn"
                        onClick={() => openChannelDeleteModal(row.original)}
                        title="Delete channel">
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
    },
];
