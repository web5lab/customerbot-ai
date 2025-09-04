import { MessageSquare, Search, Clock, Trash2, Star, User, AlertCircle, UserCheck } from 'lucide-react';
import { useState } from 'react';

export function ChatSessions({ sessions, onSessionSelect, onSessionDelete }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session =>
    (session.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const formatTimestamp = (dateString) => {
    const now = new Date().getTime();
    const timestamp = new Date(dateString).getTime();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (isNaN(diff)) return 'Invalid date';
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${Math.max(1, minutes)}m ago`;
  };

  const getSessionPreview = (session) => {
    if (session.lastMessage) return session.lastMessage;
    if (session.messages && session.messages.length > 0) {
      const lastMsg = session.messages[session.messages.length - 1];
      return lastMsg.content.substring(0, 60) + (lastMsg.content.length > 60 ? '...' : '');
    }
    return 'No messages yet';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Chat Sessions</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg 
                       focus:border-gray-900 focus:ring-2 focus:ring-gray-900 
                       focus:border-transparent transition-all text-sm"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredSessions.map(session => (
              <div
                key={session._id}
                className="group p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-start gap-3">
                  {/* Session Icon */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                      {session.needsHumanSupport ? (
                        <UserCheck className="w-5 h-5 text-yellow-600" />
                      ) : session.assignedAgent ? (
                        <User className="w-5 h-5 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    {session.isPinned && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                    )}
                    {session.needsHumanSupport && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Session Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {session.title || `Chat ${session._id.slice(-6)}`}
                      </h3>
                      {session.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                        {session.status && (
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`}></div>
                        )}

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {getSessionPreview(session)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(session.timestamp)}</span>
                        </div>
                        <span>• {session.messageCount || 0} messages</span>
                        {session.status && (
                          <span>• {session.status}</span>
                        )}
                        {session.needsHumanSupport && (
                          <span className="text-yellow-600 font-medium">• Needs Support</span>
                        )}
                        {session.assignedAgent && (
                          <span className="text-blue-600 font-medium">• Agent Assigned</span>
                        )}
                      </div>

                      <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status || 'active')}`}></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this session?')) {
                        onSessionDelete(session._id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                               rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-200">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery
                ? `No conversations found matching "${searchQuery}"`
                : 'Start your first conversation to see it here'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
