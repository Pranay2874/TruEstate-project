require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Transaction = require('../models/Transaction');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/retail_sales_db';
const DATA_FILE = path.join(__dirname, '../../data/truestate_assignment_dataset.csv'); // Adjust path as needed

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        if (!fs.existsSync(DATA_FILE)) {
            console.error(`Data file not found at ${DATA_FILE}`);
            console.log('Please place "sales_data.csv" in the "backend/data" directory.');
            process.exit(1);
        }

        console.log('Clearing existing data...');
        await Transaction.deleteMany({});

        console.log('Reading CSV...');
        const transactions = [];

        fs.createReadStream(DATA_FILE)
            .pipe(csv())
            .on('data', (row) => {

                let tagsArray = [];
                if (row['Tags']) {
                    tagsArray = row['Tags'].split(',').map(t => t.trim().toLowerCase());
                }

                const parseDate = (dateStr) => {
                    const d = new Date(dateStr);
                    return isNaN(d) ? new Date() : d;
                };

                const transaction = {
                    transactionId: row['Transaction ID'],
                    customerId: row['Customer ID'],
                    customerName: row['Customer Name'],
                    phoneNumber: row['Phone Number'],
                    gender: row['Gender'],
                    age: parseInt(row['Age']) || 0,
                    customerRegion: row['Customer Region'],
                    customerType: row['Customer Type'],
                    productId: row['Product ID'],
                    productName: row['Product Name'],
                    brand: row['Brand'],
                    productCategory: row['Product Category'],
                    tags: tagsArray,
                    quantity: parseInt(row['Quantity']) || 0,
                    pricePerUnit: parseFloat(row['Price per Unit']) || 0.0,
                    discountPercentage: parseFloat(row['Discount Percentage']) || 0.0,
                    totalAmount: parseFloat(row['Total Amount']) || 0.0,
                    finalAmount: parseFloat(row['Final Amount']) || 0.0,
                    date: parseDate(row['Date']),
                    paymentMethod: row['Payment Method'],
                    orderStatus: row['Order Status'],
                    deliveryType: row['Delivery Type'],
                    storeId: row['Store ID'],
                    storeLocation: row['Store Location'],
                    salespersonId: row['Salesperson ID'],
                    employeeName: row['Employee Name']
                };

                transactions.push(transaction);

                if (transactions.length >= 5000) {

                }
            })
            .on('end', async () => {
                console.log(`Parsed ${transactions.length} records. Inserting...`);
                try {
                    const chunkSize = 5000;
                    for (let i = 0; i < transactions.length; i += chunkSize) {
                        const chunk = transactions.slice(i, i + chunkSize);
                        await Transaction.insertMany(chunk);
                        console.log(`Inserted ${Math.min(i + chunkSize, transactions.length)} / ${transactions.length}`);
                    }
                    console.log('Data Import Success');
                    process.exit();
                } catch (err) {
                    console.error('Error inserting data:', err);
                    process.exit(1);
                }
            });

    } catch (error) {
        console.error('Error with DB connection:', error);
        process.exit(1);
    }
};

importData();
