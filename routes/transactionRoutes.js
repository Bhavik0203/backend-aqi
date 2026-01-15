const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.post('/', transactionController.createTransaction);
router.get('/stats', transactionController.getTransactionStats);

module.exports = router;
