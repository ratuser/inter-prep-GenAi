const express = require('express');
const router = express.Router();
const { chatWithAI, completeInterview } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/chat', authMiddleware, chatWithAI);
router.post('/complete', authMiddleware, completeInterview);

module.exports = router;
