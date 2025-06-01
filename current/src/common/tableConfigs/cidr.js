import React from 'react';
import {Clipboard, Edit, Trash2, Eye} from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

export const cidrColumns = [
    {
        Header: 'Program',
        accessor: 'program_name',
        Cell: ({row}) => (
            <ProgramWithLogo
                programName={row.original.program_name}
                platformName={row.original.platform_name}
            />
        ),
    },
    {
        Header: 'CIDR',
        accessor: 'cidr',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value}</span>
                <button
                    className="copy-btn"
                    onClick={() => copyInfoClipboard(value)}
                    title="Copy CIDR value"
                >
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Type',
        accessor: 'isIPv4',
        Cell: ({value}) => value ? 'IPv4' : 'IPv6',
    },
    {
        Header: 'Scope',
        accessor: 'isInScope',
        Cell: ({value}) => (
            <span className={`status-badge ${value ? 'status-yes' : 'status-no'}`}>
                {value ? 'In Scope' : 'Out of Scope'}
            </span>
        ),
    },
    {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({row, openViewModal, openEditModal, openDeleteModal}) => (
            <div className="actions-cell">
                <button
                    className="view-btn"
                    title="View CIDR Details"
                    onClick={() => openViewModal(row.original)}
                >
                    <Eye size={14}/>
                </button>
                <button
                    className="edit-btn"
                    title="Edit CIDR"
                    onClick={() => openEditModal(row.original)}
                >
                    <Edit size={14}/>
                </button>
                <button
                    className="delete-btn"
                    title="Delete CIDR"
                    onClick={() => openDeleteModal(row.original)}
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
    },
];
