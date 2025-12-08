import React from 'react';
import '../styles/ViewToggle.css';

const ViewToggle = ({ activeView, onViewChange }) => {
    return (
        <div className="view-toggle-container">
            <button
                className={`view-toggle-btn ${activeView === 'customer' ? 'active' : ''}`}
                onClick={() => onViewChange('customer')}
            >
                Customer Data
            </button>
            <button
                className={`view-toggle-btn ${activeView === 'employee' ? 'active' : ''}`}
                onClick={() => onViewChange('employee')}
            >
                Employee Data
            </button>
        </div>
    );
};

export default ViewToggle;
