import React from 'react';
import Pagination from './Pagination';
import '../../styles/Dashboard.css';
import { usePagination } from '../../context/PaginationContext';

const PaginationBar = () => {
  const { pagination } = usePagination();
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="global-pagination-bar">
      <Pagination {...pagination} />
    </div>
  );
};

export default PaginationBar; 