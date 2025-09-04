import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'bot', 'system', 'agent'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['typing', 'swap', null],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  botId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BotConfig',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  lastMessage: {
    type: String,
    required: true
  },
  messageCount: {
    type: Number,
    default: 0
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'resolved', 'pending'],
    default: 'active'
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  needsHumanSupport: {
    type: Boolean,
    default: false
  },
  humanSupportRequestedAt: {
    type: Date,
    default: null
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  agentJoinedAt: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
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
  customerEmail: {
    type: String,
    default: null
  },
  customerName: {
    type: String,
    default: null
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      default: null
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ChatSession', sessionSchema);