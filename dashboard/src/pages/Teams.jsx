import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search,
  Bot,
  ArrowLeft,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit3
} from 'lucide-react';
import { 
  botsSelector, 
  activeBotSelector, 
  currentTeamSelector, 
  teamPermissionsSelector 
} from '../store/global.Selctor';
import { 
  GetBots, 
  getBotTeam, 
  inviteTeamMember, 
  updateTeamMember, 
  removeTeamMember, 
  getTeamPermissions 
} from '../store/global.Action';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { TeamInviteModal } from '../components/TeamInviteModal';
import toast from 'react-hot-toast';

export function Teams() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const bots = useSelector(botsSelector);
  const activeBot = useSelector(activeBotSelector);
  const currentTeam = useSelector(currentTeamSelector);
  const teamPermissions = useSelector(teamPermissionsSelector);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(GetBots());
    
    // Handle invitation acceptance from email links
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get('action');
    const botId = urlParams.get('botId');
    const memberId = urlParams.get('memberId');
    const token = urlParams.get('token');
    
    if (action === 'accept' && botId && memberId && token) {
      handleAcceptInvitation(botId, memberId, token);
    }
  }, [dispatch, location]);

  useEffect(() => {
    if (activeBot) {
      dispatch(getBotTeam({ botId: activeBot._id }));
      dispatch(getTeamPermissions({ botId: activeBot._id }));
    }
  }, [activeBot, dispatch]);

  const handleAcceptInvitation = async (botId, memberId, token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/team/accept-invitation?botId=${botId}&memberId=${memberId}&token=${token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        toast.success('Invitation accepted successfully!');
        if (activeBot) {
          dispatch(getBotTeam({ botId: activeBot._id }));
        }
      } else {
        toast.error('Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Error accepting invitation');
    }
  };

  const handleInviteMember = async (email, role) => {
    if (!selectedBot) return;
    
    setIsLoading(true);
    try {
      await inviteTeamMember({ botId: selectedBot, email, role });
      dispatch(getBotTeam({ botId: selectedBot }));
      setShowInviteModal(false);
      setSelectedBot(null);
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!activeBot) return;
    
    try {
      await removeTeamMember({ botId: activeBot._id, memberId });
      dispatch(getBotTeam({ botId: activeBot._id }));
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    if (!activeBot) return;
    
    try {
      await updateTeamMember({ botId: activeBot._id, memberId, role: newRole });
      dispatch(getBotTeam({ botId: activeBot._id }));
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const getTotalMembers = () => {
    return currentTeam?.members?.length || 0;
  };

  const getBotMembers = () => {
    const members = currentTeam?.members || [];
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const canInviteMembers = teamPermissions?.canInvite || true;
  const canRemoveMembers = teamPermissions?.canRemoveMembers || true;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600">
                  {activeBot ? `Managing ${activeBot.name} team` : 'Select a bot to manage team'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!activeBot ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6 border border-gray-200">
              <Bot className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No bot selected</h3>
            <p className="text-gray-500 mb-8">
              Please select a bot from the sidebar to manage its team
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Search and Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeBot.name} Team ({getTotalMembers()} members)
                </h2>
                {canInviteMembers && (
                  <button
                    onClick={() => {
                      setSelectedBot(activeBot._id);
                      setShowInviteModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Invite Member</span>
                  </button>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Team Members List */}
            <div className="bg-white border border-gray-200 rounded-lg">
              {currentTeam?.members?.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {getBotMembers().map((member) => (
                    <div key={member._id} className="p-6">
                      <TeamMemberCard
                        member={member}
                        onUpdateRole={handleUpdateMemberRole}
                        onRemove={handleRemoveMember}
                        canEdit={canRemoveMembers}
                        isOwner={member.userId === currentTeam?.ownerId}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No team members</h4>
                  <p className="text-gray-500 mb-8">
                    This bot doesn't have any team members yet
                  </p>
                  {canInviteMembers && (
                    <button
                      onClick={() => {
                        setSelectedBot(activeBot._id);
                        setShowInviteModal(true);
                      }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Invite First Member
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Invite Modal */}
        <TeamInviteModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedBot(null);
          }}
          onInvite={handleInviteMember}
          botName={activeBot?.name}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}