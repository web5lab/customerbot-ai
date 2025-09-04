import { useState } from 'react';
import { X, Mail, UserPlus, Send, AlertCircle, CheckCircle } from 'lucide-react';

const ROLE_DESCRIPTIONS = {
  admin: {
    title: 'Administrator',
    description: 'Full access to bot settings, training, team management, and analytics',
    permissions: ['Manage team members', 'Edit bot configuration', 'Access all analytics', 'Manage integrations']
  },
  editor: {
    title: 'Editor',
    description: 'Can modify bot configurations, training data, and view detailed analytics',
    permissions: ['Edit bot settings', 'Manage training data', 'View analytics', 'Test bot functionality']
  },
  viewer: {
    title: 'Viewer',
    description: 'Read-only access to conversations, basic analytics, and bot performance',
    permissions: ['View conversations', 'Basic analytics', 'Export data', 'View bot status']
  }
};

export function TeamInviteModal({ 
  isOpen, 
  onClose, 
  onInvite, 
  botName, 
  isLoading = false 
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onInvite(email, role);
      setSuccess('Invitation sent successfully!');
      setTimeout(() => {
        setEmail('');
        setRole('viewer');
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('viewer');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-gray-200">
                <UserPlus className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
                <p className="text-gray-600">Add member to {botName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role
            </label>
            <div className="space-y-3">
              {Object.entries(ROLE_DESCRIPTIONS).map(([roleKey, roleInfo]) => (
                <label
                  key={roleKey}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    role === roleKey
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleKey}
                    checked={role === roleKey}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{roleInfo.title}</div>
                    <div className="text-sm text-gray-600 mb-2">{roleInfo.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {roleInfo.permissions.slice(0, 2).map((permission, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                      {roleInfo.permissions.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{roleInfo.permissions.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}