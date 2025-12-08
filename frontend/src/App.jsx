import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchTransactions, fetchEmployeePerformance } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsRow from './components/StatsRow';
import FilterPanel from './components/FilterPanel';
import TransactionTable from './components/TransactionTable';
import EmployeeTable from './components/EmployeeTable';
import Pagination from './components/Pagination';
import ViewToggle from './components/ViewToggle';

function App() {
  const [activeView, setActiveView] = useState('customer');

  const [salesData, setSalesData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [stats, setStats] = useState({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  const [isFetching, setIsFetching] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sortBy: 'date', sortOrder: 'desc' });

  const loadCustomerData = async () => {
    setIsFetching(true);
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
      setSalesData(result.data);
      setPagination(result.pagination);
      setStats({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const loadEmployeeData = async () => {
    setIsFetching(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search
      };
      const result = await fetchEmployeePerformance(params);
      setEmployeeData(result.data);
      setPagination(result.pagination);
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (activeView === 'customer') {
      loadCustomerData();
    } else {
      loadEmployeeData();
    }
  }, [pagination.page, search, filters, sort, activeView]);

  const handleViewChange = (newView) => {
    setActiveView(newView);
    setSearch('');
    setFilters({});
    setPagination({ page: 1, totalPages: 1, limit: 10 });
  };

  const handleSearch = React.useCallback((query) => {
    setSearch(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = React.useCallback((newFilters) => {
    setFilters(newFilters);
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

          <ViewToggle activeView={activeView} onViewChange={handleViewChange} />

          {activeView === 'employee' && <StatsRow stats={stats} />}

          {activeView === 'customer' && (
            <FilterPanel
              onFilter={handleFilterChange}
              onSort={handleSortChange}
            />
          )}

          {activeView === 'customer' ? (
            <TransactionTable
              data={salesData}
              loading={isFetching}
            />
          ) : (
            <EmployeeTable
              data={employeeData}
              loading={isFetching}
            />
          )}

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
