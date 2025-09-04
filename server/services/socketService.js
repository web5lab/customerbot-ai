import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Session from '../models/Session.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import User from '../models/User.schema.js';
import Team from '../models/Team.schema.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId || decoded.id);
                socket.userId = user._id.toString();
                socket.user = user;
            }
            next();
        } catch (err) {
            // Allow anonymous connections for public chat
            next();
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}, User: ${socket.userId || 'Anonymous'}`);

        // Join session room
        socket.on('join-session', async (data) => {
            const { sessionId, botId } = data;
            
            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                socket.sessionId = sessionId;
                socket.botId = botId;
                socket.join(`session-${sessionId}`);
                
                console.log(`Socket ${socket.id} joined session ${sessionId}`);
                
                // Notify support agents that a customer is in the session
                if (!socket.userId) {
                    socket.to(`bot-${botId}-agents`).emit('customer-joined', {
                        sessionId,
                        customerSocketId: socket.id,
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Error joining session:', error);
                socket.emit('error', { message: 'Failed to join session' });
            }
        });

        // Join as support agent
        socket.on('join-as-agent', async (data) => {
            const { botId } = data;
            
            if (!socket.userId) {
                socket.emit('error', { message: 'Authentication required for agents' });
                return;
            }

            try {
                // Verify user has access to this bot
                const team = await Team.findOne({
                    botId,
                    'members.userId': socket.userId,
                    'members.status': 'active'
                });

                if (!team) {
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                socket.botId = botId;
                socket.join(`bot-${botId}-agents`);
                socket.isAgent = true;
                
                console.log(`Agent ${socket.user.name} joined bot ${botId}`);
                
                // Notify other agents
                socket.to(`bot-${botId}-agents`).emit('agent-joined', {
                    agentId: socket.userId,
                    agentName: socket.user.name,
                    timestamp: new Date()
                });

                // Send list of active sessions needing support
                const activeSessions = await Session.find({
                    botId,
                    status: { $in: ['active', 'pending'] },
                    needsHumanSupport: true
                }).populate('assignedAgent', 'name email');

                socket.emit('active-support-sessions', { sessions: activeSessions });
                
            } catch (error) {
                console.error('Error joining as agent:', error);
                socket.emit('error', { message: 'Failed to join as agent' });
            }
        });

        // Request human support
        socket.on('request-human-support', async (data) => {
            const { sessionId, message } = data;
            
            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Update session to indicate human support is needed
                session.needsHumanSupport = true;
                session.status = 'pending';
                session.humanSupportRequestedAt = new Date();
                
                // Add system message about human support request
                session.messages.push({
                    role: 'system',
                    content: 'Customer has requested human support. An agent will join shortly.',
                    timestamp: new Date()
                });

                if (message) {
                    session.messages.push({
                        role: 'user',
                        content: message,
                        timestamp: new Date()
                    });
                }

                session.messageCount = session.messages.length;
                session.lastMessage = message || 'Requested human support';
                await session.save();

                // Notify all agents for this bot
                io.to(`bot-${session.botId}-agents`).emit('support-request', {
                    sessionId,
                    customerMessage: message,
                    session: {
                        _id: session._id,
                        title: session.title,
                        lastMessage: session.lastMessage,
                        messageCount: session.messageCount,
                        timestamp: session.timestamp,
                        needsHumanSupport: true,
                        status: 'pending'
                    },
                    timestamp: new Date()
                });

                // Confirm to customer
                socket.emit('support-requested', {
                    message: 'Your request for human support has been received. An agent will join shortly.',
                    estimatedWaitTime: '2-5 minutes'
                });

            } catch (error) {
                console.error('Error requesting human support:', error);
                socket.emit('error', { message: 'Failed to request human support' });
            }
        });

        // Agent takes over session
        socket.on('take-session', async (data) => {
            const { sessionId } = data;
            
            if (!socket.isAgent) {
                socket.emit('error', { message: 'Only agents can take sessions' });
                return;
            }

            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Assign agent to session
                session.assignedAgent = socket.userId;
                session.status = 'active';
                session.agentJoinedAt = new Date();
                
                // Add system message
                session.messages.push({
                    role: 'system',
                    content: `${socket.user.name} has joined the conversation`,
                    timestamp: new Date()
                });

                session.messageCount = session.messages.length;
                await session.save();

                // Join the specific session room
                socket.join(`session-${sessionId}`);

                // Notify customer that agent has joined
                socket.to(`session-${sessionId}`).emit('agent-joined', {
                    agentName: socket.user.name,
                    agentId: socket.userId,
                    message: `${socket.user.name} has joined the conversation`,
                    timestamp: new Date()
                });

                // Notify other agents that session is taken
                socket.to(`bot-${session.botId}-agents`).emit('session-taken', {
                    sessionId,
                    agentName: socket.user.name,
                    agentId: socket.userId
                });

                socket.emit('session-assigned', { sessionId, session });

            } catch (error) {
                console.error('Error taking session:', error);
                socket.emit('error', { message: 'Failed to take session' });
            }
        });

        // Send message in session
        socket.on('send-message', async (data) => {
            const { sessionId, message, isAgent = false } = data;
            
            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Add message to session
                const newMessage = {
                    role: isAgent ? 'agent' : 'user',
                    content: message,
                    timestamp: new Date(),
                    senderId: socket.userId || null,
                    senderName: socket.user?.name || 'Customer'
                };

                session.messages.push(newMessage);
                session.lastMessage = message;
                session.messageCount = session.messages.length;
                session.lastActivity = new Date();
                await session.save();

                // Broadcast message to all participants in the session
                io.to(`session-${sessionId}`).emit('new-message', {
                    sessionId,
                    message: newMessage,
                    timestamp: new Date()
                });

                // If customer message and agent is assigned, notify the agent
                if (!isAgent && session.assignedAgent) {
                    io.to(`bot-${session.botId}-agents`).emit('customer-message', {
                        sessionId,
                        message: newMessage,
                        session: {
                            _id: session._id,
                            title: session.title,
                            lastMessage: session.lastMessage
                        }
                    });
                }

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Agent typing indicator
        socket.on('agent-typing', (data) => {
            const { sessionId, isTyping } = data;
            socket.to(`session-${sessionId}`).emit('agent-typing', {
                agentName: socket.user?.name,
                isTyping,
                timestamp: new Date()
            });
        });

        // Customer typing indicator
        socket.on('customer-typing', (data) => {
            const { sessionId, isTyping } = data;
            socket.to(`bot-${sessionId}-agents`).emit('customer-typing', {
                sessionId,
                isTyping,
                timestamp: new Date()
            });
        });

        // Resolve session
        socket.on('resolve-session', async (data) => {
            const { sessionId, rating, feedback } = data;
            
            if (!socket.isAgent) {
                socket.emit('error', { message: 'Only agents can resolve sessions' });
                return;
            }

            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                session.status = 'resolved';
                session.resolvedAt = new Date();
                session.resolvedBy = socket.userId;
                session.needsHumanSupport = false;
                
                if (rating) session.satisfaction.rating = rating;
                if (feedback) session.satisfaction.feedback = feedback;

                // Add system message
                session.messages.push({
                    role: 'system',
                    content: `Session resolved by ${socket.user.name}`,
                    timestamp: new Date()
                });

                session.messageCount = session.messages.length;
                await session.save();

                // Notify all participants
                io.to(`session-${sessionId}`).emit('session-resolved', {
                    sessionId,
                    resolvedBy: socket.user.name,
                    rating,
                    feedback,
                    timestamp: new Date()
                });

                // Notify other agents
                socket.to(`bot-${session.botId}-agents`).emit('session-resolved-update', {
                    sessionId,
                    resolvedBy: socket.user.name
                });

            } catch (error) {
                console.error('Error resolving session:', error);
                socket.emit('error', { message: 'Failed to resolve session' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            
            if (socket.isAgent && socket.botId) {
                socket.to(`bot-${socket.botId}-agents`).emit('agent-left', {
                    agentId: socket.userId,
                    agentName: socket.user?.name,
                    timestamp: new Date()
                });
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Utility functions for emitting events
export const notifyAgents = (botId, event, data) => {
    if (io) {
        io.to(`bot-${botId}-agents`).emit(event, data);
    }
};

export const notifySession = (sessionId, event, data) => {
    if (io) {
        io.to(`session-${sessionId}`).emit(event, data);
    }
};