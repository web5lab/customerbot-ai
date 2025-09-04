import cron from 'node-cron';
import { 
    processSubscriptionRenewals, 
    sendExpiryWarnings, 
    resetMonthlyCredits, 
    handleExpiredSubscriptions 
} from './subscriptionService.js';

// Initialize all cron jobs
export const initializeCronJobs = () => {
    console.log('🕐 Initializing cron jobs...');

    // Daily subscription management at 2 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('🌅 Running daily subscription management...');
        try {
            // Process renewals
            const renewalResults = await processSubscriptionRenewals();
            console.log(`✅ Processed ${renewalResults.processed} subscription renewals`);

            // Handle expired subscriptions
            const expiredResults = await handleExpiredSubscriptions();
            console.log(`✅ Handled ${expiredResults.expired} expired subscriptions`);

            // Send expiry warnings
            const warningResults = await sendExpiryWarnings();
            console.log(`✅ Sent ${warningResults.warningsSent} expiry warnings`);

        } catch (error) {
            console.error('❌ Error in daily subscription management:', error);
        }
    }, {
        timezone: "UTC"
    });

    // Monthly credit reset on 1st day of month at 1 AM
    cron.schedule('0 1 1 * *', async () => {
        console.log('📅 Running monthly credit reset...');
        try {
            const resetResults = await resetMonthlyCredits();
            console.log(`✅ Reset credits for ${resetResults.creditsReset} subscriptions`);
        } catch (error) {
            console.error('❌ Error in monthly credit reset:', error);
        }
    }, {
        timezone: "UTC"
    });

    // Hourly health check and cleanup
    cron.schedule('0 * * * *', async () => {
        console.log('🔍 Running hourly health check...');
        try {
            // Check for subscriptions that need immediate attention
            const now = new Date();
            const expiredCount = await mongoose.model('Subscription').countDocuments({
                currentPeriodEnd: { $lt: now },
                status: 'active'
            });

            if (expiredCount > 0) {
                console.log(`⚠️ Found ${expiredCount} subscriptions that need immediate attention`);
                await handleExpiredSubscriptions();
            }

            // Log system health
            const totalSubscriptions = await mongoose.model('Subscription').countDocuments();
            const activeSubscriptions = await mongoose.model('Subscription').countDocuments({ status: 'active' });
            
            console.log(`📊 System Health: ${activeSubscriptions}/${totalSubscriptions} active subscriptions`);

        } catch (error) {
            console.error('❌ Error in hourly health check:', error);
        }
    }, {
        timezone: "UTC"
    });

    // Weekly subscription analytics (Sundays at 3 AM)
    cron.schedule('0 3 * * 0', async () => {
        console.log('📈 Running weekly subscription analytics...');
        try {
            const stats = await generateSubscriptionStats();
            console.log('📊 Weekly Stats:', stats);
        } catch (error) {
            console.error('❌ Error in weekly analytics:', error);
        }
    }, {
        timezone: "UTC"
    });

    console.log('✅ All cron jobs initialized successfully');
};

// Generate subscription statistics
const generateSubscriptionStats = async () => {
    try {
        const totalSubscriptions = await mongoose.model('Subscription').countDocuments();
        const activeSubscriptions = await mongoose.model('Subscription').countDocuments({ status: 'active' });
        const trialSubscriptions = await mongoose.model('Subscription').countDocuments({ status: 'trialing' });
        const expiredSubscriptions = await mongoose.model('Subscription').countDocuments({ status: 'expired' });
        
        const planDistribution = await mongoose.model('Subscription').aggregate([
            { $group: { _id: '$planType', count: { $sum: 1 } } }
        ]);

        const stats = {
            total: totalSubscriptions,
            active: activeSubscriptions,
            trial: trialSubscriptions,
            expired: expiredSubscriptions,
            planDistribution: planDistribution.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            generatedAt: new Date().toISOString()
        };

        return stats;
    } catch (error) {
        console.error('Error generating subscription stats:', error);
        throw error;
    }
};

// Stop all cron jobs (useful for testing or shutdown)
export const stopAllCronJobs = () => {
    cron.getTasks().forEach(task => task.stop());
    console.log('🛑 All cron jobs stopped');
};

// Get cron job status
export const getCronJobStatus = () => {
    const tasks = cron.getTasks();
    return {
        totalJobs: tasks.size,
        runningJobs: Array.from(tasks.values()).filter(task => task.running).length,
        status: 'active'
    };
};