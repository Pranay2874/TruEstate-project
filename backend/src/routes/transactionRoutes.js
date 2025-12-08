const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// main route to get transactions with filters, pagination, sorting
router.get('/', transactionController.getTransactions);
// route to get filter dropdown options
router.get('/options', transactionController.getFilterOptions);

module.exports = router;
