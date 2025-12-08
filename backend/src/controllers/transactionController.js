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

        if (search) {
            query = query.or(`customers.customer_name.ilike.%${search}%,customers.phone_number.ilike.%${search}%`);
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

        const ascending = sortOrder === 'asc';
        query = query.order(sortBy, { ascending });

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }

        const results = data.map(item => {
            const customer = item.customers || {};
            const product = item.products || {};
            const store = item.stores || {};
            const employee = item.employees || {};

            return {
                _id: item.sales_id,
                transactionId: item.sales_id.toString(),
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
                quantity: item.quantity,
                pricePerUnit: item.price_per_unit,
                discountPercentage: item.discount_percentage,
                totalAmount: item.total_amount,
                finalAmount: item.final_amount,
                date: item.date,
                paymentMethod: item.payment_method,
                orderStatus: item.order_status,
                deliveryType: item.delivery_type,
                storeId: store.store_id || '',
                storeLocation: store.store_location || '',
                salespersonId: employee.salesperson_id || '',
                employeeName: employee.employee_name || ''
            };
        });

        let statsQuery = supabase
            .from('sales')
            .select('quantity, total_amount, final_amount');

        if (search) {
            statsQuery = statsQuery.or(`customers.customer_name.ilike.%${search}%,customers.phone_number.ilike.%${search}%`);
        }

        const { data: statsData } = await statsQuery;

        let totalUnits = 0;
        let totalAmt = 0;
        let totalDisc = 0;

        if (statsData) {
            statsData.forEach(row => {
                totalUnits += row.quantity || 0;
                totalAmt += parseFloat(row.total_amount) || 0;
                totalDisc += (parseFloat(row.total_amount) || 0) - (parseFloat(row.final_amount) || 0);
            });
        }

        res.json({
            data: results,
            pagination: {
                total: count || 0,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil((count || 0) / limitNum)
            },
            stats: {
                totalUnits,
                totalAmount: totalAmt,
                totalDiscount: totalDisc
            }
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server Error' });
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
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};
