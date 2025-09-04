import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getBotStats,
    getDashboardStats,
    getChartData
} from '../controller/stats.controller.js';

const router = express.Router();

// Get stats for specific bot
router.get('/bot/:botId', authenticateToken, getBotStats);

// Get dashboard overview stats
router.get('/dashboard', authenticateToken, getDashboardStats);

// Get chart data for analytics
router.get('/bot/:botId/chart', authenticateToken, getChartData);

export default router;