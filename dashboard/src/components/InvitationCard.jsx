import { useState } from 'react';
import { 
  Users, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Shield, 
  Eye, 
  Edit3,
  Bot,
  Calendar
} from 'lucide-react';

export function InvitationCard({ 
  invitation, 
  onAccept, 
  onDecline, 
  isLoading = false 
}) {
  const [actionLoading, setActionLoading] = useState(null);

  const handleAccept = async () => {
    setActionLoading('accept');
    try {
      await onAccept(invitation._id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading('decline');
    try {
      await onDecline(invitation._id);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'editor': return <Edit3 className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        {/* Bot Icon */}
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
          {invitation.botIcon ? (
            <img
              src={invitation.botIcon}
              alt={invitation.botName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.botName)}&background=3b82f6&color=ffffff&size=48`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Invitation Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              Team Invitation
            </h3>
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              <Clock className="w-3 h-3" />
              Pending
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">{invitation.invitedBy?.name || 'Someone'}</span> invited you to join the{' '}
            <span className="font-medium text-gray-900">{invitation.botName}</span> team
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Invited {formatDate(invitation.invitedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>From {invitation.invitedBy?.email || 'Unknown'}</span>
            </div>
          </div>

          {/* Role Badge */}
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border ${getRoleColor(invitation.role)}`}>
            {getRoleIcon(invitation.role)}
            <span className="capitalize">Role: {invitation.role}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleAccept}
            disabled={actionLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {actionLoading === 'accept' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Accept</span>
          </button>
          
          <button
            onClick={handleDecline}
            disabled={actionLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {actionLoading === 'decline' ? (
              <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>Decline</span>
          </button>
        </div>
      </div>
    </div>
  );
}