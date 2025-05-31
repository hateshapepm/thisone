import React from 'react';
import {Clipboard, Edit, Trash2, Eye} from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

export const asnColumns = [
    {
        Header: 'Program',
        accessor: 'program_name',
        Cell: ({row}) => (
            <ProgramWithLogo
                programName={row.original.program_name}
                platformName={row.original.platform_name || 'manual'}
            />
        ),
    },
    {
        Header: 'ASN',
        accessor: 'asn',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value}</span>
                <button
                    className="copy-btn"
                    onClick={() => copyInfoClipboard(value)}
                    title="Copy ASN"
                >
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Names',
        accessor: 'names',
        Cell: ({value, copyInfoClipboard}) => (
            <div className="copy-cell">
                <span>{value.length > 0 ? value.join(', ') : 'N/A'}</span>
                <button
                    className="copy-btn"
                    onClick={() => copyInfoClipboard(value)}
                    title="Copy ASN Name"
                >
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Countries',
        accessor: 'countries',
        Cell: ({value}) => value.length > 0 ? value.join(', ') : 'N/A',
    },
    {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({row, openViewModal, openEditModal, openDeleteModal}) => (
            <div className="actions-cell">
                <button
                    className="view-btn"
                    onClick={() => openViewModal(row.original)}
                    title="View ASN Details"
                >
                    <Eye size={14}/>
                </button>
                <button
                    className="edit-btn"
                    onClick={() => openEditModal(row.original)}
                    title="Edit ASN"
                >
                    <Edit size={14}/>
                </button>
                <button
                    className="delete-btn"
                    onClick={() => openDeleteModal(row.original)}
                    title="Delete ASN"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
    },
];

