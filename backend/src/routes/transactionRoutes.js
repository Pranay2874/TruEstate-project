const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// main route to get transactions with filters, pagination, sorting
router.get('/', transactionController.getTransactions);
// route to get filter dropdown options
router.get('/options', transactionController.getFilterOptions);
// route to get employee performance data
router.get('/employees', transactionController.getEmployeePerformance);

module.exports = router;
