import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Send,
  Phone,
  Mail,
  Star,
  Eye,
  UserPlus
} from 'lucide-react';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

export function AgentDashboard({ botId, onSessionSelect }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [supportQueue, setSupportQueue] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [connectedSessions, setConnectedSessions] = useState(new Set());
  const [agentStats, setAgentStats] = useState({
    activeChats: 0,
    resolvedToday: 0,
    averageResponseTime: '1.2s',
    customerSatisfaction: 4.8
  });

  useEffect(() => {
    if (botId) {
      // Connect as agent
      socketService.connect(localStorage.getItem('authToken'));
      socketService.joinAsAgent(botId);

      // Listen for support requests
      socketService.on('support-request', (data) => {
        setSupportQueue(prev => {
          const exists = prev.find(s => s.sessionId === data.sessionId);
          if (exists) return prev;
          return [...prev, data];
        });
        
        // Update stats
        setAgentStats(prev => ({
          ...prev,
          activeChats: prev.activeChats + 1
        }));
      });

      // Listen for active sessions
      socketService.on('active-support-sessions', (data) => {
        setActiveSessions(data.sessions || []);
      });

      // Listen for all sessions update
      socketService.on('all-sessions-update', (data) => {
        setAllSessions(data.sessions || []);
      });

      // Listen for session taken by other agents
      socketService.on('session-taken', (data) => {
        setSupportQueue(prev => prev.filter(s => s.sessionId !== data.sessionId));
        
        // Update stats if this agent took the session
        if (data.agentId === localStorage.getItem('agentId')) {
          setAgentStats(prev => ({
            ...prev,
            activeChats: prev.activeChats + 1
          }));
        }
      });

      // Listen for customer messages
      socketService.on('customer-message', (data) => {
        // Update session in active list
        setActiveSessions(prev => prev.map(session => 
          session._id === data.sessionId 
            ? { ...session, lastMessage: data.message.content, hasNewMessage: true }
            : session
        ));
        
        // Update in all sessions list
        setAllSessions(prev => prev.map(session => 
          session._id === data.sessionId 
            ? { ...session, lastMessage: data.message.content, hasNewMessage: true }
            : session
        ));
      });

      // Listen for session resolved
      socketService.on('session-resolved', (data) => {
        setActiveSessions(prev => prev.filter(s => s._id !== data.sessionId));
        setSupportQueue(prev => prev.filter(s => s.sessionId !== data.sessionId));
        setAllSessions(prev => prev.filter(s => s._id !== data.sessionId));
        setConnectedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.sessionId);
          return newSet;
        });
        
        setAgentStats(prev => ({
          ...prev,
          resolvedToday: prev.resolvedToday + 1,
          activeChats: Math.max(0, prev.activeChats - 1)
        }));
      });

      // Fetch initial data
      fetchActiveSessions();
      fetchSupportQueue();
      fetchAllSessions();

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [botId]);

  const fetchActiveSessions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/bot/${botId}/agent-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const fetchSupportQueue = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/bot/${botId}/support-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupportQueue(data.sessions?.map(session => ({
          sessionId: session._id,
          customerMessage: session.lastMessage,
          customerInfo: {
            name: session.customerName,
            email: session.customerEmail
          },
          timestamp: session.humanSupportRequestedAt,
          session: session
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching support queue:', error);
    }
  };

  const fetchAllSessions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/bot/${botId}/all-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching all sessions:', error);
    }
  };

  const handleJoinSession = async (session) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/session/${session._id}/assign-agent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Join the session via socket
        socketService.takeSession(session._id);
        setConnectedSessions(prev => new Set([...prev, session._id]));
        
        // Add to active sessions if not already there
        setActiveSessions(prev => {
          const exists = prev.find(s => s._id === session._id);
          if (!exists) {
            return [...prev, session];
          }
          return prev;
        });
        
        // Remove from all sessions list
        setAllSessions(prev => prev.filter(s => s._id !== session._id));
        
        // Select this session
        onSessionSelect?.(session);
        
        toast.success('Joined session successfully');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const handleTakeSession = async (sessionId) => {
    try {
      socketService.takeSession(sessionId);
      setConnectedSessions(prev => new Set([...prev, sessionId]));
      
      // Move from queue to active
      const session = supportQueue.find(s => s.sessionId === sessionId);
      if (session) {
        setActiveSessions(prev => [...prev, session.session]);
        setSupportQueue(prev => prev.filter(s => s.sessionId !== sessionId));
      }
      
      // Select this session
      onSessionSelect?.(session?.session);
    } catch (error) {
      console.error('Error taking session:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agent Dashboard</h2>
          <p className="text-gray-600">Manage customer support sessions</p>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{agentStats.activeChats}</span>
          </div>
          <p className="text-sm text-gray-600">Active Chats</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{agentStats.resolvedToday}</span>
          </div>
          <p className="text-sm text-gray-600">Resolved Today</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{agentStats.averageResponseTime}</span>
          </div>
          <p className="text-sm text-gray-600">Avg Response</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{agentStats.customerSatisfaction}</span>
          </div>
          <p className="text-sm text-gray-600">Satisfaction</p>
        </div>
      </div>

      {/* All Active Sessions - Agents can join any session */}
      {allSessions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              All Active Sessions ({allSessions.length})
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Join any session
            </span>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {allSessions.map((session) => (
              <div key={session._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-800">
                        {session.title || `Chat Session ${session._id.slice(-6)}`}
                      </span>
                      {session.hasNewMessage && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      {session.lastMessage || 'Active conversation'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-blue-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.timestamp)}
                      </span>
                      <span>• {session.messageCount || 0} messages</span>
                      {session.customerName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {session.customerName}
                        </span>
                      )}
                      {session.customerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {session.customerEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinSession(session)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Queue */}
      {supportQueue.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Urgent Support Requests ({supportQueue.length})
            </h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Customer requested help
            </span>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {supportQueue.map((item) => (
              <div key={item.sessionId} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-800">
                        Urgent: Customer Requested Help
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      {item.customerMessage || 'Customer requested human support'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-red-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.timestamp)}
                      </span>
                      {item.customerInfo?.name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.customerInfo.name}
                        </span>
                      )}
                      {item.customerInfo?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {item.customerInfo.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleTakeSession(item.sessionId)}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Take Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          My Active Sessions ({activeSessions.length})
        </h3>
        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div 
                key={session._id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  session.hasNewMessage 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onSessionSelect?.(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {session.customerName || session.title || 'Customer Chat'}
                      </span>
                      {session.hasNewMessage && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {session.lastMessage}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.timestamp)}
                      </span>
                      <span>• {session.messageCount || 0} messages</span>
                      {session.customerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {session.customerEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  {connectedSessions.has(session._id) && (
                    <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Connected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No active support sessions</p>
            <p className="text-sm">Sessions will appear here when customers request human support</p>
          </div>
        )}
      </div>
    </div>
  );
}