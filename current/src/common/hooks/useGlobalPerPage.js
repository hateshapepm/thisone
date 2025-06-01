import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'globalPerPage';

export const useGlobalPerPage = () => {
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? Number(saved) : 10;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, perPage);
  }, [perPage]);

  return [perPage, setPerPage];
}; 