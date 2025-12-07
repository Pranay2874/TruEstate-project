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

        const flattenedData = data.map(sale => ({
            _id: sale.sales_id,
            transactionId: sale.sales_id.toString(),
            customerId: sale.customers?.customer_id || '',
            customerName: sale.customers?.customer_name || '',
            phoneNumber: sale.customers?.phone_number || '',
            gender: sale.customers?.gender || '',
            age: sale.customers?.age || 0,
            customerRegion: sale.customers?.customer_region || '',
            customerType: sale.customers?.customer_type || '',
            productId: sale.products?.product_id || '',
            productName: sale.products?.product_name || '',
            brand: sale.products?.brand || '',
            productCategory: sale.products?.product_category || '',
            tags: sale.products?.tags || [],
            quantity: sale.quantity,
            pricePerUnit: sale.price_per_unit,
            discountPercentage: sale.discount_percentage,
            totalAmount: sale.total_amount,
            finalAmount: sale.final_amount,
            date: sale.date,
            paymentMethod: sale.payment_method,
            orderStatus: sale.order_status,
            deliveryType: sale.delivery_type,
            storeId: sale.stores?.store_id || '',
            storeLocation: sale.stores?.store_location || '',
            salespersonId: sale.employees?.salesperson_id || '',
            employeeName: sale.employees?.employee_name || ''
        }));

        let statsQuery = supabase
            .from('sales')
            .select('quantity, total_amount, final_amount');

        if (search) {
            statsQuery = statsQuery.or(`customers.customer_name.ilike.%${search}%,customers.phone_number.ilike.%${search}%`);
        }

        const { data: statsData, error: statsError } = await statsQuery;

        const stats = {
            totalUnits: statsData?.reduce((sum, row) => sum + (row.quantity || 0), 0) || 0,
            totalAmount: statsData?.reduce((sum, row) => sum + (parseFloat(row.total_amount) || 0), 0) || 0,
            totalDiscount: statsData?.reduce((sum, row) => sum + ((parseFloat(row.total_amount) || 0) - (parseFloat(row.final_amount) || 0)), 0) || 0
        };

        res.json({
            data: flattenedData,
            pagination: {
                total: count || 0,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil((count || 0) / limitNum)
            },
            stats
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getFilterOptions = async (req, res) => {
    try {
        const { data: regions } = await supabase
            .from('customers')
            .select('customer_region')
            .not('customer_region', 'is', null);

        const { data: categories } = await supabase
            .from('products')
            .select('product_category')
            .not('product_category', 'is', null);

        const { data: tagsData } = await supabase
            .from('products')
            .select('tags')
            .not('tags', 'is', null);

        const { data: paymentMethods } = await supabase
            .from('sales')
            .select('payment_method')
            .not('payment_method', 'is', null);

        const uniqueRegions = [...new Set(regions?.map(r => r.customer_region).filter(Boolean))];
        const uniqueCategories = [...new Set(categories?.map(c => c.product_category).filter(Boolean))];
        const uniqueTags = [...new Set(tagsData?.flatMap(t => t.tags || []).filter(Boolean))];
        const uniquePaymentMethods = [...new Set(paymentMethods?.map(p => p.payment_method).filter(Boolean))];

        res.json({
            regions: uniqueRegions,
            categories: uniqueCategories,
            tags: uniqueTags,
            paymentMethods: uniquePaymentMethods
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};
