import React from 'react';
import {Edit, Check, Trash2} from 'lucide-react';

export const telegramFilesColumns = [
    {
        Header: 'ID',
        accessor: 'id',
        Cell: ({value}) => <span>{value}</span>,
    },
    {
        Header: 'File ID',
        accessor: 'file_id',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Filename',
        accessor: 'filename',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Size',
        accessor: 'file_size',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Downloaded',
        accessor: 'downloaded',
        Cell: ({value}) => (
            <span className={`status-badge status-${value ? 'yes' : 'no'}`}>
                {value ? 'Yes' : 'No'}
            </span>
        ),
    },
    {
        Header: 'Processed',
        accessor: 'processed',
        Cell: ({value}) => (
            <span className={`status-badge status-${value ? 'yes' : 'no'}`}>
                {value ? 'Yes' : 'No'}
            </span>
        ),
    },
    {
        Header: 'Date',
        accessor: 'file_date',
        Cell: ({value}) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Actions',
        Cell: ({
                   row,
                   openFileEditModal,
                   loadTelegramFiles,
                   showNotification,
                   loadFileMetrics,
                   openFileDeleteModal,
                   fileCurrentPage,
                   filePerPage,
                   fileSearch
               }) => (
            <div className="actions-cell">
                <button className="edit-btn"
                        onClick={() => openFileEditModal(row.original)}
                        title="Edit file">
                    <Edit size={14}/>
                </button>
                <button
                    className="activate-btn"
                    onClick={() => {
                        const updatedFile = {
                            ...row.original,
                            processed: row.original.processed ? 0 : 1
                        };
                        fetch(`/api/sls/telegram-files/${row.original.id}`, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(updatedFile),
                        })
                            .then(response => {
                                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                                return response.json();
                            })
                            .then(result => {
                                if (result.success) {
                                    showNotification('File status updated successfully');
                                    loadTelegramFiles(fileCurrentPage, filePerPage, fileSearch);
                                    loadFileMetrics();
                                } else {
                                    showNotification(`Error: ${result.error || 'Unknown error'}`, true);
                                }
                            })
                            .catch(error => {
                                console.error('Error updating file status:', error);
                                showNotification(`Error: ${error.message}`, true);
                            });
                    }}
                    title="Toggle processed status"
                >
                    <Check size={14} className={row.original.processed ? 'text-success' : 'text-muted'} />
                </button>
                <button className="delete-btn"
                        onClick={() => openFileDeleteModal(row.original)}
                        title="Delete file">
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
    },
];
