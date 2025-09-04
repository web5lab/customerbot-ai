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
                socket.isAuthenticated = true;
            } else {
                socket.isAuthenticated = false;
            }
            next();
        } catch (err) {
            // Allow anonymous connections for public chat
            socket.isAuthenticated = false;
            next();
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}, User: ${socket.userId || 'Anonymous'}`);

        // Join session room as customer
        socket.on('join-session', async (data) => {
            const { sessionId, botId } = data;
            
            try {
                let session = await Session.findById(sessionId);
                if (!session) {
                    // Create new session for anonymous users
                    session = new Session({
                        botId,
                        title: `Chat Session ${Date.now()}`,
                        lastMessage: 'Session started',
                        messages: [],
                        messageCount: 0,
                        status: 'active'
                    });
                    await session.save();
                }

                socket.sessionId = sessionId || session._id;
                socket.botId = botId;
                socket.join(`session-${socket.sessionId}`);
                socket.join(`bot-${botId}-customers`);
                
                console.log(`Customer socket ${socket.id} joined session ${socket.sessionId}`);
                
                // Notify agents that a customer is active
                socket.to(`bot-${botId}-agents`).emit('customer-online', {
                    sessionId: socket.sessionId,
                    customerSocketId: socket.id,
                    timestamp: new Date()
                });

                socket.emit('session-joined', { 
                    sessionId: socket.sessionId,
                    session 
                });
            } catch (error) {
                console.error('Error joining session:', error);
                socket.emit('error', { message: 'Failed to join session' });
            }
        });

        // Join as support agent
        socket.on('join-as-agent', async (data) => {
            const { botId } = data;
            
            if (!socket.isAuthenticated) {
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
                    socket.emit('error', { message: 'Access denied to this bot' });
                    return;
                }

                socket.botId = botId;
                socket.join(`bot-${botId}-agents`);
                socket.isAgent = true;
                
                console.log(`Agent ${socket.user.name} joined bot ${botId} support`);
                
                // Send current support queue
                const pendingSessions = await Session.find({
                    botId,
                    needsHumanSupport: true,
                    status: 'pending',
                    assignedAgent: null
                }).sort({ humanSupportRequestedAt: 1 });

                socket.emit('support-queue-update', { 
                    sessions: pendingSessions.map(session => ({
                        sessionId: session._id,
                        title: session.title,
                        customerMessage: session.lastMessage,
                        customerName: session.customerName,
                        customerEmail: session.customerEmail,
                        timestamp: session.humanSupportRequestedAt,
                        priority: session.priority || 'medium'
                    }))
                });

                // Notify other agents
                socket.to(`bot-${botId}-agents`).emit('agent-online', {
                    agentId: socket.userId,
                    agentName: socket.user.name,
                    timestamp: new Date()
                });
                
            } catch (error) {
                console.error('Error joining as agent:', error);
                socket.emit('error', { message: 'Failed to join as agent' });
            }
        });

        // Customer requests human support
        socket.on('request-human-support', async (data) => {
            const { sessionId, message, customerInfo } = data;
            
            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Update session
                session.needsHumanSupport = true;
                session.status = 'pending';
                session.humanSupportRequestedAt = new Date();
                session.lastActivity = new Date();
                
                // Update customer info if provided
                if (customerInfo) {
                    if (customerInfo.name) session.customerName = customerInfo.name;
                    if (customerInfo.email) session.customerEmail = customerInfo.email;
                    if (customerInfo.phone) session.customerPhone = customerInfo.phone;
                    if (customerInfo.company) session.customerCompany = customerInfo.company;
                }

                // Add system message
                session.messages.push({
                    role: 'agent',
                    content: 'Customer has requested human support. An agent will join shortly.',
                    timestamp: new Date()
                });

                // Add customer message if provided
                if (message && message !== 'Customer requested human support') {
                    session.messages.push({
                        role: 'user',
                        content: message,
                        timestamp: new Date()
                    });
                    session.lastMessage = message;
                }

                session.messageCount = session.messages.length;
                await session.save();

                // Notify all agents for this bot
                io.to(`bot-${session.botId}-agents`).emit('support-request', {
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
                        customerEmail: session.customerEmail,
                        priority: session.priority || 'medium'
                    },
                    timestamp: new Date()
                });

                // Confirm to customer
                socket.emit('support-requested', {
                    message: 'Your request for human support has been received. An agent will join shortly.',
                    estimatedWaitTime: '2-5 minutes',
                    sessionId
                });

                console.log(`Human support requested for session ${sessionId}`);

            } catch (error) {
                console.error('Error requesting human support:', error);
                socket.emit('error', { message: 'Failed to request human support' });
            }
        });

        // Agent takes over session
        socket.on('take-session', async (data) => {
            const { sessionId } = data;
            
            if (!socket.isAgent || !socket.isAuthenticated) {
                socket.emit('error', { message: 'Only authenticated agents can take sessions' });
                return;
            }

            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Check if session is already assigned
                if (session.assignedAgent) {
                    socket.emit('error', { message: 'Session already assigned to another agent' });
                    return;
                }

                // Assign agent to session
                session.assignedAgent = socket.userId;
                session.status = 'active';
                session.agentJoinedAt = new Date();
                session.lastActivity = new Date();
                
                // Add system message
                session.messages.push({
                    role: 'agent',
                    content: `${socket.user.name} has joined the conversation`,
                    timestamp: new Date()
                });

                session.messageCount = session.messages.length;
                await session.save();

                // Join the specific session room
                socket.join(`session-${sessionId}`);
                socket.activeSessionId = sessionId;

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
                    agentId: socket.userId,
                    timestamp: new Date()
                });

                // Send session data to agent
                socket.emit('session-assigned', { 
                    sessionId, 
                    session: {
                        ...session.toObject(),
                        messages: session.messages.slice(-50) // Last 50 messages
                    }
                });

                console.log(`Agent ${socket.user.name} took session ${sessionId}`);

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

                // Verify permissions
                if (isAgent && (!socket.isAgent || !socket.isAuthenticated)) {
                    socket.emit('error', { message: 'Agent authentication required' });
                    return;
                }

                if (isAgent && session.assignedAgent?.toString() !== socket.userId) {
                    socket.emit('error', { message: 'You are not assigned to this session' });
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

                // If customer message and agent is assigned, notify other agents
                if (!isAgent && session.assignedAgent) {
                    socket.to(`bot-${session.botId}-agents`).emit('customer-message', {
                        sessionId,
                        message: newMessage,
                        session: {
                            _id: session._id,
                            title: session.title,
                            lastMessage: session.lastMessage,
                            customerName: session.customerName
                        }
                    });
                }

                console.log(`Message sent in session ${sessionId} by ${isAgent ? 'agent' : 'customer'}`);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicators
        socket.on('typing-start', (data) => {
            const { sessionId, isAgent = false } = data;
            const eventName = isAgent ? 'agent-typing' : 'customer-typing';
            
            socket.to(`session-${sessionId}`).emit(eventName, {
                sessionId,
                senderName: socket.user?.name || 'Customer',
                isTyping: true,
                timestamp: new Date()
            });
        });

        socket.on('typing-stop', (data) => {
            const { sessionId, isAgent = false } = data;
            const eventName = isAgent ? 'agent-typing' : 'customer-typing';
            
            socket.to(`session-${sessionId}`).emit(eventName, {
                sessionId,
                senderName: socket.user?.name || 'Customer',
                isTyping: false,
                timestamp: new Date()
            });
        });

        // Resolve session
        socket.on('resolve-session', async (data) => {
            const { sessionId, rating, feedback } = data;
            
            if (!socket.isAgent || !socket.isAuthenticated) {
                socket.emit('error', { message: 'Only agents can resolve sessions' });
                return;
            }

            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                if (session.assignedAgent?.toString() !== socket.userId) {
                    socket.emit('error', { message: 'You can only resolve sessions assigned to you' });
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
                    resolvedBy: socket.user.name,
                    timestamp: new Date()
                });

                console.log(`Session ${sessionId} resolved by ${socket.user.name}`);

            } catch (error) {
                console.error('Error resolving session:', error);
                socket.emit('error', { message: 'Failed to resolve session' });
            }
        });

        // Get active sessions for agent
        socket.on('get-active-sessions', async (data) => {
            const { botId } = data;
            
            if (!socket.isAgent || !socket.isAuthenticated) {
                socket.emit('error', { message: 'Agent authentication required' });
                return;
            }

            try {
                const activeSessions = await Session.find({
                    botId,
                    assignedAgent: socket.userId,
                    status: 'active'
                }).sort({ lastActivity: -1 });

                socket.emit('active-sessions-update', { sessions: activeSessions });
            } catch (error) {
                console.error('Error fetching active sessions:', error);
                socket.emit('error', { message: 'Failed to fetch active sessions' });
            }
        });

        // Get all active sessions for proactive joining
        socket.on('get-all-sessions', async (data) => {
            const { botId } = data;
            
            if (!socket.isAgent || !socket.isAuthenticated) {
                socket.emit('error', { message: 'Agent authentication required' });
                return;
            }

            try {
                const allSessions = await Session.find({
                    botId,
                    status: 'active',
                    assignedAgent: null,
                    messageCount: { $gt: 0 }
                }).sort({ timestamp: -1 });

                socket.emit('all-sessions-update', { sessions: allSessions });
            } catch (error) {
                console.error('Error fetching all sessions:', error);
                socket.emit('error', { message: 'Failed to fetch all sessions' });
            }
        });
        // Transfer session to another agent
        socket.on('transfer-session', async (data) => {
            const { sessionId, targetAgentId, reason } = data;
            
            if (!socket.isAgent || !socket.isAuthenticated) {
                socket.emit('error', { message: 'Agent authentication required' });
                return;
            }

            try {
                const session = await Session.findById(sessionId);
                if (!session || session.assignedAgent?.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Session not found or not assigned to you' });
                    return;
                }

                const targetAgent = await User.findById(targetAgentId);
                if (!targetAgent) {
                    socket.emit('error', { message: 'Target agent not found' });
                    return;
                }

                // Update session
                session.assignedAgent = targetAgentId;
                session.lastActivity = new Date();
                
                // Add transfer message
                session.messages.push({
                    role: 'system',
                    content: `Session transferred from ${socket.user.name} to ${targetAgent.name}${reason ? `: ${reason}` : ''}`,
                    timestamp: new Date()
                });

                session.messageCount = session.messages.length;
                await session.save();

                // Notify all participants
                io.to(`session-${sessionId}`).emit('session-transferred', {
                    sessionId,
                    fromAgent: socket.user.name,
                    toAgent: targetAgent.name,
                    reason,
                    timestamp: new Date()
                });

                // Notify agents
                socket.to(`bot-${session.botId}-agents`).emit('session-transfer-update', {
                    sessionId,
                    fromAgentId: socket.userId,
                    toAgentId: targetAgentId,
                    fromAgent: socket.user.name,
                    toAgent: targetAgent.name
                });

                console.log(`Session ${sessionId} transferred from ${socket.user.name} to ${targetAgent.name}`);

            } catch (error) {
                console.error('Error transferring session:', error);
                socket.emit('error', { message: 'Failed to transfer session' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            
            if (socket.isAgent && socket.botId) {
                socket.to(`bot-${socket.botId}-agents`).emit('agent-offline', {
                    agentId: socket.userId,
                    agentName: socket.user?.name,
                    timestamp: new Date()
                });
            }

            if (socket.sessionId && socket.botId) {
                socket.to(`bot-${socket.botId}-agents`).emit('customer-offline', {
                    sessionId: socket.sessionId,
                    timestamp: new Date()
                });
            }
        });

        // Handle agent status updates
        socket.on('update-agent-status', (data) => {
            const { status } = data;
            socket.agentStatus = status;
            
            if (socket.botId) {
                socket.to(`bot-${socket.botId}-agents`).emit('agent-status-update', {
                    agentId: socket.userId,
                    agentName: socket.user?.name,
                    status,
                    timestamp: new Date()
                });
            }
        });

        // Handle session transfer
        socket.on('transfer-session', async (data) => {
            const { sessionId, targetAgentId, reason } = data;
            
            if (!socket.isAgent || !socket.isAuthenticated) {
                socket.emit('error', { message: 'Agent authentication required' });
                return;
            }

            try {
                const session = await Session.findById(sessionId);
                if (!session || session.assignedAgent?.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Session not found or not assigned to you' });
                    return;
                }

                const targetAgent = await User.findById(targetAgentId);
                if (!targetAgent) {
                    socket.emit('error', { message: 'Target agent not found' });
                    return;
                }

                // Update session
                session.assignedAgent = targetAgentId;
                session.lastActivity = new Date();
                
                // Add transfer message
                session.messages.push({
                    role: 'system',
                    content: `Session transferred from ${socket.user.name} to ${targetAgent.name}${reason ? `: ${reason}` : ''}`,
                    timestamp: new Date()
                });

                session.messageCount = session.messages.length;
                await session.save();

                // Notify all participants
                io.to(`session-${sessionId}`).emit('session-transferred', {
                    sessionId,
                    fromAgent: socket.user.name,
                    toAgent: targetAgent.name,
                    reason,
                    timestamp: new Date()
                });

                // Notify agents
                socket.to(`bot-${session.botId}-agents`).emit('session-transfer-update', {
                    sessionId,
                    fromAgentId: socket.userId,
                    toAgentId: targetAgentId,
                    fromAgent: socket.user.name,
                    toAgent: targetAgent.name
                });

                console.log(`Session ${sessionId} transferred from ${socket.user.name} to ${targetAgent.name}`);

            } catch (error) {
                console.error('Error transferring session:', error);
                socket.emit('error', { message: 'Failed to transfer session' });
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
        console.log(`Notified agents for bot ${botId} with event: ${event}`);
    }
};

export const notifySession = (sessionId, event, data) => {
    if (io) {
        io.to(`session-${sessionId}`).emit(event, data);
        console.log(`Notified session ${sessionId} with event: ${event}`);
    }
};

export const notifyCustomers = (botId, event, data) => {
    if (io) {
        io.to(`bot-${botId}-customers`).emit(event, data);
        console.log(`Notified customers for bot ${botId} with event: ${event}`);
    }
};