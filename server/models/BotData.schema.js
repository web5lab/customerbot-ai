import mongoose from "mongoose";

const BotDataSchema = new mongoose.Schema({
    botConfigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BotConfig',
        required: true
    },
    websiteUrls: [{
        url: {
            type: String,
            required: true
        },
        data: {
            type: String,
            required: true
        }
    }],
    faqs: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
    pdfData: [{
        fileName: {
            type: String,
            required: true
        },
        data: {
            type: String,
            required: true
        }
    }],
    textData:{
        type: String,
        required: true
    }
});

export default mongoose.model('BotData', BotDataSchema);