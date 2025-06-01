import React from 'react';
import { Clipboard, Edit, Trash2 } from 'lucide-react';
import ProgramWithLogo from '../components/ProgramWithLogo';

export const programCredentialsColumns = [
    {
        Header: 'Program',
        accessor: 'program',
        Cell: ({ row }) => (
            <ProgramWithLogo
                programName={row.original.program}
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
        Cell: ({ value, copyLoginInfo }) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button
                    className="copy-btn"
                    onClick={() => copyLoginInfo(value, '')}
                    title="Copy email"
                >
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Password',
        accessor: 'password',
        Cell: ({ value, copyLoginInfo }) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button
                    className="copy-btn"
                    onClick={() => copyLoginInfo('', value)}
                    title="Copy password"
                >
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
                        className="copy-btn mr-6"
                        onClick={() => copyLoginInfo(row.original.email, row.original.password)}
                        title="Copy login info"
                    >
                        <Clipboard size={14}/>
                    </button>
                    <button
                        className="edit-btn mr-6"
                        onClick={() => openEditModal(row.original)}
                        title="Edit credential"
                    >
                        <Edit size={14}/>
                    </button>
                    <button
                        className="delete-btn mr-6"
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