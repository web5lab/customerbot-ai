import React, { useState, useEffect, useRef } from 'react';
import { ChatSessions } from '../components/ChatSessions';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { getChatSessions } from '../store/global.Action';
import { toastLoader } from '../components/ToastLoader';
import { activeBotSelector, SessionsSelector } from '../store/global.Selctor';
import { MessageSquare, Send, Download, Trash2, Edit3, Bot, User, Clock, CheckCircle, Star, Tag, AlertCircle, MoreHorizontal, UserCheck, Phone } from 'lucide-react';
import socketService from '../services/socketService';

export function Sessions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeBot = useSelector(activeBotSelector);
  const sessions = useSelector(SessionsSelector);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveRating, setResolveRating] = useState(5);
  const [resolveFeedback, setResolveFeedback] = useState('');
  const [sessionPriority, setSessionPriority] = useState('medium');
  const [sessionTags, setSessionTags] = useState('');
  const [supportSessions, setSupportSessions] = useState([]);
  const [connectedSessions, setConnectedSessions] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(getChatSessions({ botId: activeBot._id }));
    fetchSupportSessions();
  }, []);

  // Initialize socket for agents
  useEffect(() => {
    if (activeBot) {
      socketService.connect(localStorage.getItem('authToken'));
      socketService.joinAsAgent(activeBot._id);

      // Listen for support requests
      socketService.on('support-request', (data) => {
        setSupportSessions(prev => {
          const exists = prev.find(s => s.sessionId === data.sessionId);
          if (exists) return prev;
          return [...prev, data];
        });
        
        // Show notification
        toast.success(`New support request from customer`);
      });

      // Listen for new messages in active sessions
      socketService.on('customer-message', (data) => {
        if (selectedSession && selectedSession._id === data.sessionId) {
          setSelectedSession(prev => ({
            ...prev,
            messages: [...(prev.messages || []), data.message]
          }));
        }
      });

      // Listen for session updates
      socketService.on('session-taken', (data) => {
        setSupportSessions(prev => prev.filter(s => s.sessionId !== data.sessionId));
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [activeBot]);

  const fetchSupportSessions = async () => {
    if (!activeBot) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/bot/${activeBot._id}/support-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupportSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching support sessions:', error);
    }
  };

  const handleTakeSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/session/${sessionId}/assign-agent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Join the session via socket
        socketService.takeSession(sessionId);
        setConnectedSessions(prev => new Set([...prev, sessionId]));
        
        // Remove from support queue
        setSupportSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        
        // Refresh sessions to show the newly assigned session
        dispatch(getChatSessions({ botId: activeBot._id }));
        
        toast.success('Session assigned successfully');
      }
    } catch (error) {
      console.error('Error taking session:', error);
      toast.error('Failed to take session');
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      setSelectedSession(sessions[0]);
    }
  }, [sessions]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSession, editingMessageId]);

  useEffect(() => {
    if (selectedSession) {
      setSessionPriority(selectedSession.priority || 'medium');
      setSessionTags(selectedSession.tags ? selectedSession.tags.join(', ') : '');
    }
  }, [selectedSession]);

  const handleDeleteSession = async (sessionId) => {
    // Show loading toast
    const loadingToastId = toastLoader.loading(
      'Deleting Session',
      'Please wait while we delete the conversation...'
    );

    try {
      await api.deleteSession(sessionId);
      
      // Dismiss loading toast
      toastLoader.dismiss(loadingToastId);
      
      // Update local state to remove the deleted session
      dispatch(getChatSessions({ botId: activeBot._id }));
      
      // If the deleted session was currently selected, clear selection
      if (selectedSession && selectedSession._id === sessionId) {
        const remainingSessions = sessions.filter(s => s._id !== sessionId);
        setSelectedSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
      }
      
      // Show success message
      toastLoader.success(
        'Session Deleted',
        'The conversation has been permanently removed'
      );
    } catch (error) {
      // Dismiss loading toast
      toastLoader.dismiss(loadingToastId);
      
      console.error('Error deleting session:', error);
      toastLoader.error(
        'Delete Failed',
        'Unable to delete the session. Please try again.'
      );
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setEditingMessageId(null);
  };

  const handleMarkAsResolved = async () => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/session/${selectedSession._id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: resolveRating,
          feedback: resolveFeedback
        })
      });

      if (response.ok) {
        const updatedSession = { ...selectedSession, status: 'resolved', resolvedAt: new Date() };
        setSelectedSession(updatedSession);
        setShowResolveModal(false);
        setResolveRating(5);
        setResolveFeedback('');
        dispatch(getChatSessions({ botId: activeBot._id })); // Refresh sessions
      }
    } catch (error) {
      console.error('Error marking session as resolved:', error);
    }
  };

  const handleUpdateSessionStatus = async (updates) => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/session/${selectedSession._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedSession = { ...selectedSession, ...updates };
        setSelectedSession(updatedSession);
        dispatch(getChatSessions({ botId: activeBot._id })); // Refresh sessions
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'active': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send via socket if this is a live session
    if (connectedSessions.has(selectedSession._id)) {
      socketService.sendMessage(selectedSession._id, newMessage, true);
    }

    const updatedSession = {
      ...selectedSession,
      messages: [
        ...(selectedSession.messages || []),
        {
          _id: Date.now().toString(),
          sender: 'user',
          content: newMessage,
          timestamp: new Date(),
          role: 'user'
        }
      ]
    };
    setSelectedSession(updatedSession);
    setNewMessage('');

    setIsTyping(true);
    setTimeout(() => {
      const botResponse = {
        _id: `bot-${Date.now()}`,
        sender: 'bot',
        content: getAutoResponse(newMessage),
        timestamp: new Date(),
        role: 'bot'
      };

      setSelectedSession({
        ...updatedSession,
        messages: [...updatedSession.messages, botResponse]
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAutoResponse = (userMessage) => {
    const responses = [
      "I understand your interest in this topic. Let me provide more details...",
      "That's an excellent question. Here's what I know about that...",
      "I've researched this before. The key points are...",
      "Based on my knowledge, I can tell you that...",
      "Interesting perspective! Here's some additional information..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startEditing = (message) => {
    setEditingMessageId(message._id);
    setEditedContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const saveEdit = () => {
    if (!editedContent.trim()) return;

    const updatedMessages = selectedSession.messages.map(msg =>
      msg._id === editingMessageId ? { ...msg, content: editedContent } : msg
    );

    setSelectedSession({
      ...selectedSession,
      messages: updatedMessages
    });

    setEditingMessageId(null);
    setEditedContent('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mark as Resolved</h3>
              <p className="text-sm text-gray-600">How would you rate this conversation?</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satisfaction Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setResolveRating(rating)}
                      className={`p-2 rounded-lg transition-colors ${
                        resolveRating >= rating
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={resolveFeedback}
                  onChange={(e) => setResolveFeedback(e.target.value)}
                  placeholder="Any additional notes about this conversation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsResolved}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full h-screen">
        {/* Left Sidebar - Sessions List */}
        <div className="w-96 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Support Queue */}
          {supportSessions.length > 0 && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Support Queue ({supportSessions.length})</h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {supportSessions.map((supportSession) => (
                  <div key={supportSession.sessionId} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {supportSession.session?.title || 'Customer Support Request'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {supportSession.customerMessage || 'Requested human support'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(supportSession.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleTakeSession(supportSession.sessionId)}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Take
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="h-full overflow-hidden">
            <ChatSessions
              sessions={sessions}
              activeSessionId={selectedSession?._id}
              onSessionSelect={handleSessionSelect}
              onSessionDelete={handleDeleteSession}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {selectedSession.assignedAgent ? (
                      <User className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedSession.assignedAgent ? 
                        `${activeBot.name} - Human Support` : 
                        activeBot.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{selectedSession.name || 'Conversation'}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatTimestamp(selectedSession.updatedAt)}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSession.status || 'active')}`}>
                        {(selectedSession.status || 'active').charAt(0).toUpperCase() + (selectedSession.status || 'active').slice(1)}
                      </span>
                      {selectedSession.priority && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedSession.priority)}`}>
                            {selectedSession.priority.charAt(0).toUpperCase() + selectedSession.priority.slice(1)} Priority
                          </span>
                        </>
                      )}
                      {selectedSession.needsHumanSupport && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
                            Needs Human Support
                          </span>
                        </>
                      )}
                      {connectedSessions.has(selectedSession._id) && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                            Live Session
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Take Session Button */}
                  {selectedSession.needsHumanSupport && !selectedSession.assignedAgent && (
                    <button
                      onClick={() => handleTakeSession(selectedSession._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <UserCheck className="w-4 h-4" />
                      Take Session
                    </button>
                  )}
                  
                  {/* Session Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={sessionPriority}
                      onChange={(e) => {
                        setSessionPriority(e.target.value);
                        handleUpdateSessionStatus({ priority: e.target.value });
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedSession.messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`flex gap-3 ${
                      message.sender === 'user' || message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {(message.sender === 'bot' || message.role === 'bot') && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      message.sender === 'user' || message.role === 'user' ? 'order-first' : ''
                    }`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user' || message.role === 'user'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {editingMessageId === message._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded resize-none text-gray-900"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative">
                            <p className="text-sm">{message.content}</p>
                            {(message.sender === 'bot' || message.role === 'bot') && (
                              <button
                                onClick={() => startEditing(message)}
                                className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>

                    {(message.sender === 'user' || message.role === 'user') && (
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a session from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
                    