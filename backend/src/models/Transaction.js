const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Support searching by Transaction ID if needed (usually _id or custom)
    transactionId: { type: String, required: false }, // Optional, logical ID

    // Customer Fields
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true }, // Search Target
    phoneNumber: { type: String, required: true }, // Search Target
    gender: { type: String, enum: ['Male', 'Female', 'Other'], index: true }, // Filter
    age: { type: Number, index: true }, // Range Filter
    customerRegion: { type: String, index: true }, // Filter
    customerType: { type: String },

    // Product Fields
    productId: { type: String, required: false },
    productName: { type: String, required: true },
    brand: { type: String },
    productCategory: { type: String, index: true }, // Filter
    tags: { type: [String], index: true }, // Multi-select Filter

    // Sales Fields
    quantity: { type: Number, required: true }, // Sort
    pricePerUnit: { type: Number },
    discountPercentage: { type: Number },
    totalAmount: { type: Number },
    finalAmount: { type: Number },

    // Operational Fields
    date: { type: Date, required: true, index: true }, // Filter (Range) + Sort
    paymentMethod: { type: String, index: true }, // Filter
    orderStatus: { type: String },
    deliveryType: { type: String },
    storeId: { type: String },
    storeLocation: { type: String },
    salespersonId: { type: String },
    employeeName: { type: String }
}, { timestamps: true });

// Text Index for Search
transactionSchema.index({ customerName: 'text', phoneNumber: 'text' });
// Compound indexes could be useful for sorting/filtering, e.g., { date: -1, quantity: -1 }

module.exports = mongoose.model('Transaction', transactionSchema);
