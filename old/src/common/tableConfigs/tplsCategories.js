import React from 'react';
import {Edit, Trash2, Eye} from 'lucide-react';

export const tplsCategoriesColumns = [
    {
        Header: 'CATEGORY',
        accessor: 'category',
        Cell: ({value}) => <span>{value}</span>,
    },
    {
        Header: 'COUNT',
        accessor: 'count',
        Cell: ({value}) => <span>{value || 0}</span>,
    },
    {
        Header: 'ACTIONS',
        Cell: ({row, openCategoryViewModal, openCategoryEditModal, openCategoryDeleteModal}) => (
            <div className="actions-cell">
                <button className="view-btn" onClick={() => openCategoryViewModal(row.original)}
                        title="View Category">
                    <Eye size={16}/>
                </button>
                <button className="edit-btn" onClick={() => openCategoryEditModal(row.original)}
                        title="Edit Category">
                    <Edit size={14}/>
                </button>
                <button className="delete-btn" onClick={() => openCategoryDeleteModal(row.original)}
                        title="Delete Category">
                    <Trash2 size={14}/>
                </button>
            </div>
        ),
    },
];
