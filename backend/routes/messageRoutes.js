const express = require('express');
const { getMessages, sendMessage, getAdvisor } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getMessages);
router.post('/', protect, sendMessage);
router.get('/advisor', protect, getAdvisor);

module.exports = router;
