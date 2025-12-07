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
                // Transform row if keys don't match exactly or need parsing
                // Assuming CSV headers match schema keys or mapping is needed
                // Simple mapping example based on provided fields:

                const transaction = {
                    transactionId: row['Transaction ID'],
                    customerId: row['Customer ID'],
                    customerName: row['Customer Name'],
                    phoneNumber: row['Phone Number'],
                    gender: row['Gender'],
                    age: Number(row['Age']),
                    customerRegion: row['Customer Region'],
                    customerType: row['Customer Type'],
                    productId: row['Product ID'],
                    productName: row['Product Name'],
                    brand: row['Brand'],
                    productCategory: row['Product Category'],
                    tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [], // Handle string list
                    quantity: Number(row['Quantity']),
                    pricePerUnit: Number(row['Price per Unit']),
                    discountPercentage: Number(row['Discount Percentage']),
                    totalAmount: Number(row['Total Amount']),
                    finalAmount: Number(row['Final Amount']),
                    date: new Date(row['Date']),
                    paymentMethod: row['Payment Method'],
                    orderStatus: row['Order Status'],
                    deliveryType: row['Delivery Type'],
                    storeId: row['Store ID'],
                    storeLocation: row['Store Location'],
                    salespersonId: row['Salesperson ID'],
                    employeeName: row['Employee Name']
                };

                transactions.push(transaction);

                // Batch insert every 5000 records to save memory
                if (transactions.length >= 5000) {
                    // Insert logic could be async here, but for simplicity in stream:
                    // Actually, pausing stream for async insert is better.
                    // But 100k memory is manageable for Node (approx 100MB). 
                    // Let's optimize: Pause stream, insert, resume.
                }
            })
            .on('end', async () => {
                console.log(`Parsed ${transactions.length} records. Inserting...`);
                try {
                    // Insert in chunks
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
