import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'viewer'],
        default: 'viewer'
    },
    avatar: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'inactive'],
        default: 'pending'
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

const TeamSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BotConfig',
        required: true,
        unique: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [TeamMemberSchema],
    settings: {
        allowInvites: {
            type: Boolean,
            default: true
        },
        maxMembers: {
            type: Number,
            default: 10
        },
        defaultRole: {
            type: String,
            enum: ['editor', 'viewer'],
            default: 'viewer'
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Team', TeamSchema);