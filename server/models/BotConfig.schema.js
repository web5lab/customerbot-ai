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
    themeMode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
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
}, {
    timestamps: true,
});

export default mongoose.model('BotConfig', BotConfigSchema);
