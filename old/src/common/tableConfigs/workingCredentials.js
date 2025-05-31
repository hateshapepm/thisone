import React from 'react';
import { Clipboard, Edit, Trash2 } from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

export const workingCredentialsColumns = [
    {
        Header: 'Program',
        accessor: 'program',
        Cell: ({ row }) => (
            <ProgramWithLogo
                programName={row.original.program || 'N/A'}
                platformName={row.original.platform_name}
            />
        ),
    },
    {
        Header: 'Email Apex',
        accessor: 'email_apex',
        Cell: ({ value }) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Login Domain',
        accessor: 'login_domain',
        Cell: ({ value }) => <span>{value || 'N/A'}</span>,
    },
    {
        Header: 'Email Address',
        accessor: 'email',
        Cell: ({ value, copyToClipboard }) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(value)} title="Copy email">
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Password',
        accessor: 'password',
        Cell: ({ value, copyToClipboard }) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(value)} title="Copy password">
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Actions',
        Cell: ({ row, copyLoginInfo, openEditModal, openDeleteModal }) => {
            return (
                <div className="actions-cell">
                    <button
                        className="action-btn"
                        onClick={() => copyLoginInfo(row.original.email, row.original.password)}
                        title="Copy login info"
                    >
                        <Clipboard size={14}/>
                    </button>
                    <button
                        className="edit-btn"
                        onClick={() => openEditModal(row.original)}
                        title="Edit credential"
                    >
                        <Edit size={14}/>
                    </button>
                    <button
                        className="delete-btn"
                        onClick={() => openDeleteModal(row.original)}
                        title="Delete credential"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>
            );
        },
    },
];

export const workingCredentialsColumnsWithBulk = (bulkMoveMode, selectedRows, credentials, setSelectedRows) => [
    {
        id: 'selection',
        Header: () => (
            <div className="w-40 flex justify-center">
                <input
                    type="checkbox"
                    checked={selectedRows.length === credentials.length && credentials.length > 0}
                    onChange={e => {
                        if (e.target.checked) {
                            setSelectedRows(credentials.map(row => row.working_credentials_id));
                        } else {
                            setSelectedRows([]);
                        }
                    }}
                />
            </div>
        ),
        Cell: ({ row }) => (
            <div className="w-40 flex justify-center">
                <input
                    type="checkbox"
                    checked={selectedRows.includes(row.original.working_credentials_id)}
                    onChange={e => {
                        if (e.target.checked) {
                            setSelectedRows(prev => [...prev, row.original.working_credentials_id]);
                        } else {
                            setSelectedRows(prev => prev.filter(id => id !== row.original.working_credentials_id));
                        }
                    }}
                />
            </div>
        ),
        width: 40,
    },
    ...workingCredentialsColumns
];
