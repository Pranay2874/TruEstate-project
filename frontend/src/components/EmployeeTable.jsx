import React from 'react';
import { formatCurrency } from '../utils/helpers';
import '../styles/EmployeeTable.css';

const EmployeeTable = ({ data, loading }) => {
    if (loading) return <div className="loading">Loading employee data...</div>;
    if (!data || data.length === 0) return <div className="no-results">No employees found</div>;

    return (
        <div className="table-container">
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Total Units Sold</th>
                        <th>Total Amount</th>
                        <th>Total Discount</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((employee) => (
                        <tr key={employee.employeeId}>
                            <td className="font-medium text-dark">{employee.employeeName}</td>
                            <td className="text-center bold">{employee.totalUnits.toLocaleString()}</td>
                            <td className="font-medium">{formatCurrency(employee.totalAmount)}</td>
                            <td className="font-medium">{formatCurrency(employee.totalDiscount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;
