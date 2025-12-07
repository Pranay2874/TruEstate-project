const Transaction = require('../models/Transaction');

// Utility to parse array filters (handling comma-separated strings if passed as such or arrays)
const parseArrayFilter = (param) => {
    if (!param) return null;
    if (Array.isArray(param)) return { $in: param };
    return { $in: param.split(',') };
};

exports.getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'date',
            sortOrder = 'desc', // 'asc' or 'desc'
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

        const query = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { customerName: searchRegex },
                { phoneNumber: searchRegex }
            ];
        }

        if (customerRegion) query.customerRegion = parseArrayFilter(customerRegion);
        if (gender) query.gender = parseArrayFilter(gender);
        if (productCategory) query.productCategory = parseArrayFilter(productCategory);
        if (paymentMethod) query.paymentMethod = parseArrayFilter(paymentMethod);
        if (tags) query.tags = parseArrayFilter(tags);

        if (minAge || maxAge) {
            query.age = {};
            if (minAge) query.age.$gte = Number(minAge);
            if (maxAge) query.age.$lte = Number(maxAge);
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            sortOptions._id = -1;
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const statsPipeline = [
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalUnits: { $sum: '$quantity' },
                    totalAmount: { $sum: '$totalAmount' },
                    totalDiscount: {
                        $sum: {
                            $cond: {
                                if: { $gt: [{ $subtract: ['$totalAmount', '$finalAmount'] }, 0] },
                                then: { $subtract: ['$totalAmount', '$finalAmount'] },
                                else: 0
                            }
                        }
                    }
                }
            }
        ];

        const statsResult = await Transaction.aggregate(statsPipeline);
        const stats = statsResult.length > 0 ? statsResult[0] : { totalUnits: 0, totalAmount: 0, totalDiscount: 0 };

        res.json({
            data: transactions,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            },
            stats: {
                totalUnits: stats.totalUnits,
                totalAmount: stats.totalAmount,
                totalDiscount: stats.totalDiscount
            }
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Optional: Get unique values for filters (for frontend dropdowns)
exports.getFilterOptions = async (req, res) => {
    try {
        const regions = await Transaction.distinct('customerRegion');
        const categories = await Transaction.distinct('productCategory');
        const tags = await Transaction.distinct('tags');
        const paymentMethods = await Transaction.distinct('paymentMethod');

        res.json({
            regions,
            categories,
            tags,
            paymentMethods
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
