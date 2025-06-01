import React, { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

export const usePagination = () => useContext(PaginationContext);

export const PaginationProvider = ({ children }) => {
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 25,
    onPageChange: () => {},
    onPerPageChange: () => {},
  });

  return (
    <PaginationContext.Provider value={{ pagination, setPagination }}>
      {children}
    </PaginationContext.Provider>
  );
}; 