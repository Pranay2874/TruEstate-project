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

            query = query.ilike('customers.customer_name', `%${search}%`);
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
            query = query.gte('customers.age', parseInt(minAge));
        }

        if (maxAge) {
            query = query.lte('customers.age', parseInt(maxAge));
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
        console.log('Fetching filter options...');
        // Note: Supabase API has a max row limit (often 1000). 
        // For production with >1k rows, we should use RPC "distinct" functions or recursive fetching.
        // attempting larger range, but might be capped by server policies.
        const [
            { data: regionData, error: regionError },
            { data: categoryData, error: categoryError },
            { data: tagData, error: tagError },
            { data: paymentData, error: paymentError }
        ] = await Promise.all([
            supabase
                .from('customers')
                .select('customer_region')
                .not('customer_region', 'is', null)
                .range(0, 4999), // Increased sample size
            supabase
                .from('products')
                .select('product_category')
                .not('product_category', 'is', null)
                .range(0, 4999),
            supabase
                .from('products')
                .select('tags')
                .not('tags', 'is', null)
                .range(0, 4999),
            supabase
                .from('sales')
                .select('payment_method')
                .not('payment_method', 'is', null)
                .range(0, 4999)
        ]);

        if (regionError) console.error('Region fetch error:', regionError);
        if (categoryError) console.error('Category fetch error:', categoryError);
        if (tagError) console.error('Tag fetch error:', tagError);
        if (paymentError) console.error('Payment fetch error:', paymentError);

        const regions = [...new Set(regionData?.map(r => r.customer_region).filter(Boolean))].sort();
        const categories = [...new Set(categoryData?.map(c => c.product_category).filter(Boolean))].sort();

        let allTags = [];
        if (tagData) {
            tagData.forEach(item => {
                if (item.tags) {
                    allTags = allTags.concat(item.tags);
                }
            });
        }
        const tags = [...new Set(allTags.filter(Boolean))].sort();

        const paymentMethods = [...new Set(paymentData?.map(p => p.payment_method).filter(Boolean))].sort();

        console.log(`Loaded options: Regions(${regions.length}), Categories(${categories.length}), Tags(${tags.length})`);

        res.json({
            regions,
            categories,
            tags,
            paymentMethods
        });
    } catch (err) {
        console.error('Error fetching filter options:', err);
        res.status(500).json({ error: 'Failed to load filter options' });
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
