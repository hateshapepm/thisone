import React from 'react';
import {Edit, Trash2, Eye, Clipboard} from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

export const programColumns = [
    {
        Header: 'Program',
        accessor: 'program',
        Cell: ({row}) => (
            <ProgramWithLogo
                programName={row.original.program}
                platformName={row.original.platform_name}
            />
        )
    },
    {
        Header: 'Status',
        accessor: 'is_active',
        Cell: ({value}) => (
            <span className={`status-badge status-${value === 1 || value === true ? 'active' : 'inactive'}`}>
                {value === 1 || value === true ? 'Active' : 'Inactive'}
            </span>
        )
    },
    {
        Header: 'Domains',
        accessor: 'domains',
        Cell: ({value}) => value || 0
    },
    {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({row, openViewModal, openEditModal, openDeleteModal}) => (
            <div className="actions-cell">
                <button
                    className="view-btn"
                    onClick={() => openViewModal(row.original)}
                    title="View program"
                >
                    <Eye size={14}/>
                </button>
                <button
                    className="edit-btn"
                    onClick={() => openEditModal(row.original)}
                    title="Edit program"
                >
                    <Edit size={14}/>
                </button>
                <button
                    className="delete-btn"
                    onClick={() => openDeleteModal(row.original)}
                    title="Delete program"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        )
    }
];

export const apexDomainColumns = [
    {
        Header: 'Program',
        accessor: 'program_name',
        Cell: ({row}) => (
            <ProgramWithLogo
                programName={row.original.program_name || 'N/A'}
                platformName={row.original.platform_name}
            />
        )
    },
    {
        Header: 'ID',
        accessor: 'id',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value}</span>
                <button className="copy-btn"
                        onClick={() => copyInfoClipboard(value)}
                        title="Copy domain id">
                    <Clipboard size={14}/>
                </button>
            </div>
        )
    },
    {
        Header: 'Apex Domain',
        accessor: 'apex_domain',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value}</span>
                <button className="copy-btn"
                        onClick={() => copyInfoClipboard(value)}
                        title="Copy apex domain">
                    <Clipboard size={14}/>
                </button>
            </div>
        )
    },
    {
        Header: 'Status',
        accessor: 'is_active',
        Cell: ({value}) => (
            <span className={`status-badge status-${value ? 'active' : 'inactive'}`}>
            {value ? 'Active' : 'Inactive'}
        </span>
        )
    },
    {
        Header: 'Actions',
        accessor: 'apex_actions',
        Cell: ({row, openEditApexModal, openDeleteApexModal}) => (
            <div className="actions-cell">
                <button
                    className="edit-btn"
                    onClick={() => openEditApexModal(row.original)}
                    title="Edit apex domain"
                >
                    <Edit size={14}/>
                </button>
                <button
                    className="delete-btn"
                    onClick={() => openDeleteApexModal(row.original)}
                    title="Delete apex domain"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        )
    }
];
