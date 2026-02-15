const express = require('express');
const router = express.Router();
const { uploadResume, getResumeStatus, analyseResume, deleteResume } = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected
router.post('/upload', authMiddleware, uploadResume);
router.get('/status', authMiddleware, getResumeStatus);
router.post('/analyse', authMiddleware, analyseResume);
router.delete('/:id', authMiddleware, deleteResume);

module.exports = router;
