// formatting date to DD-MM-YYYY format (indian date format)
export const formatDate = (dateInput) => {
    if (!dateInput) return '-';

    const d = new Date(dateInput);

    if (isNaN(d.getTime())) return 'Invalid Date';

    // manually building date string instead of using toLocaleDateString
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

// formatting currency in indian rupees
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';

    // using Intl.NumberFormat for proper indian currency formatting
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
