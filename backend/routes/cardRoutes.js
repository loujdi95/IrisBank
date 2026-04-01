const express = require('express');
const { getCards, getCardDetails, toggleCardStatus, reportOpposition, updateLimits } = require('../controllers/cardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getCards);
router.get('/:id', protect, getCardDetails);
router.patch('/:id/toggle', protect, toggleCardStatus);
router.patch('/:id/opposition', protect, reportOpposition);
router.patch('/:id/limits', protect, updateLimits);

module.exports = router;
