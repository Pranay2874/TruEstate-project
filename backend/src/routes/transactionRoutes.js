const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getTransactions);
router.get('/options', transactionController.getFilterOptions);
router.get('/employees', transactionController.getEmployeePerformance);

module.exports = router;
