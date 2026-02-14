const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route — requires JWT
router.get('/stats', authMiddleware, getDashboardStats);

module.exports = router;
