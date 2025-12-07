import React from 'react';
import { formatCurrency } from '../utils/helpers';
import InfoIcon from '../icons/InfoIcon';
import '../styles/StatsRow.css';

const StatsRow = ({ stats }) => {
    const { totalUnits, totalAmount, totalDiscount } = stats || { totalUnits: 0, totalAmount: 0, totalDiscount: 0 };

    return (
        <div className="stats-row">
            <div className="stat-card">
                <div className="stat-label">Total units sold <InfoIcon /></div>
                <div className="stat-value">{totalUnits.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Total Amount <InfoIcon /></div>
                <div className="stat-value">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="stat-card highlight">
                <div className="stat-label">Total Discount <InfoIcon /></div>
                <div className="stat-value">{formatCurrency(totalDiscount)}</div>
            </div>
        </div>
    );
};

export default StatsRow;
