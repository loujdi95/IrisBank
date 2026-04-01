const express = require('express');
const { getAllUsers, getAllAccounts, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Toutes les routes de l'admin nécessitent d'être connecté ET d'avoir le rôle admin
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/accounts', getAllAccounts);

module.exports = router;
