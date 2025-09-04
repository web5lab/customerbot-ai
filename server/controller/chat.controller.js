import Session from '../models/Session.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import Platform from '../models/Platform.schema.js';
import { getChatResponse } from '../services/gemini.js';
import SessionSchema from '../models/Session.schema.js';
import { queryVectorData } from '../services/vectorServices.js';
import { updateBotStats } from './stats.controller.js';
import { useCredit, checkSubscriptionLimits } from '../services/subscriptionService.js';
import Lead from '../models/Lead.schema.js';
import { notifyAgents, notifySession } from '../services/socketService.js';
import mongoose from 'mongoose';

export const AiChatController = async (req, res) => {
    try {
        const { message, botId, sessionId, leadData } = req.body;
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

        // Handle lead capture if lead data is provided
        if (leadData && (leadData.email || leadData.name || leadData.phone)) {
            try {
                // Check if lead already exists for this session
                let existingLead = await Lead.findOne({ sessionId: session._id });
                
                if (existingLead) {
                    // Update existing lead with new information
                    if (leadData.name) existingLead.name = leadData.name;
                    if (leadData.email) existingLead.email = leadData.email;
                    if (leadData.phone) existingLead.phone = leadData.phone;
                    if (leadData.company) existingLead.company = leadData.company;
                    
                    existingLead.calculateLeadScore();
                    await existingLead.save();
                } else {
                    // Create new lead
                    const newLead = new Lead({
                        botId,
                        sessionId: session._id,
                        ...leadData,
                        source: 'website_chat',
                        conversationData: {
                            totalMessages: session.messageCount,
                            lastMessage: aiResponse
                        }
                    });
                    newLead.calculateLeadScore();
                    await newLead.save();
                }
            } catch (leadError) {
                console.error('Error handling lead capture:', leadError);
                // Don't fail the chat if lead capture fails
            }
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

// Request human support
export const requestHumanSupport = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message, customerInfo } = req.body;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const session = await SessionSchema.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Update session
        session.needsHumanSupport = true;
        session.status = 'pending';
        session.humanSupportRequestedAt = new Date();
        
        // Update customer info if provided
        if (customerInfo) {
            if (customerInfo.name) session.customerName = customerInfo.name;
            if (customerInfo.email) session.customerEmail = customerInfo.email;
        }

        // Add system message
        session.messages.push({
            role: 'system',
            content: 'Customer has requested human support. An agent will join shortly.',
            timestamp: new Date()
        });

        // Add customer message if provided
        if (message) {
            session.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });
            session.lastMessage = message;
        }

        session.messageCount = session.messages.length;
        await session.save();

        // Notify agents via Socket.IO
        notifyAgents(session.botId, 'support-request', {
            sessionId,
            customerMessage: message,
            customerInfo,
            session: {
                _id: session._id,
                title: session.title,
                lastMessage: session.lastMessage,
                messageCount: session.messageCount,
                timestamp: session.timestamp,
                customerName: session.customerName,
                customerEmail: session.customerEmail
            },
            timestamp: new Date()
        });

        res.status(200).json({
            message: 'Human support requested successfully',
            estimatedWaitTime: '2-5 minutes',
            session
        });
    } catch (error) {
        console.error('Error requesting human support:', error);
        res.status(500).json({
            error: 'Error requesting human support',
            details: error.message
        });
    }
};

