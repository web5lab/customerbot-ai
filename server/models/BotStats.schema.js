import mongoose from "mongoose";

const BotStatsSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BotConfig',
        required: true,
        unique: true
    },
    totalConversations: {
        type: Number,
        default: 0
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    activeUsers: {
        type: Number,
        default: 0
    },
    averageResponseTime: {
        type: Number,
        default: 0 // in milliseconds
    },
    resolutionRate: {
        type: Number,
        default: 0 // percentage
    },
    dailyStats: [{
        date: {
            type: Date,
            required: true
        },
        conversations: {
            type: Number,
            default: 0
        },
        messages: {
            type: Number,
            default: 0
        },
        uniqueUsers: {
            type: Number,
            default: 0
        },
        avgResponseTime: {
            type: Number,
            default: 0
        }
    }],
    monthlyStats: [{
        month: {
            type: Number,
            required: true // 1-12
        },
        year: {
            type: Number,
            required: true
        },
        conversations: {
            type: Number,
            default: 0
        },
        messages: {
            type: Number,
            default: 0
        },
        uniqueUsers: {
            type: Number,
            default: 0
        },
        avgResponseTime: {
            type: Number,
            default: 0
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
BotStatsSchema.index({ botId: 1 });
BotStatsSchema.index({ 'dailyStats.date': 1 });
BotStatsSchema.index({ 'monthlyStats.year': 1, 'monthlyStats.month': 1 });

export default mongoose.model('BotStats', BotStatsSchema);