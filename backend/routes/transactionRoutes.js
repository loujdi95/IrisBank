const express = require('express');
const router = express.Router();
const { deposit, withdraw, transfer } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

// Toutes les transactions nécessitent d'être connecté
router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw);
router.post('/transfer', protect, transfer);

module.exports = router;
