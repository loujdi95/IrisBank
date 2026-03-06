const express = require('express');
const { getBankAdvice } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/chat', protect, getBankAdvice);

module.exports = router;
