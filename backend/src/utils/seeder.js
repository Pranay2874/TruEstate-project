require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const supabase = require('../config/supabase');

const CSV_PATH = __dirname + '/../../data/truestate_assignment_dataset.csv';

const importData = async () => {
    console.log('Starting Supabase data import...');

    const customers = new Map();
    const products = new Map();
    const stores = new Map();
    const employees = new Map();
    const sales = [];

    const parseDate = (dateStr) => {
        const d = new Date(dateStr);
        return isNaN(d) ? new Date() : d.toISOString().split('T')[0];
    };

    const normalizeEnum = (value, defaultValue = 'OTHER') => {
        if (!value) return defaultValue;
        return value.toUpperCase().replace(/\s+/g, '_');
    };

    return new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (row) => {
                const customerId = row['Customer ID'] || `CUST_${Date.now()}_${Math.random()}`;
                const productId = row['Product ID'] || `PROD_${Date.now()}_${Math.random()}`;
                const storeId = row['Store ID'] || `STORE_${Date.now()}_${Math.random()}`;
                const salespersonId = row['Salesperson ID'] || `SALES_${Date.now()}_${Math.random()}`;

                if (!customers.has(customerId)) {
                    customers.set(customerId, {
                        customer_id: customerId,
                        customer_name: row['Customer Name'] || 'Unknown',
                        phone_number: row['Phone Number'] || null,
                        gender: normalizeEnum(row['Gender'], 'UNKNOWN'),
                        age: parseInt(row['Age']) || null,
                        customer_region: row['Customer Region'] || null,
                        customer_type: normalizeEnum(row['Customer Type'], 'OTHER')
                    });
                }

                if (!products.has(productId)) {
                    const tagsArray = row['Tags'] ? row['Tags'].split(',').map(t => t.trim().toLowerCase()) : [];
                    products.set(productId, {
                        product_id: productId,
                        product_name: row['Product Name'] || 'Unknown Product',
                        brand: row['Brand'] || null,
                        product_category: row['Product Category'] || null,
                        tags: tagsArray
                    });
                }

                if (!stores.has(storeId)) {
                    stores.set(storeId, {
                        store_id: storeId,
                        store_location: row['Store Location'] || null
                    });
                }

                if (!employees.has(salespersonId)) {
                    employees.set(salespersonId, {
                        salesperson_id: salespersonId,
                        employee_name: row['Employee Name'] || 'Unknown Employee'
                    });
                }

                sales.push({
                    customer_id: customerId,
                    product_id: productId,
                    store_id: storeId,
                    salesperson_id: salespersonId,
                    quantity: parseInt(row['Quantity']) || 0,
                    price_per_unit: parseFloat(row['Price per Unit']) || 0,
                    discount_percentage: parseFloat(row['Discount Percentage']) || 0,
                    total_amount: parseFloat(row['Total Amount']) || 0,
                    final_amount: parseFloat(row['Final Amount']) || 0,
                    date: parseDate(row['Date']),
                    payment_method: normalizeEnum(row['Payment Method'], 'OTHER'),
                    order_status: normalizeEnum(row['Order Status'], 'PENDING'),
                    delivery_type: normalizeEnum(row['Delivery Type'], 'OTHER')
                });
            })
            .on('end', async () => {
                try {
                    console.log(`Parsed ${customers.size} customers, ${products.size} products, ${stores.size} stores, ${employees.size} employees, ${sales.length} sales`);

                    console.log('Inserting customers...');
                    const customerBatches = chunkArray(Array.from(customers.values()), 1000);
                    for (const batch of customerBatches) {
                        const { error } = await supabase.from('customers').upsert(batch, { onConflict: 'customer_id' });
                        if (error) console.error('Customer insert error:', error);
                    }

                    console.log('Inserting products...');
                    const productBatches = chunkArray(Array.from(products.values()), 1000);
                    for (const batch of productBatches) {
                        const { error } = await supabase.from('products').upsert(batch, { onConflict: 'product_id' });
                        if (error) console.error('Product insert error:', error);
                    }

                    console.log('Inserting stores...');
                    const storeBatches = chunkArray(Array.from(stores.values()), 1000);
                    for (const batch of storeBatches) {
                        const { error } = await supabase.from('stores').upsert(batch, { onConflict: 'store_id' });
                        if (error) console.error('Store insert error:', error);
                    }

                    console.log('Inserting employees...');
                    const employeeBatches = chunkArray(Array.from(employees.values()), 1000);
                    for (const batch of employeeBatches) {
                        const { error } = await supabase.from('employees').upsert(batch, { onConflict: 'salesperson_id' });
                        if (error) console.error('Employee insert error:', error);
                    }

                    console.log('Inserting sales...');
                    const salesBatches = chunkArray(sales, 1000);
                    for (let i = 0; i < salesBatches.length; i++) {
                        const { error } = await supabase.from('sales').insert(salesBatches[i]);
                        if (error) console.error(`Sales batch ${i + 1} error:`, error);
                        console.log(`Inserted sales batch ${i + 1}/${salesBatches.length}`);
                    }

                    console.log('Data import complete!');
                    resolve();
                } catch (err) {
                    console.error('Import error:', err);
                    reject(err);
                }
            })
            .on('error', reject);
    });
};

const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

importData()
    .then(() => {
        console.log('Seeding completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
