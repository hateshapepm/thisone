import React from 'react';
import {Clipboard, Edit, Trash2} from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

export const possibleApexColumns = [
    {
        Header: 'ID',
        accessor: 'id',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button className="copy-btn" onClick={() => copyInfoClipboard(value || '')} title="Copy domain id">
                    <Clipboard size={14}/>
                </button>
            </div>
        )
    },
    {
        Header: 'Program',
        accessor: 'program_name',
        Cell: ({row}) => (
            <ProgramWithLogo
                programName={row.original.program_name || 'Unknown'}
                platformName={row.original.platform_name || 'manual'}
            />
        )
    },
    {
        Header: 'Apex Domain',
        accessor: 'apex_domain',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button className="copy-btn" onClick={() => copyInfoClipboard(value || '')} title="Copy apex domain">
                    <Clipboard size={14}/>
                </button>
            </div>
        )
    },
    {
        Header: 'Status',
        accessor: 'status',
        Cell: ({value}) => (
            <span
                className={`status-badge status-${value ? 'active' : 'inactive'}`}>{value ? 'Confirmed' : 'Possible'}</span>
        )
    },
    {
        Header: 'Viewed',
        accessor: 'viewed',
        Cell: ({value}) => (
            <span
                className={`status-badge status-${value ? 'active' : 'inactive'}`}>{value ? 'Viewed' : 'Unviewed'}</span>
        )
    },
    {
        Header: 'Actions',
        accessor: 'actions',
        width: 100,
        Cell: ({row, openEditApexModal, openDeleteApexModal}) => (
            <div className="actions-cell">
                <button className="edit-btn" title="Edit apex domain" onClick={() => openEditApexModal(row.original)}>
                    <Edit size={14}/>
                </button>
                <button className="delete-btn" title="Delete apex domain"
                        onClick={() => openDeleteApexModal(row.original)}>
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
        disableSortBy: true
    }
];
