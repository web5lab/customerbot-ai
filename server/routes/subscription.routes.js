import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getUserSubscription,
    updateSubscriptionPlan,
    checkLimits,
    getUsageStats,
    cancelSubscription,
    reactivateSubscription,
    getBillingHistory
} from '../controller/subscription.controller.js';

const router = express.Router();

// Get user subscription
router.get('/subscription', authenticateToken, getUserSubscription);

// Update subscription plan
router.put('/subscription', authenticateToken, updateSubscriptionPlan);

// Check subscription limits
router.get('/limits', authenticateToken, checkLimits);

// Get usage statistics
router.get('/usage', authenticateToken, getUsageStats);

// Cancel subscription
router.post('/subscription/cancel', authenticateToken, cancelSubscription);

// Reactivate subscription
router.post('/subscription/reactivate', authenticateToken, reactivateSubscription);

// Get billing history
router.get('/billing-history', authenticateToken, getBillingHistory);

export default router;