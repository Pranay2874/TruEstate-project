import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchTransactions, fetchFilterOptions } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsRow from './components/StatsRow';
import FilterPanel from './components/FilterPanel';
import TransactionTable from './components/TransactionTable';
import Pagination from './components/Pagination';

function App() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sortBy: 'date', sortOrder: 'desc' });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        ...filters
      };
      const result = await fetchTransactions(params);
      setData(result.data);
      setPagination(result.pagination);

      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.page, search, filters, sort]);

  const handleSearch = React.useCallback((query) => {
    setSearch(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = React.useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSortChange = React.useCallback((newSort) => {
    setSort(newSort);
  }, []);

  const handlePageChange = React.useCallback((newPage) => {
    console.log('App: Setting page to', newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header user="Pranay Pillutla" onSearch={handleSearch} />
        <div className="content-wrapper">
          <h1 className="page-title">Sales Management System</h1>

          <StatsRow stats={stats} />

          <FilterPanel
            onFilter={handleFilterChange}
            onSort={handleSortChange}
          />

          <TransactionTable
            data={data}
            loading={loading}
          />

          <Pagination
            current={pagination.page}
            total={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
