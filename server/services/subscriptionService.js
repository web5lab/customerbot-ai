import Subscription from '../models/Subscription.schema.js';
import Platform from '../models/Platform.schema.js';
import User from '../models/User.schema.js';
import { sendSubscriptionRenewalNotification, sendSubscriptionExpiryWarning, sendSubscriptionExpiredNotification } from './emailService.js';
import mongoose from 'mongoose';

// Plan configurations
const PLAN_CONFIGS = {
    free: {
        credits: 100,
        maxBots: 1,
        maxConversations: 100,
        maxTeamMembers: 1,
        hasAnalytics: false,
        hasIntegrations: false,
        hasPrioritySupport: false,
        hasCustomBranding: false
    },
    pro: {
        credits: 5000,
        maxBots: 5,
        maxConversations: 5000,
        maxTeamMembers: 10,
        hasAnalytics: true,
        hasIntegrations: true,
        hasPrioritySupport: true,
        hasCustomBranding: true
    },
    enterprise: {
        credits: 50000,
        maxBots: -1, // unlimited
        maxConversations: -1, // unlimited
        maxTeamMembers: -1, // unlimited
        hasAnalytics: true,
        hasIntegrations: true,
        hasPrioritySupport: true,
        hasCustomBranding: true
    }
};

// Create or update subscription
export const createOrUpdateSubscription = async (userId, planType = 'free', billingCycle = 'monthly') => {
    try {
        const planConfig = PLAN_CONFIGS[planType];
        if (!planConfig) {
            throw new Error('Invalid plan type');
        }

        const now = new Date();
        const periodEnd = new Date();
        
        // Set period end based on billing cycle
        if (billingCycle === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        const subscriptionData = {
            userId,
            planType,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            billingCycle,
            credits: {
                monthly: planConfig.credits,
                used: 0,
                resetDate: now
            },
            features: {
                maxBots: planConfig.maxBots,
                maxConversations: planConfig.maxConversations,
                maxTeamMembers: planConfig.maxTeamMembers,
                hasAnalytics: planConfig.hasAnalytics,
                hasIntegrations: planConfig.hasIntegrations,
                hasPrioritySupport: planConfig.hasPrioritySupport,
                hasCustomBranding: planConfig.hasCustomBranding
            }
        };

        const subscription = await Subscription.findOneAndUpdate(
            { userId },
            subscriptionData,
            { upsert: true, new: true }
        );

        // Update platform credits
        await Platform.findOneAndUpdate(
            { userId },
            { remainingCredits: planConfig.credits }
        );

        console.log(`Subscription ${subscription._id} created/updated for user ${userId}`);
        return subscription;
    } catch (error) {
        console.error('Error creating/updating subscription:', error);
        throw error;
    }
};

// Process subscription renewals
export const processSubscriptionRenewals = async () => {
    try {
        console.log('🔄 Processing subscription renewals...');
        
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find subscriptions expiring in the next 24 hours
        const expiringSubscriptions = await Subscription.find({
            currentPeriodEnd: { $lte: tomorrow, $gte: now },
            status: 'active',
            cancelAtPeriodEnd: false
        }).populate('userId', 'name email');

        console.log(`Found ${expiringSubscriptions.length} subscriptions to renew`);

        for (const subscription of expiringSubscriptions) {
            try {
                await renewSubscription(subscription);
            } catch (error) {
                console.error(`Failed to renew subscription ${subscription._id}:`, error);
                
                // Mark as past due and send notification
                subscription.status = 'past_due';
                subscription.metadata.lastBillingAttempt = now;
                subscription.metadata.failedPaymentCount = (subscription.metadata.failedPaymentCount || 0) + 1;
                await subscription.save();

                // Send failure notification
                try {
                    await sendSubscriptionExpiredNotification({
                        recipientEmail: subscription.userId.email,
                        recipientName: subscription.userId.name,
                        planType: subscription.planType,
                        expiryDate: subscription.currentPeriodEnd
                    });
                } catch (emailError) {
                    console.error('Failed to send expiry notification:', emailError);
                }
            }
        }

        return { processed: expiringSubscriptions.length };
    } catch (error) {
        console.error('Error processing subscription renewals:', error);
        throw error;
    }
};

// Renew individual subscription
const renewSubscription = async (subscription) => {
    try {
        const planConfig = PLAN_CONFIGS[subscription.planType];
        const now = new Date();
        const newPeriodEnd = new Date(subscription.currentPeriodEnd);

        // Extend period based on billing cycle
        if (subscription.billingCycle === 'yearly') {
            newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
        } else {
            newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
        }

        // Update subscription
        subscription.currentPeriodStart = subscription.currentPeriodEnd;
        subscription.currentPeriodEnd = newPeriodEnd;
        subscription.status = 'active';
        subscription.credits.monthly = planConfig.credits;
        subscription.credits.used = 0;
        subscription.credits.resetDate = now;
        subscription.metadata.lastBillingAttempt = now;
        subscription.metadata.failedPaymentCount = 0;

        await subscription.save();

        // Update platform credits
        await Platform.findOneAndUpdate(
            { userId: subscription.userId },
            { remainingCredits: planConfig.credits }
        );

        // Send renewal notification
        try {
            await sendSubscriptionRenewalNotification({
                recipientEmail: subscription.userId.email,
                recipientName: subscription.userId.name,
                planType: subscription.planType,
                renewalDate: newPeriodEnd,
                creditsReset: planConfig.credits
            });
        } catch (emailError) {
            console.error('Failed to send renewal notification:', emailError);
        }

        console.log(`✅ Subscription ${subscription._id} renewed successfully`);
        return subscription;
    } catch (error) {
        console.error(`❌ Failed to renew subscription ${subscription._id}:`, error);
        throw error;
    }
};

// Send expiry warnings
export const sendExpiryWarnings = async () => {
    try {
        console.log('⚠️ Checking for subscription expiry warnings...');
        
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        // Find subscriptions expiring in 3 days
        const expiringSubscriptions = await Subscription.find({
            currentPeriodEnd: { $lte: threeDaysFromNow, $gte: now },
            status: 'active',
            'metadata.lastWarningDate': { $ne: now.toDateString() }
        }).populate('userId', 'name email');

        console.log(`Found ${expiringSubscriptions.length} subscriptions needing warnings`);

        for (const subscription of expiringSubscriptions) {
            try {
                await sendSubscriptionExpiryWarning({
                    recipientEmail: subscription.userId.email,
                    recipientName: subscription.userId.name,
                    planType: subscription.planType,
                    expiryDate: subscription.currentPeriodEnd,
                    daysRemaining: Math.ceil((subscription.currentPeriodEnd - now) / (1000 * 60 * 60 * 24))
                });

                // Mark warning as sent
                subscription.metadata.lastWarningDate = now.toDateString();
                await subscription.save();

                console.log(`⚠️ Expiry warning sent to ${subscription.userId.email}`);
            } catch (error) {
                console.error(`Failed to send warning to ${subscription.userId.email}:`, error);
            }
        }

        return { warningsSent: expiringSubscriptions.length };
    } catch (error) {
        console.error('Error sending expiry warnings:', error);
        throw error;
    }
};

// Reset monthly credits
export const resetMonthlyCredits = async () => {
    try {
        console.log('🔄 Resetting monthly credits...');
        
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Find subscriptions that need credit reset
        const subscriptionsToReset = await Subscription.find({
            'credits.resetDate': { $lt: firstDayOfMonth },
            status: 'active'
        });

        console.log(`Found ${subscriptionsToReset.length} subscriptions needing credit reset`);

        for (const subscription of subscriptionsToReset) {
            try {
                const planConfig = PLAN_CONFIGS[subscription.planType];
                
                subscription.credits.monthly = planConfig.credits;
                subscription.credits.used = 0;
                subscription.credits.resetDate = now;
                await subscription.save();

                // Update platform credits
                await Platform.findOneAndUpdate(
                    { userId: subscription.userId },
                    { remainingCredits: planConfig.credits }
                );

                console.log(`✅ Credits reset for subscription ${subscription._id}`);
            } catch (error) {
                console.error(`Failed to reset credits for subscription ${subscription._id}:`, error);
            }
        }

        return { creditsReset: subscriptionsToReset.length };
    } catch (error) {
        console.error('Error resetting monthly credits:', error);
        throw error;
    }
};

// Handle expired subscriptions
export const handleExpiredSubscriptions = async () => {
    try {
        console.log('🚫 Handling expired subscriptions...');
        
        const now = new Date();

        // Find expired subscriptions
        const expiredSubscriptions = await Subscription.find({
            currentPeriodEnd: { $lt: now },
            status: { $in: ['active', 'past_due'] }
        }).populate('userId', 'name email');

        console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

        for (const subscription of expiredSubscriptions) {
            try {
                // Downgrade to free plan
                const freeConfig = PLAN_CONFIGS.free;
                
                subscription.planType = 'free';
                subscription.status = 'expired';
                subscription.features = {
                    maxBots: freeConfig.maxBots,
                    maxConversations: freeConfig.maxConversations,
                    maxTeamMembers: freeConfig.maxTeamMembers,
                    hasAnalytics: freeConfig.hasAnalytics,
                    hasIntegrations: freeConfig.hasIntegrations,
                    hasPrioritySupport: freeConfig.hasPrioritySupport,
                    hasCustomBranding: freeConfig.hasCustomBranding
                };
                subscription.credits.monthly = freeConfig.credits;
                subscription.credits.used = 0;
                subscription.metadata.downgradedFrom = subscription.planType;

                await subscription.save();

                // Update platform credits
                await Platform.findOneAndUpdate(
                    { userId: subscription.userId },
                    { remainingCredits: freeConfig.credits }
                );

                console.log(`⬇️ Subscription ${subscription._id} downgraded to free plan`);
            } catch (error) {
                console.error(`Failed to handle expired subscription ${subscription._id}:`, error);
            }
        }

        return { expired: expiredSubscriptions.length };
    } catch (error) {
        console.error('Error handling expired subscriptions:', error);
        throw error;
    }
};

// Get subscription by user ID
export const getSubscriptionByUserId = async (userId) => {
    try {
        let subscription = await Subscription.findOne({ userId });
        
        if (!subscription) {
            // Create default free subscription
            subscription = await createOrUpdateSubscription(userId, 'free');
        }
        
        return subscription;
    } catch (error) {
        console.error('Error getting subscription:', error);
        throw error;
    }
};

// Check subscription limits
export const checkSubscriptionLimits = async (userId, action) => {
    try {
        const subscription = await getSubscriptionByUserId(userId);
        
        switch (action) {
            case 'create_bot':
                if (subscription.features.maxBots !== -1) {
                    // Count user's bots
                    const platform = await Platform.findOne({ userId });
                    if (platform) {
                        const botCount = await mongoose.model('BotConfig').countDocuments({ platFormId: platform._id });
                        if (botCount >= subscription.features.maxBots) {
                            return { allowed: false, reason: 'Bot limit reached', limit: subscription.features.maxBots };
                        }
                    }
                }
                break;
                
            case 'send_message':
                if (subscription.getRemainingCredits() <= 0) {
                    return { allowed: false, reason: 'Credit limit reached', remaining: 0 };
                }
                break;
                
            case 'invite_team_member':
                // This would need to count team members across all bots
                break;
        }
        
        return { allowed: true, subscription };
    } catch (error) {
        console.error('Error checking subscription limits:', error);
        return { allowed: false, reason: 'Error checking limits' };
    }
};

// Use credit
export const useCredit = async (userId, amount = 1) => {
    try {
        const subscription = await Subscription.findOne({ userId });
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (subscription.getRemainingCredits() < amount) {
            throw new Error('Insufficient credits');
        }

        subscription.credits.used += amount;
        await subscription.save();

        // Also update platform credits for backward compatibility
        await Platform.findOneAndUpdate(
            { userId },
            { $inc: { remainingCredits: -amount } }
        );

        return subscription;
    } catch (error) {
        console.error('Error using credit:', error);
        throw error;
    }
};