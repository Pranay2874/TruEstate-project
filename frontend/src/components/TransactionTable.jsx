import React from 'react';
import '../styles/TransactionTable.css';

const TransactionTable = ({ data, loading }) => {
    if (loading) return <div className="loading">Loading...</div>;
    if (!data || data.length === 0) return <div className="no-results">No search results found</div>;

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <div className="table-container">
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Date</th>
                        <th>Customer ID</th>
                        <th>Customer Name</th>
                        <th>Phone Number</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>Product Category</th>
                        <th>Quantity</th>
                        <th>Total Amount</th>
                        <th>Customer Region</th>
                        <th>Product ID</th>
                        <th>Employee Name</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item._id}>
                            <td className="text-secondary">{item.transactionId || '1234567'}</td>
                            <td>{formatDate(item.date)}</td>
                            <td className="font-medium">{item.customerId}</td>
                            <td className="font-medium text-dark">{item.customerName}</td>
                            <td>
                                <div className="phone-cell">
                                    {item.phoneNumber}
                                    <span className="copy-icon" title="Copy">❐</span>
                                </div>
                            </td>
                            <td>{item.gender}</td>
                            <td>{item.age}</td>
                            <td className="font-medium text-dark">{item.productCategory}</td>
                            <td className="text-center bold">{item.quantity.toString().padStart(2, '0')}</td>
                            <td className="font-medium">₹ {item.totalAmount.toLocaleString()}</td>

                            {/* Extra columns from 'Full table view' */}
                            <td className="font-medium text-dark">{item.customerRegion}</td>
                            <td>{item.productId || 'PROD0001'}</td>
                            <td className="font-medium text-dark">{item.employeeName || 'Harsh Agrawal'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
