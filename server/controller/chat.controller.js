import Session from '../models/Session.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import Platform from '../models/Platform.schema.js';
import { getChatResponse } from '../services/gemini.js';
import SessionSchema from '../models/Session.schema.js';
import { queryVectorData } from '../services/vectorServices.js';
import { updateBotStats } from './stats.controller.js';

export const AiChatController = async (req, res) => {
    try {
        const { message, botId, sessionId } = req.body;

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

        if (platform.remainingCredits < 1) {
            return res.status(402).json({ message: 'Insufficient credits' });
        }
        // Deduct platform credits
        platform.remainingCredits -= 1;
        await platform.save();

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