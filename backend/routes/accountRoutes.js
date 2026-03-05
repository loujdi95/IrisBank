const express = require('express');
const router = express.Router();
const { createAccount, getMyAccounts, deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middlewares/authMiddleware');

// Toutes les routes de comptes nécessitent d'être connecté (protect)
router.route('/')
    .post(protect, createAccount)
    .get(protect, getMyAccounts);

router.route('/:id')
    .delete(protect, deleteAccount);

module.exports = router;
