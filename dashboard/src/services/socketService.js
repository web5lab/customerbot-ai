import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
    }

    connect(token = null) {
        if (this.socket?.connected) {
            return this.socket;
        }

        const serverUrl = import.meta.env.VITE_SERVER_URL;
        
        this.socket = io(serverUrl, {
            auth: {
                token: token || localStorage.getItem('authToken')
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Join session as customer
    joinSession(sessionId, botId) {
        if (!this.socket) return;
        
        this.socket.emit('join-session', { sessionId, botId });
    }

    // Join as support agent
    joinAsAgent(botId) {
        if (!this.socket) return;
        
        this.socket.emit('join-as-agent', { botId });
    }

    // Request human support
    requestHumanSupport(sessionId, message, customerInfo = null) {
        if (!this.socket) return;
        
        this.socket.emit('request-human-support', { 
            sessionId, 
            message, 
            customerInfo 
        });
    }

    // Take session as agent
    takeSession(sessionId) {
        if (!this.socket) return;
        
        this.socket.emit('take-session', { sessionId });
    }

    // Send message
    sendMessage(sessionId, message, isAgent = false) {
        if (!this.socket) return;
        
        this.socket.emit('send-message', { 
            sessionId, 
            message, 
            isAgent 
        });
    }

    // Send typing indicator
    sendTyping(sessionId, isTyping, isAgent = false) {
        if (!this.socket) return;
        
        const event = isTyping ? 'typing-start' : 'typing-stop';
        this.socket.emit(event, { sessionId, isAgent });
    }

    // Resolve session
    resolveSession(sessionId, rating = null, feedback = null) {
        if (!this.socket) return;
        
        this.socket.emit('resolve-session', { 
            sessionId, 
            rating, 
            feedback 
        });
    }

    // Get active sessions (for agents)
    getActiveSessions(botId) {
        if (!this.socket) return;
        
        this.socket.emit('get-active-sessions', { botId });
    }

    // Transfer session to another agent
    transferSession(sessionId, targetAgentId, reason = null) {
        if (!this.socket) return;
        
        this.socket.emit('transfer-session', { 
            sessionId, 
            targetAgentId, 
            reason 
        });
    }

    // Event listeners
    on(event, callback) {
        if (!this.socket) return;
        
        this.socket.on(event, callback);
        
        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback = null) {
        if (!this.socket) return;
        
        if (callback) {
            this.socket.off(event, callback);
            
            // Remove from stored listeners
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        } else {
            this.socket.off(event);
            this.listeners.delete(event);
        }
    }

    // Clean up all listeners
    removeAllListeners() {
        if (this.socket) {
            this.listeners.forEach((callbacks, event) => {
                this.socket.off(event);
            });
            this.listeners.clear();
        }
    }

    // Update agent status
    updateAgentStatus(status) {
        if (!this.socket) return;
        
        this.socket.emit('update-agent-status', { status });
    }

    // Transfer session to another agent
    transferSession(sessionId, targetAgentId, reason = null) {
        if (!this.socket) return;
        
        this.socket.emit('transfer-session', { 
            sessionId, 
            targetAgentId, 
            reason 
        });
    }

    // Get agent's active sessions
    getAgentSessions(botId) {
        if (!this.socket) return;
        
        this.socket.emit('get-agent-sessions', { botId });
    }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;