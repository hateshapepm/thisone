import React from 'react';
import {Edit, Trash2, Eye} from 'lucide-react';

export const submittedCredentialsColumns = [
    {
        Header: 'Email',
        accessor: 'email'
    },
    {
        Header: 'Program',
        accessor: 'program'
    },
    {
        Header: 'Login Domain',
        accessor: 'login_domain'
    },
    {
        Header: 'Platform',
        accessor: 'platform_name'
    },
    {
        Header: 'Submitted',
        accessor: 'submitted'
    },
    {
        Header: 'Accepted',
        accessor: 'accepted'
    },
    {
        Header: 'Amount Paid',
        accessor: 'amount_paid'
    },
    {
        Header: 'Notes',
        accessor: 'notes'
    },
    {
        Header: 'Created',
        accessor: 'created_at'
    },
    {
        Header: 'Actions',
        Cell: ({row, handleEdit, handleDelete, handleView}) => (
            <div className="actions-cell">
                <button className="edit-btn" onClick={() => handleEdit(row.original)} title="Edit credential">
                    <Edit size={14}/>
                </button>
                <button className="delete-btn" onClick={() => handleDelete(row.original)} title="Delete credential">
                    <Trash2 size={14}/>
                </button>
                <button className="view-btn" onClick={() => handleView(row.original)} title="View credential">
                    <Eye size={14}/>
                </button>
            </div>
        ),
    },
];
