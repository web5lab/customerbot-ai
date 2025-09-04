import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  Building,
  Star,
  X,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import socketService from '../services/socketService';

export function AgentChatInterface({ session, onClose, onResolve }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (session) {
      setMessages(session.messages || []);
      setIsConnected(true);

      // Listen for new messages from customer
      socketService.on('new-message', (data) => {
        if (data.sessionId === session._id && data.message.role !== 'agent') {
          setMessages(prev => [...prev, data.message]);
        }
      });

      // Listen for customer typing
      socketService.on('customer-typing', (data) => {
        if (data.sessionId === session._id) {
          setCustomerTyping(data.isTyping);
        }
      });

      // Listen for session resolved
      socketService.on('session-resolved', (data) => {
        if (data.sessionId === session._id) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Session resolved by ${data.resolvedBy}`,
            timestamp: new Date()
          }]);
        }
      });

      return () => {
        socketService.off('new-message');
        socketService.off('customer-typing');
        socketService.off('session-resolved');
      };
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    const message = {
      role: 'agent',
      content: newMessage,
      timestamp: new Date(),
      senderName: 'Agent'
    };

    // Add to local state immediately
    setMessages(prev => [...prev, message]);
    
    // Send via socket
    socketService.sendMessage(session._id, newMessage, true);
    
    setNewMessage('');
  };

  const handleTyping = (isTyping) => {
    if (session) {
      socketService.sendTyping(session._id, isTyping, true);
    }
  };

  const handleResolveSession = async () => {
    try {
      socketService.resolveSession(session._id, rating, feedback);
      
      // Call parent callback
      onResolve?.(session._id, rating, feedback);
      
      setShowResolveModal(false);
      setRating(5);
      setFeedback('');
    } catch (error) {
      console.error('Error resolving session:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Selected</h3>
          <p className="text-gray-500">Select a session from the queue to start helping customers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resolve Session</h3>
              <p className="text-sm text-gray-600">How would you rate this conversation?</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Satisfaction
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        rating >= star
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
                  Resolution Notes (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Any notes about this conversation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
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
                onClick={handleResolveSession}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Resolve Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {session.customerName || session.title || 'Customer Chat'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                {session.customerEmail && (
                  <>
                    <span>•</span>
                    <Mail className="w-3 h-3" />
                    <span>{session.customerEmail}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Resolve
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start gap-3 max-w-[80%]">
              {message.role !== 'agent' && message.role !== 'system' && (
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}

              <div className={`flex flex-col ${message.role === 'agent' ? 'items-end' : 'items-start'}`}>
                {message.role === 'system' ? (
                  <div className="text-center w-full mb-2">
                    <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm border border-gray-200">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`rounded-lg px-4 py-3 border ${
                        message.role === 'agent'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      <span>{formatTime(message.timestamp)}</span>
                      {message.role === 'agent' && <span className="text-green-500 ml-1">✓</span>}
                    </div>
                  </>
                )}
              </div>

              {message.role === 'agent' && (
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Customer Typing Indicator */}
        {customerTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="rounded-lg px-4 py-3 bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm italic text-gray-500">Customer is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(e.target.value.length > 0);
              }}
              onBlur={() => handleTyping(false)}
              placeholder="Type your response..."
              rows={1}
              className="w-full px-4 py-3 pr-16 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <div className="absolute right-4 bottom-3 text-xs text-gray-500">
              {newMessage.length}/500
            </div>
          </div>
          <button
            type="submit"
            className={`p-3 rounded-lg transition-all ${
              !newMessage.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>
            {isConnected ? 'Live chat with customer' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
}