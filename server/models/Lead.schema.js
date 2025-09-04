import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BotConfig',
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true
    },
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    company: {
        type: String,
        default: null
    },
    source: {
        type: String,
        enum: ['website_chat', 'mobile_app', 'api', 'widget'],
        default: 'website_chat'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        default: ''
    },
    capturedAt: {
        type: Date,
        default: Date.now
    },
    lastContactedAt: {
        type: Date,
        default: null
    },
    convertedAt: {
        type: Date,
        default: null
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    leadScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    customFields: {
        type: Map,
        of: String,
        default: {}
    },
    conversationData: {
        totalMessages: {
            type: Number,
            default: 0
        },
        lastMessage: {
            type: String,
            default: ''
        },
        sentiment: {
            type: String,
            enum: ['positive', 'neutral', 'negative'],
            default: 'neutral'
        },
        topics: [{
            type: String
        }]
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        referrer: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        country: String,
        city: String
    }
}, {
    timestamps: true
});

// Indexes for better query performance
LeadSchema.index({ botId: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ capturedAt: -1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ leadScore: -1 });

// Virtual for lead age
LeadSchema.virtual('ageInDays').get(function() {
    const now = new Date();
    const diffTime = now - this.capturedAt;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to calculate lead score
LeadSchema.methods.calculateLeadScore = function() {
    let score = 50; // Base score
    
    // Add points for contact information
    if (this.email) score += 20;
    if (this.phone) score += 15;
    if (this.name) score += 10;
    if (this.company) score += 15;
    
    // Add points for engagement
    if (this.conversationData.totalMessages > 5) score += 10;
    if (this.conversationData.totalMessages > 10) score += 10;
    
    // Adjust for sentiment
    if (this.conversationData.sentiment === 'positive') score += 10;
    if (this.conversationData.sentiment === 'negative') score -= 10;
    
    // Adjust for recency
    const ageInDays = this.ageInDays;
    if (ageInDays <= 1) score += 10;
    else if (ageInDays <= 7) score += 5;
    else if (ageInDays > 30) score -= 10;
    
    this.leadScore = Math.max(0, Math.min(100, score));
    return this.leadScore;
};

export default mongoose.model('Lead', LeadSchema);