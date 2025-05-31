import React, {useState, useMemo, useRef, useEffect} from 'react';
import Pagination from './Pagination';
import '../../styles/Dashboard.css';
import {ClipboardCheck} from 'lucide-react';

const rowHeight = 40; // px

const DataTable = ({
                       columns,
                       data,
                       currentPage,
                       totalPages,
                       totalItems,
                       perPage,
                       onPageChange,
                       onPerPageChange = () => {},
                       loading,
                       noDataText = 'No data available',
                       loadingText = 'Loading data...',
                       ...rest // Forward all extra props (handlers, utilities)
                   }) => {
    // Debug logging
    console.log('DataTable render: data.length =', data.length, 'sortedData.length =', (data && data.length ? data.length : 0), 'data =', data);

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const tableContentRef = useRef();
    const wrapperRef = useRef();

    // Sort data client-side
    const sortedData = useMemo(() => {
        if (!sortColumn) return data;
        const col = columns.find(c => c.accessor === sortColumn);
        if (!col) return data;
        const sorted = [...data].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return aValue - bValue;
            }
            return String(aValue).localeCompare(String(bValue));
        });
        return sortDirection === 'asc' ? sorted : sorted.reverse();
    }, [data, sortColumn, sortDirection, columns]);

    const handleSort = (accessor) => {
        if (sortColumn === accessor) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(accessor);
            setSortDirection('asc');
        }
    };

    return (
        <>
            <div className="table-wrapper table-responsive" ref={wrapperRef}>
                <div className="table-content" ref={tableContentRef}>
                    <table id="tableTable" className="data-table">
                        <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`${column.accessor}-column truncate-text glowPulse${column.width ? ` w-${column.width}` : ''} uppercase`}
                                    aria-sort={sortColumn === column.accessor ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    <button
                                        type="button"
                                        className="sort-btn uppercase"
                                        onClick={() => handleSort(column.accessor)}
                                        aria-label={`Sort by ${typeof column.Header === 'string' ? column.Header : ''}`}
                                    >
                                        {typeof column.Header === 'string' ? column.Header.toUpperCase() : column.Header}
                                        {sortColumn === column.accessor && (
                                            <span className="sort-indicator ml-4">
                                                {sortDirection === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </button>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="loading-indicator">
                                    {loadingText}
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="no-data">
                                    {noDataText}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    <tr>
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`${column.accessor}-column truncate-text glowPulse`}
                                            >
                                                {column.Cell
                                                    ? column.Cell({
                                                        value: row[column.accessor] !== undefined ? row[column.accessor] : '',
                                                        row: {original: row},
                                                        ...rest // Pass all extra props to Cell
                                                    })
                                                    : row[column.accessor] !== undefined ? row[column.accessor] : 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    {row.expandedContent && (
                                        <tr className="expanded-row">
                                            <td colSpan={columns.length}>{row.expandedContent}</td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DataTable;