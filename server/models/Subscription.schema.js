import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    planType: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
        default: 'active'
    },
    currentPeriodStart: {
        type: Date,
        default: Date.now
    },
    currentPeriodEnd: {
        type: Date,
        required: true
    },
    trialEnd: {
        type: Date,
        default: null
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    stripeSubscriptionId: {
        type: String,
        default: null
    },
    priceId: {
        type: String,
        default: null
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    credits: {
        monthly: {
            type: Number,
            default: 100
        },
        used: {
            type: Number,
            default: 0
        },
        resetDate: {
            type: Date,
            default: Date.now
        }
    },
    features: {
        maxBots: {
            type: Number,
            default: 1
        },
        maxConversations: {
            type: Number,
            default: 100
        },
        maxTeamMembers: {
            type: Number,
            default: 1
        },
        hasAnalytics: {
            type: Boolean,
            default: false
        },
        hasIntegrations: {
            type: Boolean,
            default: false
        },
        hasPrioritySupport: {
            type: Boolean,
            default: false
        },
        hasCustomBranding: {
            type: Boolean,
            default: false
        }
    },
    paymentHistory: [{
        amount: Number,
        currency: {
            type: String,
            default: 'usd'
        },
        status: {
            type: String,
            enum: ['succeeded', 'failed', 'pending', 'refunded']
        },
        stripePaymentIntentId: String,
        paidAt: {
            type: Date,
            default: Date.now
        },
        description: String
    }],
    metadata: {
        lastBillingAttempt: Date,
        failedPaymentCount: {
            type: Number,
            default: 0
        },
        downgradedFrom: String,
        upgradedAt: Date,
        cancellationReason: String,
        cancellationDate: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });
SubscriptionSchema.index({ 'credits.resetDate': 1 });

// Virtual for days until renewal
SubscriptionSchema.virtual('daysUntilRenewal').get(function() {
    const now = new Date();
    const diffTime = this.currentPeriodEnd - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if subscription is active
SubscriptionSchema.methods.isActive = function() {
    return this.status === 'active' && this.currentPeriodEnd > new Date();
};

// Method to check if in trial period
SubscriptionSchema.methods.isInTrial = function() {
    return this.status === 'trialing' && this.trialEnd && this.trialEnd > new Date();
};

// Method to get remaining credits
SubscriptionSchema.methods.getRemainingCredits = function() {
    return Math.max(0, this.credits.monthly - this.credits.used);
};

export default mongoose.model('Subscription', SubscriptionSchema);