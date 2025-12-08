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

        let salesQuery = supabase
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
                customers (
                    customer_id,
                    customer_name,
                    phone_number,
                    gender,
                    age,
                    customer_region,
                    customer_type
                ),
                products (
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

        salesQuery = salesQuery.order('date', { ascending: false });
        salesQuery = salesQuery.range(0, 999);

        const { data: salesRecords, error: dbErr } = await salesQuery;

        if (dbErr) {
            console.error('Supabase query error:', dbErr);
            return res.status(500).json({ error: 'Failed to fetch sales data from database' });
        }

        let filteredRecords = salesRecords || [];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredRecords = filteredRecords.filter(sale => {
                const customer = sale.customers || {};
                const name = (customer.customer_name || '').toLowerCase();
                const phone = (customer.phone_number || '').toLowerCase();
                return name.includes(searchLower) || phone.includes(searchLower);
            });
        }

        if (customerRegion) {
            const regions = splitFilters(customerRegion);
            filteredRecords = filteredRecords.filter(sale => {
                const customer = sale.customers || {};
                return regions.includes(customer.customer_region);
            });
        }

        if (gender) {
            const genders = splitFilters(gender);
            filteredRecords = filteredRecords.filter(sale => {
                const customer = sale.customers || {};
                return genders.includes(customer.gender);
            });
        }

        if (productCategory) {
            const categories = splitFilters(productCategory);
            filteredRecords = filteredRecords.filter(sale => {
                const product = sale.products || {};
                return categories.includes(product.product_category);
            });
        }

        if (paymentMethod) {
            const methods = splitFilters(paymentMethod);
            filteredRecords = filteredRecords.filter(sale => {
                return methods.includes(sale.payment_method);
            });
        }

        if (minAge) {
            filteredRecords = filteredRecords.filter(sale => {
                const customer = sale.customers || {};
                return (customer.age || 0) >= parseInt(minAge);
            });
        }

        if (maxAge) {
            filteredRecords = filteredRecords.filter(sale => {
                const customer = sale.customers || {};
                return (customer.age || 0) <= parseInt(maxAge);
            });
        }

        if (startDate) {
            filteredRecords = filteredRecords.filter(sale => {
                return sale.date >= startDate;
            });
        }

        if (endDate) {
            filteredRecords = filteredRecords.filter(sale => {
                return sale.date <= endDate;
            });
        }

        const ascending = sortOrder === 'asc';

        if (sortBy === 'customerName') {
            filteredRecords.sort((a, b) => {
                const nameA = (a.customers?.customer_name || '').toLowerCase();
                const nameB = (b.customers?.customer_name || '').toLowerCase();
                return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
        } else if (sortBy === 'quantity') {
            filteredRecords.sort((a, b) => {
                return ascending ? a.quantity - b.quantity : b.quantity - a.quantity;
            });
        } else if (sortBy === 'date') {
            filteredRecords.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return ascending ? dateA - dateB : dateB - dateA;
            });
        }

        const totalCount = filteredRecords.length;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIdx = (pageNum - 1) * limitNum;
        const endIdx = startIdx + limitNum;
        const paginatedRecords = filteredRecords.slice(startIdx, endIdx);

        const results = paginatedRecords.map(sale => {
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

        const stats = filteredRecords.reduce((acc, sale) => {
            acc.totalUnits += sale.quantity || 0;
            acc.totalAmount += parseFloat(sale.total_amount) || 0;
            acc.totalDiscount += (parseFloat(sale.total_amount) || 0) - (parseFloat(sale.final_amount) || 0);
            return acc;
        }, { totalUnits: 0, totalAmount: 0, totalDiscount: 0 });

        res.json({
            data: results,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            },
            stats
        });

    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Something went wrong while fetching sales data' });
    }
};

exports.getFilterOptions = async (req, res) => {
    try {
        const { data: regionData } = await supabase
            .from('customers')
            .select('customer_region')
            .not('customer_region', 'is', null);

        const { data: categoryData } = await supabase
            .from('products')
            .select('product_category')
            .not('product_category', 'is', null);

        const { data: tagData } = await supabase
            .from('products')
            .select('tags')
            .not('tags', 'is', null);

        const { data: paymentData } = await supabase
            .from('sales')
            .select('payment_method')
            .not('payment_method', 'is', null);

        const regions = [...new Set(regionData?.map(r => r.customer_region).filter(Boolean))];
        const categories = [...new Set(categoryData?.map(c => c.product_category).filter(Boolean))];

        let allTags = [];
        if (tagData) {
            tagData.forEach(item => {
                if (item.tags) {
                    allTags = allTags.concat(item.tags);
                }
            });
        }
        const tags = [...new Set(allTags.filter(Boolean))];

        const paymentMethods = [...new Set(paymentData?.map(p => p.payment_method).filter(Boolean))];

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
        salesQuery = salesQuery.range(0, 9999);

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
