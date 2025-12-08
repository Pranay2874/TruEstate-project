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
  // view state - customer or employee
  const [activeView, setActiveView] = useState('customer');

  // state management for sales data and UI
  const [salesData, setSalesData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [stats, setStats] = useState({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  const [isFetching, setIsFetching] = useState(false);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sortBy: 'date', sortOrder: 'desc' });

  // loading customer data from API
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
      // no stats for customer view
      setStats({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // loading employee performance data
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
      // stats for employee view
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // reload data based on active view
  useEffect(() => {
    if (activeView === 'customer') {
      loadCustomerData();
    } else {
      loadEmployeeData();
    }
  }, [pagination.page, search, filters, sort, activeView]);

  // handle view change
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

          <ViewToggle activeView={activeView} onViewChange={handleViewChange} />

          {/* Show stats only in employee view */}
          {activeView === 'employee' && <StatsRow stats={stats} />}

          {/* Show filters only in customer view */}
          {activeView === 'customer' && (
            <FilterPanel
              onFilter={handleFilterChange}
              onSort={handleSortChange}
            />
          )}

          {/* Conditional table rendering */}
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
