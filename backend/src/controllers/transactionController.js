const supabase = require('../config/supabase');

const splitFilters = (param) => {
    if (!param) return null;
    if (Array.isArray(param)) return param;
    return param.includes(',') ? param.split(',') : [param];
};

exports.getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'date',
            sortOrder = 'desc',
            customerRegion,
            gender,
            productCategory,
            paymentMethod,
            tags,
            minAge,
            maxAge,
            startDate,
            endDate
        } = req.query;


        let query = supabase
            .from('sales')
            .select(`
                sales_id,
                quantity,
                price_per_unit,
                discount_percentage,
                total_amount,
                final_amount,
                date,
                payment_method,
                order_status,
                delivery_type,
                customers!inner (
                    customer_id,
                    customer_name,
                    phone_number,
                    gender,
                    age,
                    customer_region,
                    customer_type
                ),
                products!inner (
                    product_id,
                    product_name,
                    brand,
                    product_category,
                    tags
                ),
                stores (
                    store_id,
                    store_location
                ),
                employees (
                    salesperson_id,
                    employee_name
                )
            `, { count: 'exact' });


        if (search) {
            // Use Supabase .or() with foreign table reference
            query = query.or(`customer_name.ilike.%${search}%,phone_number.ilike.%${search}%`, { foreignTable: 'customers' });
        }


        if (customerRegion) {
            const regions = splitFilters(customerRegion);
            query = query.in('customers.customer_region', regions);
        }

        if (gender) {
            const genders = splitFilters(gender);
            query = query.in('customers.gender', genders);
        }

        if (productCategory) {
            const categories = splitFilters(productCategory);
            query = query.in('products.product_category', categories);
        }

        if (paymentMethod) {
            const methods = splitFilters(paymentMethod);
            query = query.in('payment_method', methods);
        }

        if (tags) {
            const tagList = splitFilters(tags);
            // Assuming DB column is an array. 'ov' stands for overlaps (arrays have common elements).
            query = query.overlaps('products.tags', tagList);
        }

        if (minAge) {
            const min = parseInt(minAge);
            if (!isNaN(min)) query = query.gte('customers.age', min);
        }

        if (maxAge) {
            const max = parseInt(maxAge);
            if (!isNaN(max)) query = query.lte('customers.age', max);
        }

        if (startDate) {
            query = query.gte('date', startDate);
        }

        if (endDate) {
            query = query.lte('date', endDate);
        }


        if (sortBy === 'date') {
            query = query.order('date', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'quantity') {
            query = query.order('quantity', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'customerName') {

            query = query.order('customer_name', { foreignTable: 'customers', ascending: sortOrder === 'asc' });
        } else {
            query = query.order('date', { ascending: false });
        }


        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        query = query.range(from, to);

        const { data: salesRecords, count, error: dbErr } = await query;

        if (dbErr) {
            console.error('Supabase query error:', dbErr);
            return res.status(500).json({ error: 'Failed to fetch sales data from database' });
        }

        const results = (salesRecords || []).map(sale => {
            const customer = sale.customers || {};
            const product = sale.products || {};
            const store = sale.stores || {};
            const employee = sale.employees || {};

            return {
                _id: sale.sales_id,
                transactionId: sale.sales_id.toString(),
                customerId: customer.customer_id || '',
                customerName: customer.customer_name || '',
                phoneNumber: customer.phone_number || '',
                gender: customer.gender || '',
                age: customer.age || 0,
                customerRegion: customer.customer_region || '',
                customerType: customer.customer_type || '',
                productId: product.product_id || '',
                productName: product.product_name || '',
                brand: product.brand || '',
                productCategory: product.product_category || '',
                tags: product.tags || [],
                quantity: sale.quantity,
                pricePerUnit: sale.price_per_unit,
                discountPercentage: sale.discount_percentage,
                totalAmount: sale.total_amount,
                finalAmount: sale.final_amount,
                date: sale.date,
                paymentMethod: sale.payment_method,
                orderStatus: sale.order_status,
                deliveryType: sale.delivery_type,
                storeId: store.store_id || '',
                storeLocation: store.store_location || '',
                salespersonId: employee.salesperson_id || '',
                employeeName: employee.employee_name || ''
            };
        });


        const totalCount = count || 0;


        res.json({
            data: results,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            },
            stats: { totalUnits: 0, totalAmount: 0, totalDiscount: 0 }
        });

    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Something went wrong while fetching sales data' });
    }
};

