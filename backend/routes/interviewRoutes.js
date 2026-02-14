const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route
router.post('/chat', authMiddleware, chatWithAI);

module.exports = router;
