import Session from '../models/Session.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import Platform from '../models/Platform.schema.js';
import { getChatResponse } from '../services/gemini.js';
import SessionSchema from '../models/Session.schema.js';
import { queryVectorData } from '../services/vectorServices.js';
import { updateBotStats } from './stats.controller.js';
import { useCredit, checkSubscriptionLimits } from '../services/subscriptionService.js';

export const AiChatController = async (req, res) => {
    try {
        const { message, botId, sessionId } = req.body;
        const userId = req.user?.userId;

        // Find bot configuration
        const bot = await BotConfig.findById(botId);
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        // Find platform associated with the bot
        const platform = await Platform.findById(bot.platFormId);
        if (!platform) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        // Check subscription limits before processing
        if (userId) {
            const limitCheck = await checkSubscriptionLimits(userId, 'send_message');
            if (!limitCheck.allowed) {
                return res.status(402).json({ 
                    message: limitCheck.reason,
                    limit: limitCheck.limit || limitCheck.remaining
                });
            }
        } else {
            // For non-authenticated users, check platform credits
            if (platform.remainingCredits < 1) {
                return res.status(402).json({ message: 'Insufficient credits' });
            }
        }

        // Retrieve or create session
        let session = sessionId ? await Session.findById(sessionId) : null;
        if (!session) {
            session = new Session({
                botId:botId, 
                title: `Chat with ${bot.name}`,
                lastMessage: message,
                messages: [],
                messageCount: 0
            });
        }

        // Append user message
        session.messages.push({ role: 'user', content: message, status: null });

        // Retrieve last 10 messages for context
        const chatHistory = session.messages.slice(-10);

        // let knowledgeBase = await queryVectorData({botId: botId, query: message, limit: 5});
        let knowledgeBase = [];
        // Get AI response with chat history
        const aiResponse = await getChatResponse(message, chatHistory , bot.systemPrompt , knowledgeBase);

        // Append AI response
        session.messages.push({ role: 'bot', content: aiResponse, status: null });

        // Update session metadata
        session.lastMessage = aiResponse;
        session.messageCount = session.messages.length;
        await session.save();

        // Use credit from subscription system
        if (userId) {
            try {
                await useCredit(userId, 1);
                console.log(`Credit used for user ${userId}: 1 credit deducted`);
            } catch (creditError) {
                console.error('Error using credit:', creditError);
                // If subscription credit fails, try platform credit as fallback
                if (platform.remainingCredits >= 1) {
                    platform.remainingCredits -= 1;
                    await platform.save();
                    console.log(`Fallback: Platform credit used for user ${userId}`);
                } else {
                    return res.status(402).json({ message: 'Insufficient credits' });
                }
            }
        } else {
            // Fallback to platform credits for non-authenticated users
            platform.remainingCredits -= 1;
            await platform.save();
            console.log(`Platform credit used for anonymous user: 1 credit deducted`);
        }

        // Update bot statistics
        try {
            await updateBotStats(botId);
        } catch (statsError) {
            console.error('Error updating stats:', statsError);
            // Don't fail the chat if stats update fails
        }

        res.status(201).json({
            message: 'Message sent',
            aiResponse,
            sessionId: session._id,
            chatHistory: session.messages.slice(-10) // Return last 10 messages for frontend
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Error sending message',
            details: error.message
        });
    }
};

export const AiChatSessions = async (req, res) => {
    try {
        const {botId} = req.params;
        const sessions = await SessionSchema.find({botId: botId}) || [];
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({
            error: 'Error fetching sessions',
            details: error.message
        });
    }
}

export const AiChatSession = async (req, res) => {
    try {
        const {sessionId} = req.params;
        const sessions = await SessionSchema.findOne({_id: sessionId}) || [];
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({
            error: 'Error fetching sessions',
            details: error.message
        });
    }
}

export const markSessionAsResolved = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { rating, feedback } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const session = await SessionSchema.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Update session status
        session.status = 'resolved';
        session.resolvedAt = new Date();
        session.resolvedBy = userId;
        
        // Add satisfaction rating if provided
        if (rating) {
            session.satisfaction.rating = rating;
        }
        if (feedback) {
            session.satisfaction.feedback = feedback;
        }

        await session.save();

        res.status(200).json({
            message: 'Session marked as resolved',
            session
        });
    } catch (error) {
        console.error('Error marking session as resolved:', error);
        res.status(500).json({
            error: 'Error marking session as resolved',
            details: error.message
        });
    }
};

export const updateSessionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status, priority, tags, customerEmail, customerName } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const session = await SessionSchema.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Update fields if provided
        if (status) session.status = status;
        if (priority) session.priority = priority;
        if (tags) session.tags = tags;
        if (customerEmail) session.customerEmail = customerEmail;
        if (customerName) session.customerName = customerName;

        // If marking as resolved, set resolved fields
        if (status === 'resolved') {
            session.resolvedAt = new Date();
            session.resolvedBy = userId;
        }

        await session.save();

        res.status(200).json({
            message: 'Session updated successfully',
            session
        });
    } catch (error) {
        console.error('Error updating session status:', error);
        res.status(500).json({
            error: 'Error updating session status',
            details: error.message
        });
    }
};