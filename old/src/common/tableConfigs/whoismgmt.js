import React from 'react';
import {Clipboard, Edit, Trash2} from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

// Helper function to singularize type names
export const singularizeType = (type) => {
    if (type === 'emails') return 'email';
    if (type === 'addresses') return 'address';
    if (type === 'phones') return 'phone';
    if (type === 'nameservers') return 'nameserver';
    if (type === 'names') return 'name';
    if (type === 'orgs') return 'organization';
    return type.slice(0, -1);
};

export const whoisMgmtColumns = (expandedRows) => [
    {
        Header: 'Program',
        accessor: 'program',
        width: 150,
        Cell: ({row}) => {
            if (row.original.isSectionHeader) return <span className="fw-700">Type</span>;
            return (
                <div className="nowrap ellipsis pl-0">
                    {row.original.type === 'orgs' ? (
                        <ProgramWithLogo
                            programName={row.original.program || 'Unknown Program'}
                            platformName={row.original.platform_name || 'n/a'}
                            showCopyButton={true}
                        />
                    ) : (
                        singularizeType(row.original.type)
                    )}
                </div>
            );
        }
    },
    {
        Header: expandedRows && Object.values(expandedRows).some(Boolean) ? 'Value' : 'Org',
        accessor: 'value',
        Cell: ({row, toggleRow, copyInfoClipboard}) => {
            if (row.original.isSectionHeader) return null;
            const value = row.original.value || '';
            const isOrg = row.original.type === 'orgs';
            return (
                <div className="copy-cell pl-0">
                    {isOrg && (
                        <button
                            className="expand-btn mr-8 expand-btn-blue"
                            onClick={() => toggleRow(row.original.id)}
                            title={expandedRows[row.original.id] ? 'Collapse' : 'Expand'}
                            tabIndex={0}
                            aria-label={expandedRows[row.original.id] ? 'Collapse' : 'Expand'}
                        >
                            {expandedRows[row.original.id] ? '-' : '+'}
                        </button>
                    )}
                    <span className="nowrap ellipsis max-w-30">{value}</span>
                    {value && (
                        <button
                            className="copy-btn"
                            onClick={() => copyInfoClipboard(value)}
                            title="Copy value"
                            tabIndex={0}
                            aria-label="Copy value"
                        >
                            <Clipboard size={14}/>
                        </button>
                    )}
                </div>
            );
        }
    },
    {
        Header: 'Actions',
        accessor: 'actions',
        width: 100,
        Cell: ({row, openEditModal, openDeleteModal}) => {
            if (row.original.isSectionHeader) return null;
            return (
                <div className="actions-cell">
                    <button
                        className="edit-btn"
                        title={`Edit ${row.original.type === 'orgs' ? 'Organization' : row.original.type.slice(0, -1)}`}
                        onClick={() => openEditModal(row.original)}
                        tabIndex={0}
                        aria-label="Edit"
                    >
                        <Edit size={14}/>
                    </button>
                    <button
                        className="delete-btn"
                        title={`Delete ${row.original.type === 'orgs' ? 'Organization' : row.original.type.slice(0, -1)}`}
                        onClick={() => openDeleteModal(row.original)}
                        tabIndex={0}
                        aria-label="Delete"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>
            );
        }
    }
];
