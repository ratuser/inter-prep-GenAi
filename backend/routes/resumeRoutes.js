const express = require('express');
const router = express.Router();
const { uploadResume, getResumeStatus, analyseResume } = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected
router.post('/upload', authMiddleware, uploadResume);
router.get('/status', authMiddleware, getResumeStatus);
router.post('/analyse', authMiddleware, analyseResume);

module.exports = router;