// Get active support sessions for agents
export const getActiveSupportSessions = async (req, res) => {
    try {
        const { botId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        // Verify user has access to this bot
        const team = await mongoose.model('Team').findOne({
            botId,
            'members.userId': userId,
            'members.status': 'active'
        });

        if (!team) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get sessions needing human support
        const sessions = await SessionSchema.find({
            botId,
            needsHumanSupport: true,
            status: { $in: ['pending', 'active'] }
        }).populate('assignedAgent', 'name email')
          .sort({ humanSupportRequestedAt: 1 }); // Oldest first

        res.status(200).json({ sessions });
    } catch (error) {
        console.error('Error fetching support sessions:', error);
        res.status(500).json({
            error: 'Error fetching support sessions',
            details: error.message
        });
    }
};

// Get all active sessions for agents to join proactively
export const getAllActiveSessions = async (req, res) => {
    try {
        const { botId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        // Verify user has access to this bot
        const team = await mongoose.model('Team').findOne({
            botId,
            'members.userId': userId,
            'members.status': 'active'
        });

        if (!team) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get all active sessions (not assigned to any agent yet)
        const sessions = await SessionSchema.find({
            botId,
            status: 'active',
            assignedAgent: null,
            messageCount: { $gt: 0 } // Only sessions with messages
        }).sort({ timestamp: -1 }); // Newest first

        res.status(200).json({ sessions });
    } catch (error) {
        console.error('Error fetching all active sessions:', error);
        res.status(500).json({
            error: 'Error fetching all active sessions',
            details: error.message
        });
    }
};
// Assign agent to session
export const assignAgentToSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const session = await SessionSchema.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Verify user has access to this bot
        const team = await mongoose.model('Team').findOne({
            botId: session.botId,
            'members.userId': userId,
            'members.status': 'active'
        });

        if (!team) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if session is already assigned
        if (session.assignedAgent && session.assignedAgent.toString() !== userId) {
            return res.status(400).json({ message: 'Session already assigned to another agent' });
        }

        // Assign agent
        session.assignedAgent = userId;
        session.status = 'active';
        session.agentJoinedAt = new Date();

        const user = await mongoose.model('User').findById(userId);
        
        // Add system message
        session.messages.push({
            role: 'agent',
            content: `${user.name} has joined the conversation`,
            timestamp: new Date()
        });

        session.messageCount = session.messages.length;
        await session.save();

        // Notify via Socket.IO
        notifySession(sessionId, 'agent-joined', {
            agentName: user.name,
            agentId: userId,
            message: `${user.name} has joined the conversation`,
            timestamp: new Date()
        });

        notifyAgents(session.botId, 'session-taken', {
            sessionId,
            agentName: user.name,
            agentId: userId
        });

        res.status(200).json({
            message: 'Agent assigned successfully',
            session
        });
    } catch (error) {
        console.error('Error assigning agent:', error);
        res.status(500).json({
            error: 'Error assigning agent',
            details: error.message
        });
    }
};
// Send message as agent
export const sendAgentMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const session = await SessionSchema.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Verify agent is assigned to this session
        if (session.assignedAgent?.toString() !== userId) {
            return res.status(403).json({ message: 'You are not assigned to this session' });
        }

        const user = await mongoose.model('User').findById(userId);
        
        // Add message to session
        const newMessage = {
            role: 'agent',
            content: message,
            timestamp: new Date(),
            senderId: userId,
            senderName: user.name
        };

        session.messages.push(newMessage);
        session.lastMessage = message;
        session.messageCount = session.messages.length;
        session.lastActivity = new Date();
        await session.save();

        // Notify via Socket.IO
        notifySession(sessionId, 'new-message', {
            sessionId,
            message: newMessage,
            timestamp: new Date()
        });

        res.status(200).json({
            message: 'Message sent successfully',
            session
        });
    } catch (error) {
        console.error('Error sending agent message:', error);
        res.status(500).json({
            error: 'Error sending message',
            details: error.message
        });
    }
};

// Get agent's active sessions
export const getAgentActiveSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { botId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        // Verify user has access to this bot
        const team = await mongoose.model('Team').findOne({
            botId,
            'members.userId': userId,
            'members.status': 'active'
        });

        if (!team) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get sessions assigned to this agent
        const sessions = await SessionSchema.find({
            botId,
            assignedAgent: userId,
            status: { $in: ['active', 'pending'] }
        }).sort({ lastActivity: -1 });

        res.status(200).json({ sessions });
    } catch (error) {
        console.error('Error fetching agent sessions:', error);
        res.status(500).json({
            error: 'Error fetching agent sessions',
            details: error.message
        });
    }
};

// Delete session
export const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if user has permission to delete this session
        // Either the user owns the bot or is a team member with appropriate permissions
        const bot = await BotConfig.findById(session.botId);
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        const platform = await Platform.findById(bot.platFormId);
        const isOwner = platform && platform.userId.toString() === userId;

        if (!isOwner) {
            // Check if user is a team member with admin/editor role
            const team = await mongoose.model('Team').findOne({
                botId: session.botId,
                'members.userId': userId,
                'members.status': 'active',
                'members.role': { $in: ['admin', 'editor'] }
            });

            if (!team) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // Delete the session
        await Session.findByIdAndDelete(sessionId);

        // Also delete any associated leads
        await mongoose.model('Lead').deleteMany({ sessionId });

        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({
            error: 'Error deleting session',
            details: error.message
        });
    }
};