import React from 'react';
import '../styles/StatsRow.css';

const StatsRow = ({ stats }) => {
    // Stats now come from the backend, representing the *entire* filtered dataset
    const { totalUnits, totalAmount, totalDiscount } = stats || { totalUnits: 0, totalAmount: 0, totalDiscount: 0 };

    return (
        <div className="stats-row">
            <div className="stat-card">
                <div className="stat-label">Total units sold ⓘ</div>
                <div className="stat-value">{totalUnits.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Total Amount ⓘ</div>
                <div className="stat-value">₹{totalAmount.toLocaleString()}</div>
            </div>
            <div className="stat-card highlight">
                <div className="stat-label">Total Discount ⓘ</div>
                <div className="stat-value">₹{totalDiscount.toLocaleString()}</div>
            </div>
        </div>
    );
};

export default StatsRow;
