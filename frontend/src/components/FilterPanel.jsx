import React, { useState, useEffect } from 'react';
import { fetchFilterOptions } from '../services/api';
import '../styles/FilterPanel.css';
import RefreshIcon from '../icons/RefreshIcon';

const FilterPanel = ({ onFilter, onSort }) => {
    const [options, setOptions] = useState({
        regions: [],
        categories: [],
        tags: [],
        paymentMethods: []
    });

    const [filters, setFilters] = useState({
        customerRegion: '',
        gender: '',
        productCategory: '',
        tags: '',
        dateRange: ''
    });

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const data = await fetchFilterOptions();
                setOptions(data);
            } catch (err) {
                console.error("Failed to load filter options", err);
            }
        };
        loadOptions();
    }, []);

    const handleChange = (key, value) => {
        let newFilters = { ...filters, [key]: value };

        if (key === 'age') {
            if (value === '50+') {
                newFilters.minAge = 50;
                delete newFilters.maxAge;
            } else if (value.includes('-')) {
                const [min, max] = value.split('-');
                newFilters.minAge = min;
                newFilters.maxAge = max;
            } else {
                delete newFilters.minAge;
                delete newFilters.maxAge;
            }
        }

        setFilters(newFilters);

        const activeFilters = {};
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k] !== '' && k !== 'age') activeFilters[k] = newFilters[k];
        });

        if (newFilters.minAge) activeFilters.minAge = newFilters.minAge;
        if (newFilters.maxAge) activeFilters.maxAge = newFilters.maxAge;

        onFilter(activeFilters);
    };

    return (
        <div className="filter-panel-container">
            <div className="filters-left">
                <button className="refresh-btn" title="Reset Filters" onClick={() => window.location.reload()}>
                    <RefreshIcon />
                </button>

                <select className="filter-dropdown" onChange={(e) => handleChange('customerRegion', e.target.value)}>
                    <option value="">Customer Region</option>
                    {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <select className="filter-dropdown" onChange={(e) => handleChange('gender', e.target.value)}>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <select className="filter-dropdown" onChange={(e) => handleChange('age', e.target.value)}>
                    <option value="">Age Range</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-50">36-50</option>
                    <option value="50+">50+</option>
                </select>

                <select className="filter-dropdown" onChange={(e) => handleChange('productCategory', e.target.value)}>
                    <option value="">Product Category</option>
                    {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="filter-dropdown" onChange={(e) => handleChange('tags', e.target.value)}>
                    <option value="">Tags</option>
                    {options.tags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <input
                    type="date"
                    className="filter-date"
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    placeholder="Date"
                />
            </div >

            <div className="filters-right">
                <span className="sort-label">Sort by:</span>
                <select className="sort-dropdown" onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    onSort({ sortBy: field, sortOrder: order });
                }}>
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="customerName-asc">Customer Name (A-Z)</option>
                    <option value="customerName-desc">Customer Name (Z-A)</option>
                    <option value="quantity-desc">Quantity (High-Low)</option>
                    <option value="quantity-asc">Quantity (Low-High)</option>
                </select>
            </div>
        </div >
    );
};

export default FilterPanel;
