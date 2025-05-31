import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export function useTableData(fetchFn, { page, perPage, search, category, refreshFlag }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchFn(page, perPage, search, category)
      .then(res => {
        setData(res.data || []);
        setTotalPages(res.pagination?.total_pages || 1);
        setTotalItems(res.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [fetchFn, page, perPage, search, category, refreshFlag]);

  return { data, loading, totalPages, totalItems };
}

useTableData.propTypes = {
  fetchFn: PropTypes.func.isRequired,
  config: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
    search: PropTypes.string,
    category: PropTypes.string,
  })
}; 