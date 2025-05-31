import React from 'react';
import {Edit, Trash2, Eye} from 'lucide-react';

export const tplsColumns = [
    {
        Header: 'CATEGORY',
        accessor: 'category',
        Cell: ({value}) => <span>{value || 'Uncategorized'}</span>,
    },
    {
        Header: 'DOMAIN',
        accessor: 'domain',
        Cell: ({value, row}) => (
            <a
                href={`${row.original.protocol || 'https'}://${value}${row.original.url_path || '/login'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="domain-link"
            >
                {value}
            </a>
        ),
    },
    {
        Header: 'INDICATORS',
        Cell: ({row}) => (
            <div className="indicators-row">
                <span
                    className={`status-badge ${row.original.is_high_value ? 'status-active' : 'status-inactive'}`}>
                    {row.original.is_high_value ? 'High' : 'Normal'}
                </span>
                <span
                    className={`status-badge ${row.original.is_twofa_required ? 'status-active' : 'status-inactive'}`}>
                    {row.original.is_twofa_required ? '2FA' : '2FA'}
                </span>
                <span className={`status-badge ${row.original.is_alive ? 'status-active' : 'status-inactive'}`}>
                    {row.original.is_alive ? 'Active' : 'Inactive'}
                </span>
            </div>
        ),
    },
    {
        Header: 'NOTES',
        accessor: 'notes',
        Cell: ({value}) => <span>{value || ''}</span>,
    },
    {
        Header: 'ACTIONS',
        Cell: ({row, openTplViewModal, openTplEditModal, openTplDeleteModal}) => (
            <div className="actions-cell">
                <button className="view-btn" onClick={() => openTplViewModal(row.original)} title="View TPLS">
                    <Eye size={16}/>
                </button>
                <button className="edit-btn" onClick={() => openTplEditModal(row.original)} title="Edit TPLS">
                    <Edit size={14}/>
                </button>
                <button className="delete-btn" onClick={() => openTplDeleteModal(row.original)}
                        title="Delete TPLS">
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
    },
];
