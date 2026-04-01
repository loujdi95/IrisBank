const express = require('express');
const { createTransfer, depositFunds, withdrawFunds, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/transfer', protect, createTransfer);
router.post('/deposit', protect, depositFunds);
router.post('/withdraw', protect, withdrawFunds);
router.get('/:accountId', protect, getTransactions);

module.exports = router;
