import mongoose from "mongoose";

const PlatformConfigSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    trainingData: {
        type: String,
    },
    remainingCredits: {
        type: Number,
        required: true
    },
    icon: {
        type: String,
    }
});

export default mongoose.model('platforms', PlatformConfigSchema);