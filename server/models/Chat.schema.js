import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
  },
  botId:{
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'support'],
    default: 'general'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
});

export default mongoose.model('Chat', chatSchema);