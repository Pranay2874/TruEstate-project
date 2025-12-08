import axios from 'axios';

// API base URL - uses environment variable for production, localhost for dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/transactions';

// fetching transactions with filters, pagination, sorting
export const fetchTransactions = async (params) => {
    try {
        const response = await axios.get(API_URL, { params });
        return response.data;
    } catch (err) {
        console.error('Error fetching sales data:', err);
        throw err;
    }
};

// fetching filter dropdown options (regions, categories, tags, payment methods)
export const fetchFilterOptions = async () => {
    try {
        const response = await axios.get(`${API_URL}/options`);
        return response.data;
    } catch (err) {
        console.error('Error fetching filter options:', err);
        throw err;
    }
};

// fetching employee performance data with aggregated stats
export const fetchEmployeePerformance = async (params) => {
    try {
        const response = await axios.get(`${API_URL}/employees`, { params });
        return response.data;
    } catch (err) {
        console.error('Error fetching employee performance:', err);
        throw err;
    }
};
