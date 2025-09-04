import mongoose from "mongoose";


const BotConfigSchema = new mongoose.Schema({
    platFormId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Platform',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    typography: {
        type: String,
    },
    welcomeMessage: {
        type: String,
        default: 'Hello, how can I help you today?'
    },
    popupMessage:{
        type: String,
        default: 'hey there! I am here to assist you. How can I help?'
    },
    primaryColour: {
        type: String,
        default: '#000000'
    },
    secondaryColour: {
        type: String,
        default: '#FFFFFF'
    },
    backgroundColour: {
        type: String,
        default: '#F0F0F0'
    },
    trainingData: {
        type: String,
    },
    discription: {
        type: String,
    },
    icon: {
        type: String,
        required: true
    },
    userIcon: {
        type: String,
        default: 'https://arcai.fun/assets/logo-CrKFoPSZ.png',
    },
    systemPrompt: {
        type: String,
        default: "you are a cute chatbot"
    },
    welcomeMessage: {
        type: String,
        default: 'Hello, how can I help you today?'
    },
    customQuestions: {
        type: [String],
        default: []
    },
    // UI Configuration fields
    selectedPalette: {
        type: Number,
        default: 0
    },
    isCustomColorMode: {
        type: Boolean,
        default: false
    },
    chatPosition: {
        type: String,
        default: 'bottom-right'
    },
    chatSize: {
        type: String,
        default: 'medium'
    },
    animationStyle: {
        type: String,
        default: 'slide-up'
    },
    enableSounds: {
        type: Boolean,
        default: true
    },
    enableTypingIndicator: {
        type: Boolean,
        default: true
    },
    enableQuickReplies: {
        type: Boolean,
        default: true
    },
    enableHistory: {
        type: Boolean,
        default: true
    },
    enableFAQ: {
        type: Boolean,
        default: true
    },
    enableHandover: {
        type: Boolean,
        default: true
    },
    enableLeadCapture: {
        type: Boolean,
        default: true
    },
    leadCaptureMessage: {
        type: String,
        default: 'To provide you with the best support, could you please share some details?'
    },
    handoverMessage: {
        type: String,
        default: 'Let me connect you with a human agent who can better assist you.'
    },
    headerTitle: {
        type: String,
        default: 'Chat Support'
    },
    headerSubtitle: {
        type: String,
        default: 'We\'re here to help'
    },
    placeholder: {
        type: String,
        default: 'Type your message...'
    },
    companyName: {
        type: String,
        default: 'CustomerBot'
    },
    supportEmail: {
        type: String,
        default: 'support@customerbot.com'
    },
    businessHours: {
        type: String,
        default: '9 AM - 6 PM EST'
    },
    responseTime: {
        type: String,
        default: '< 2 minutes'
    },
    showBranding: {
        type: Boolean,
        default: true
    },
    customCSS: {
        type: String,
        default: ''
    },
    borderRadius: {
        type: String,
        default: '12px'
    },
    shadowIntensity: {
        type: String,
        default: 'medium'
    },
    messageHistoryLimit: {
        type: Number,
        default: 100
    },
    typingDelay: {
        type: Number,
        default: 1500
    },
    enableRateLimit: {
        type: Boolean,
        default: true
    },
    maxMessageLength: {
        type: Number,
        default: 500
    },
    messageAlignment: {
        type: String,
        default: 'default'
    },
    autoOpenDelay: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

export default mongoose.model('BotConfig', BotConfigSchema);
