import { formatDate, formatCurrency } from '../utils/helpers';
import '../styles/TransactionTable.css';

const TransactionTable = ({ data, loading }) => {
    if (loading) return <div className="loading">Loading...</div>;
    if (!data || data.length === 0) return <div className="no-results">No search results found</div>;

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
                            <td className="text-secondary">{item.transactionId || '---'}</td>
                            <td>{formatDate(item.date)}</td>
                            <td className="font-medium">{item.customerId}</td>
                            <td className="font-medium text-dark">{item.customerName}</td>
                            <td>
                                <div className="phone-cell">
                                    {item.phoneNumber}
                                </div>
                            </td>
                            <td>{item.gender}</td>
                            <td>{item.age}</td>
                            <td className="font-medium text-dark">{item.productCategory}</td>
                            <td className="text-center bold">{item.quantity}</td>
                            <td className="font-medium">{formatCurrency(item.totalAmount)}</td>

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
