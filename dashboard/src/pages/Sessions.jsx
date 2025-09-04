import React, { useState, useEffect, useRef } from 'react';
import { ChatSessions } from '../components/ChatSessions';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { getChatSessions } from '../store/global.Action';
import { activeBotSelector, SessionsSelector } from '../store/global.Selctor';
import { MessageSquare, Send, Download, Trash2, Edit3, Bot, User, Clock, CheckCircle, Star, Tag, AlertCircle, MoreHorizontal } from 'lucide-react';

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(getChatSessions({ botId: activeBot._id }));
  }, []);

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
    try {
      await api.deleteSession(sessionId);
      if (selectedSession && selectedSession._id === sessionId) {
        setSelectedSession(sessions.find(s => s._id !== sessionId) || null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
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
        <div className="w-96 flex-shrink-0 bg-gray-50 border-r border-gray-200">
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
                    <Bot className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeBot.name}
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
                    
                    {selectedSession.status !== 'resolved' && (
                      <button
                        onClick={() => setShowResolveModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                  
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export chat"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => handleDeleteSession(selectedSession._id)}
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Session Info Bar */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {selectedSession.customerName && (
                      <span className="text-gray-700">
                        <strong>Customer:</strong> {selectedSession.customerName}
                      </span>
                    )}
                    {selectedSession.customerEmail && (
                      <span className="text-gray-700">
                        <strong>Email:</strong> {selectedSession.customerEmail}
                      </span>
                    )}
                    {selectedSession.resolvedAt && (
                      <span className="text-green-600">
                        <strong>Resolved:</strong> {new Date(selectedSession.resolvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sessionTags}
                      onChange={(e) => setSessionTags(e.target.value)}
                      onBlur={() => {
                        const tags = sessionTags.split(',').map(tag => tag.trim()).filter(tag => tag);
                        handleUpdateSessionStatus({ tags });
                      }}
                      placeholder="Add tags..."
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-32"
                    />
                    <Tag className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {selectedSession.messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                      >
                        {message.role !== 'user' && (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
                            <Bot className="w-4 h-4 text-gray-600" />
                          </div>
                        )}

                        <div className={`flex flex-col max-w-3xl ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                          {editingMessageId === message._id ? (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 w-full">
                              <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                rows={4}
                                style={{ minWidth: '400px' }}
                              />
                              <div className="flex justify-end space-x-3 mt-3">
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEdit}
                                  className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all font-medium"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`relative rounded-lg px-4 py-3 border transition-all ${
                                message.role === 'user'
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                              <div className={`text-xs mt-2 flex items-center gap-2 ${
                                message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(message.timestamp)}</span>
                              </div>

                              {message.role === 'bot' && (
                                <button
                                  onClick={() => startEditing(message)}
                                  className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title="Edit response"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-lg bg-gray-600 border border-gray-600 flex items-center justify-center ml-4 flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
                          <Bot className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                            <span className="text-sm text-gray-500 italic">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-6 border border-gray-200">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Start a conversation</h3>
                    <p className="text-gray-600 mb-6 max-w-md">Send a message to begin chatting with {activeBot.name}</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none bg-white"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`p-3 rounded-lg transition-all ${
                        newMessage.trim()
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!newMessage.trim() || isTyping}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Press Enter to send, Shift + Enter for new line</span>
                    <span>{newMessage.length}/2000</span>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6 border border-gray-200">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No conversation selected
              </h3>
              <p className="text-gray-600 mb-8 max-w-md">Select a chat from the sidebar or create a new one to get started</p>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => navigate('/preview')}
              >
                <MessageSquare className="w-4 h-4" />
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}