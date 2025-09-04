import mongoose from 'mongoose';
import Subscription from '../models/Subscription.schema.js';
import Platform from '../models/Platform.schema.js';
import { 
    createOrUpdateSubscription, 
    getSubscriptionByUserId, 
    checkSubscriptionLimits,
    useCredit 
} from '../services/subscriptionService.js';

// Get user subscription
export const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const subscription = await getSubscriptionByUserId(userId);
        
        res.status(200).json({ subscription });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Server error while fetching subscription' });
    }
};

// Update subscription plan
export const updateSubscriptionPlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { planType, billingCycle = 'monthly' } = req.body;

        if (!['free', 'pro', 'enterprise'].includes(planType)) {
            return res.status(400).json({ message: 'Invalid plan type' });
        }

        const subscription = await createOrUpdateSubscription(userId, planType, billingCycle);
        
        res.status(200).json({ 
            message: 'Subscription updated successfully', 
            subscription 
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: 'Server error while updating subscription' });
    }
};

// Check subscription limits
export const checkLimits = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { action } = req.query;

        const result = await checkSubscriptionLimits(userId, action);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error checking limits:', error);
        res.status(500).json({ message: 'Server error while checking limits' });
    }
};

// Get subscription usage stats
export const getUsageStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const subscription = await getSubscriptionByUserId(userId);
        const platform = await Platform.findOne({ userId });
        
        // Get bot count
        const botCount = platform ? await mongoose.model('BotConfig').countDocuments({ platFormId: platform._id }) : 0;
        
        // Get conversation count for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const conversationCount = await mongoose.model('ChatSession').countDocuments({
            timestamp: { $gte: startOfMonth }
        });

        const usageStats = {
            credits: {
                used: subscription.credits.used,
                total: subscription.credits.monthly,
                remaining: subscription.getRemainingCredits(),
                resetDate: subscription.credits.resetDate
            },
            bots: {
                used: botCount,
                total: subscription.features.maxBots === -1 ? 'unlimited' : subscription.features.maxBots
            },
            conversations: {
                used: conversationCount,
                total: subscription.features.maxConversations === -1 ? 'unlimited' : subscription.features.maxConversations
            },
            subscription: {
                planType: subscription.planType,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
                daysUntilRenewal: subscription.daysUntilRenewal,
                isActive: subscription.isActive(),
                isInTrial: subscription.isInTrial()
            }
        };
        
        res.status(200).json({ usage: usageStats });
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        res.status(500).json({ message: 'Server error while fetching usage stats' });
    }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cancelAtPeriodEnd = true, reason } = req.body;

        const subscription = await Subscription.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
        subscription.metadata.cancellationReason = reason;
        subscription.metadata.cancellationDate = new Date();

        if (!cancelAtPeriodEnd) {
            subscription.status = 'cancelled';
            subscription.currentPeriodEnd = new Date();
        }

        await subscription.save();
        
        res.status(200).json({ 
            message: 'Subscription cancelled successfully', 
            subscription 
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: 'Server error while cancelling subscription' });
    }
};

// Reactivate subscription
export const reactivateSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { planType = 'pro', billingCycle = 'monthly' } = req.body;

        const subscription = await createOrUpdateSubscription(userId, planType, billingCycle);
        
        res.status(200).json({ 
            message: 'Subscription reactivated successfully', 
            subscription 
        });
    } catch (error) {
        console.error('Error reactivating subscription:', error);
        res.status(500).json({ message: 'Server error while reactivating subscription' });
    }
};

// Get billing history
export const getBillingHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const subscription = await Subscription.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        const billingHistory = subscription.paymentHistory.sort((a, b) => 
            new Date(b.paidAt) - new Date(a.paidAt)
        );
        
        res.status(200).json({ billingHistory });
    } catch (error) {
        console.error('Error fetching billing history:', error);
        res.status(500).json({ message: 'Server error while fetching billing history' });
    }
};