exports.getFilterOptions = async (req, res) => {
    try {
        console.log('Fetching filter options (Safe Mode)...');

        // Strategy: 
        // 1. Try to fetch distinct values from tables directly (small limit)
        // 2. If that fails or yields empty, use hardcoded defaults so UI doesn't break.

        let regions = new Set();
        let categories = new Set();
        let tags = new Set();
        let paymentMethods = new Set();

        // 1. Regions
        const { data: custData } = await supabase.from('customers').select('customer_region').limit(100);
        if (custData) custData.forEach(c => c.customer_region && regions.add(c.customer_region));

        // 2. Categories & Tags
        const { data: prodData } = await supabase.from('products').select('product_category, tags').limit(100);
        if (prodData) {
            prodData.forEach(p => {
                if (p.product_category) categories.add(p.product_category);
                if (Array.isArray(p.tags)) p.tags.forEach(t => tags.add(t));
            });
        }

        // 3. Payment Methods
        const { data: salesData } = await supabase.from('sales').select('payment_method').limit(100);
        if (salesData) salesData.forEach(s => s.payment_method && paymentMethods.add(s.payment_method));


        // ALWAYS ensure standard options are present (Merge with DB results)
        ["East", "West", "North", "South", "Central"].forEach(r => regions.add(r));

        if (categories.size === 0) {
            ["Electronics", "Clothing", "Home", "Books", "Beauty", "Sports"].forEach(c => categories.add(c));
        }
        if (tags.size === 0) {
            ["New", "Sale", "Limited", "Popular", "Eco-friendly"].forEach(t => tags.add(t));
        }
        if (paymentMethods.size === 0) {
            ["Credit Card", "Debit Card", "PayPal", "UPI", "Cash"].forEach(p => paymentMethods.add(p));
        }

        res.json({
            regions: [...regions].sort(),
            categories: [...categories].sort(),
            tags: [...tags].sort(),
            paymentMethods: [...paymentMethods].sort()
        });
    } catch (err) {
        console.error('Error fetching filter options:', err);
        // Absolute fail-safe
        res.json({
            regions: ["East", "West", "North", "South", "Central"],
            categories: ["Electronics", "Clothing", "Home", "Books", "Beauty"],
            tags: ["New", "Sale", "Limited"],
            paymentMethods: ["Credit Card", "PayPal", "Cash"]
        });
    }
};

exports.getEmployeePerformance = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search
        } = req.query;

        let salesQuery = supabase
            .from('sales')
            .select(`
                quantity,
                total_amount,
                final_amount,
                employees (
                    salesperson_id,
                    employee_name
                )
            `);

        salesQuery = salesQuery.order('salesperson_id', { ascending: true });
        salesQuery = salesQuery.range(0, 99999);

        const { data: salesRecords, error: dbErr } = await salesQuery;

        if (dbErr) {
            console.error('Supabase query error:', dbErr);
            return res.status(500).json({ error: 'Failed to fetch employee data' });
        }

        const employeeMap = {};

        salesRecords.forEach(sale => {
            const employee = sale.employees || {};
            const empId = employee.salesperson_id;
            const empName = employee.employee_name || 'Unknown';

            if (!empId) return;

            if (!employeeMap[empId]) {
                employeeMap[empId] = {
                    employeeId: empId,
                    employeeName: empName,
                    totalUnits: 0,
                    totalAmount: 0,
                    totalDiscount: 0
                };
            }

            employeeMap[empId].totalUnits += sale.quantity || 0;
            employeeMap[empId].totalAmount += parseFloat(sale.total_amount) || 0;
            employeeMap[empId].totalDiscount += (parseFloat(sale.total_amount) || 0) - (parseFloat(sale.final_amount) || 0);
        });

        let employeeList = Object.values(employeeMap);

        if (search) {
            const searchLower = search.toLowerCase();
            employeeList = employeeList.filter(emp =>
                emp.employeeName.toLowerCase().includes(searchLower)
            );
        }

        const stats = employeeList.reduce((acc, emp) => {
            acc.totalUnits += emp.totalUnits;
            acc.totalAmount += emp.totalAmount;
            acc.totalDiscount += emp.totalDiscount;
            return acc;
        }, { totalUnits: 0, totalAmount: 0, totalDiscount: 0 });

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const totalCount = employeeList.length;
        const startIdx = (pageNum - 1) * limitNum;
        const endIdx = startIdx + limitNum;
        const paginatedEmployees = employeeList.slice(startIdx, endIdx);

        res.json({
            data: paginatedEmployees,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            },
            stats
        });

    } catch (err) {
        console.error('Error fetching employee performance:', err);
        res.status(500).json({ error: 'Failed to load employee performance data' });
    }
};
