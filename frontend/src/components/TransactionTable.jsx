import { formatDate, formatCurrency } from '../utils/helpers';
import '../styles/TransactionTable.css';

const TransactionTable = ({ data, loading }) => {
    if (loading) return <div className="loading">Loading sales data...</div>;
    if (!data || data.length === 0) return <div className="no-results">No transactions found</div>;

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
                    {data.map((transaction) => (
                        <tr key={transaction._id}>
                            <td className="text-secondary">{transaction.transactionId || '---'}</td>
                            <td>{formatDate(transaction.date)}</td>
                            <td className="font-medium">{transaction.customerId}</td>
                            <td className="font-medium text-dark">{transaction.customerName}</td>
                            <td>
                                <div className="phone-cell">
                                    {transaction.phoneNumber}
                                </div>
                            </td>
                            <td>
                                <div className="gender-cell" style={{ textTransform: 'capitalize' }}>
                                    {transaction.gender}
                                </div>
                            </td>
                            <td>{transaction.age}</td>
                            <td className="font-medium text-dark">{transaction.productCategory}</td>
                            <td className="text-center bold">{transaction.quantity}</td>
                            <td className="font-medium">{formatCurrency(transaction.totalAmount)}</td>

                            <td className="font-medium text-dark">{transaction.customerRegion}</td>
                            <td>{transaction.productId || '---'}</td>
                            <td className="font-medium text-dark">{transaction.employeeName || 'Unknown'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
