import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Activity,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit,
  Settings,
  Users,
  MessageSquare,
  Share2,
  Copy,
  Link,
  Code,
  X,
  Check,
  Globe,
  CodeSquare,
  BookOpen
} from 'lucide-react';
import { useBot } from '../contexts/BotContext';
import { CreateBotModal } from '../components/CreateBotModal';
import { botsSelector, invitationsSelector } from '../store/global.Selctor';
import { useSelector, useDispatch } from 'react-redux';
import { setBotsActive } from '../store/global.Slice';
import logo from '../assets/logo.png';
import { DeleteChatBot, GetBots, respondToInvitation } from '../store/global.Action';
import { InvitationCard } from '../components/InvitationCard';

// Simple dropdown component
const SimpleDropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {children(setIsOpen)}
          </div>
        </div>
      )}
    </div>
  );
};

// Sharing Modal Component
const SharingModal = ({ bot, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('url');

  const shareUrl = `${import.meta.env.VITE_WEB_URL}/chat?id=${bot._id}`;

  const embedCode = `<!-- CustomerBot Widget -->
<script>
  window.CustomerBotConfig = {
    botId: "${bot.id}",
    botName: "${bot.name}",
    theme: "modern"
  };
</script>
<script src="https://cdn.customerbot.ai/widget.js"></script>`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img
                src={bot.icon}
                alt={bot.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=3b82f6&color=ffffff&size=40`;
                }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Share {bot.name}</h2>
              <p className="text-sm text-gray-600">Make your AI assistant accessible to others</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('url')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              selectedTab === 'url'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Share URL
          </button>
          <button
            onClick={() => setSelectedTab('embed')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              selectedTab === 'embed'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Embed Code
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedTab === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Chat URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl, 'url')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copiedUrl
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {copiedUrl ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">How it works</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Anyone with this URL can chat with your AI assistant</li>
                  <li>• The bot will use your configured settings and personality</li>
                  <li>• All conversations are logged in your dashboard</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Embed Code
                </label>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {embedCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(embedCode, 'code')}
                    className={`absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      copiedCode
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Integration Instructions</h3>
                <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                  <li>Copy the embed code above</li>
                  <li>Paste it before the closing &lt;/body&gt; tag in your HTML</li>
                  <li>The chatbot widget will appear on your website</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export function Bots() {
  const navigate = useNavigate();
  const { setSelectedBot } = useBot();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [selectedBotForSharing, setSelectedBotForSharing] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const botsData = useSelector(botsSelector);
  const invitations = useSelector(invitationsSelector);
  const dispatch = useDispatch();

  const handleBotSelect = (bot) => {
    if (bot) {
      setSelectedBot(bot);
      dispatch(setBotsActive(bot));
    }
    navigate(`/dashboard?bot=${bot.name}`);
  };

  const handleBotEdit = (e, bot) => {
    e.stopPropagation();
    dispatch(setBotsActive(bot));
    navigate('/preview');
  };

  const handleBotDelete = async (e, botId) => {
    e.stopPropagation();
    await DeleteChatBot({ chatBotId: botId });
    dispatch(GetBots());
  };

  const handleBotShare = (e, bot) => {
    e.stopPropagation();
    setSelectedBotForSharing(bot);
    setShowSharingModal(true);
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await dispatch(respondToInvitation({ invitationId, action: 'accept' })).unwrap();
      dispatch(GetBots()); // Refresh bots list
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await dispatch(respondToInvitation({ invitationId, action: 'decline' })).unwrap();
      dispatch(GetBots()); // Refresh bots list
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const filteredBots = useMemo(() => {
    return botsData
      .filter(bot => {
        const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || bot.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'status') {
          return a.status === 'active' ? -1 : 1;
        } else if (sortBy === 'date') {
          return new Date(b.lastActive) - new Date(a.lastActive);
        }
        return 0;
      });
  }, [botsData, searchQuery, filterStatus, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      {/* Modals */}
      {showCreateModal && (
        <CreateBotModal onClose={() => setShowCreateModal(false)} />
      )}

      {showSharingModal && selectedBotForSharing && (
        <SharingModal
          bot={selectedBotForSharing}
          onClose={() => {
            setShowSharingModal(false);
            setSelectedBotForSharing(null);
          }}
        />
      )}

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={logo} className="w-8 h-8" alt="CustomerBot" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My AI Assistants</h1>
                  <p className="text-gray-600">
                    {botsData.length} bots available
                    {invitations.length > 0 && `, ${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/docs')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Documentation</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Bot</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bots', value: botsData.length, icon: MessageSquare },
            { label: 'Active Bots', value: botsData.filter(b => b.status === 'active').length, icon: Activity },
            { label: 'Total Conversations', value: '2.4k', icon: Users },
            { label: 'This Month', value: '847', icon: MessageSquare }
          ].map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assistants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <SimpleDropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {filterStatus === 'all' ? 'All Status' : filterStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  }
                >
                  {(close) => (
                    <>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setFilterStatus('all');
                          close();
                        }}
                      >
                        All Status
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setFilterStatus('active');
                          close();
                        }}
                      >
                        Active
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setFilterStatus('inactive');
                          close();
                        }}
                      >
                        Inactive
                      </button>
                    </>
                  )}
                </SimpleDropdown>

                <SimpleDropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <ArrowUpDown className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Sort: {sortBy === 'name' ? 'Name' : sortBy === 'status' ? 'Status' : 'Date'}
                      </span>
                    </button>
                  }
                >
                  {(close) => (
                    <>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setSortBy('name');
                          close();
                        }}
                      >
                        Name
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setSortBy('status');
                          close();
                        }}
                      >
                        Status
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setSortBy('date');
                          close();
                        }}
                      >
                        Date
                      </button>
                    </>
                  )}
                </SimpleDropdown>
              </div>
            </div>
          </div>

          {/* Team Invitations Section */}
          {invitations.length > 0 && (
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Team Invitations</h3>
                      <p className="text-sm text-gray-600">
                        You have {invitations.length} pending team invitation{invitations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <InvitationCard
                        key={invitation._id}
                        invitation={invitation}
                        onAccept={handleAcceptInvitation}
                        onDecline={handleDeclineInvitation}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Bots Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create New Bot Card */}
              <div
                onClick={() => setShowCreateModal(true)}
                className="group border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Create Assistant</h3>
                  <p className="text-sm text-gray-600">Build a new AI assistant</p>
                </div>
              </div>

              {/* Bot Cards */}
              {filteredBots.map((bot) => (
                <div
                  key={bot.id}
                  className="border border-gray-200 rounded-lg hover:shadow-lg transition-all overflow-hidden bg-white"
                >

                  <div className="p-6">
                    {/* Bot Info */}
                    <div 
                      className="flex items-start gap-3 mb-4 cursor-pointer"
                      onClick={() => handleBotSelect(bot)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={bot.icon}
                            alt={bot.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=3b82f6&color=ffffff&size=48`;
                            }}
                          />
                        </div>
                        {bot.status === 'active' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate hover:text-gray-700 transition-colors">
                          {bot.name || 'Untitled Assistant'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {bot.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">1.2k</div>
                        <div className="text-sm text-gray-500">Conversations</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
     
                      {/* Secondary Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBotShare(e, bot);
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                          title="Share Bot"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBotEdit(e, bot);
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
                          title="Edit Bot"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setBotsActive(bot));
                            navigate(`/bot-settings`);
                          }}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm font-medium"
                          title="Bot Settings"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline">Settings</span>
                        </button>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete "${bot.name}"?`)) {
                            handleBotDelete(e, bot._id);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Bot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredBots.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bots found</h3>
                <p className="text-gray-500 mb-4">No bots found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-900 hover:underline font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}