// src/common/components/Pagination.jsx
import React from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import '../../styles/components.css';

const Pagination = ({
                        currentPage,
                        totalPages,
                        totalItems,
                        perPage,
                        onPageChange,
                        onPerPageChange
                    }) => {
    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft size={14}/>
                Previous
            </button>

            <span className="page-info">
                Page {currentPage} of {totalPages || 1} ({totalItems} items)
            </span>

            <button
                className="pagination-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
                <ChevronRight size={14}/>
            </button>

            <div className="per-page-selector">
                <label htmlFor="perPageSelect">Per page:</label>
                <select
                    id="perPageSelect"
                    value={perPage}
                    onChange={(e) => onPerPageChange(parseInt(e.target.value))}
                    className="per-page-select"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
        </div>
    );
};

export default Pagination;