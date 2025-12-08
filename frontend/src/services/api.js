import axios from 'axios';

// API base URL - pointing to deployed render backend
const API_URL = 'https://truestate-project-zled.onrender.com/api/transactions';

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
