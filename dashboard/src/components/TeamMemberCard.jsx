import { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Shield, 
  Eye, 
  Settings,
  CheckCircle,
  AlertCircle,
  Crown
} from 'lucide-react';

export function TeamMemberCard({ 
  member, 
  onUpdateRole, 
  onRemove, 
  canEdit = false, 
  isOwner = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);

  const handleSaveRole = () => {
    if (selectedRole !== member.role) {
      onUpdateRole(member._id, selectedRole);
    }
    setIsEditing(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'editor': return <Edit3 className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'inactive': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar with Status */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} border-2 border-white rounded-full`}></div>
          {isOwner && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center">
              <Crown className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
            {isOwner && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Owner
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Mail className="w-4 h-4" />
            <span className="truncate">{member.email}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Joined {formatDate(member.joinedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Active {member.lastActive}</span>
            </div>
          </div>
        </div>

        {/* Status and Role */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(member.status)}
            <span className="text-sm font-medium text-gray-700 capitalize">
              {member.status}
            </span>
          </div>

          {/* Role Management */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleSaveRole}
                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedRole(member.role);
                }}
                className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${getRoleColor(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </div>
              
              {canEdit && !isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemove(member._id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Permissions */}
      {member.status === 'active' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Permissions:</div>
          <div className="flex flex-wrap gap-2">
            {member.role === 'admin' && (
              <>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Manage Team</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Edit Bot</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">View Analytics</span>
              </>
            )}
            {member.role === 'editor' && (
              <>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Edit Bot</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">View Analytics</span>
              </>
            )}
            {member.role === 'viewer' && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">View Only</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}