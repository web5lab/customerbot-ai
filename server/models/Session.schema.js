import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'bot'],
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ChatSession', sessionSchema);