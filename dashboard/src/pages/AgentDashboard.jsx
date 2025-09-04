import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';
import { activeBotSelector } from '../store/global.Selctor';
import { AgentDashboard } from '../components/AgentDashboard';
import { AgentChatInterface } from '../components/AgentChatInterface';
import socketService from '../services/socketService';
import { toastLoader } from '../components/ToastLoader';

export function AgentDashboardPage() {
  const activeBot = useSelector(activeBotSelector);
  const [selectedSession, setSelectedSession] = useState(null);
  const [agentStats, setAgentStats] = useState({
    activeChats: 0,
    resolvedToday: 0,
    averageResponseTime: '1.2s',
    customerSatisfaction: 4.8,
    totalResolved: 0,
    pendingQueue: 0
  });

  useEffect(() => {
    if (activeBot) {
      // Connect as agent
      socketService.connect(localStorage.getItem('authToken'));
      socketService.joinAsAgent(activeBot._id);

      // Listen for session updates
      socketService.on('session-assigned', (data) => {
        if (data.sessionId) {
          setSelectedSession(data.session);
          toastLoader.success(
            'Session Assigned',
            'You are now handling this customer conversation'
          );
        }
      });

      // Listen for session resolved
      socketService.on('session-resolved', (data) => {
        if (selectedSession && selectedSession._id === data.sessionId) {
          setSelectedSession(null);
          toastLoader.success(
            'Session Resolved',
            'The customer conversation has been successfully closed'
          );
          
          // Update stats
          setAgentStats(prev => ({
            ...prev,
            resolvedToday: prev.resolvedToday + 1,
            totalResolved: prev.totalResolved + 1,
            activeChats: Math.max(0, prev.activeChats - 1)
          }));
        }
      });

      // Listen for new support requests
      socketService.on('support-request', (data) => {
        setAgentStats(prev => ({
          ...prev,
          pendingQueue: prev.pendingQueue + 1
        }));
        toastLoader.info(
          'Support Request',
          'A new customer needs assistance'
        );
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [activeBot, selectedSession]);

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setAgentStats(prev => ({
      ...prev,
      activeChats: prev.activeChats + 1,
      pendingQueue: Math.max(0, prev.pendingQueue - 1)
    }));
  };

  const handleSessionResolve = (sessionId, rating, feedback) => {
    setSelectedSession(null);
    setAgentStats(prev => ({
      ...prev,
      resolvedToday: prev.resolvedToday + 1,
      totalResolved: prev.totalResolved + 1,
      activeChats: Math.max(0, prev.activeChats - 1)
    }));
  };

  if (!activeBot) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bot Selected</h2>
          <p className="text-gray-600">Please select a bot to start handling support sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
                <p className="text-gray-600">Managing support for {activeBot.name}</p>
              </div>
            </div>
            
            {/* Agent Stats Summary */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{agentStats.activeChats}</div>
                <div className="text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{agentStats.resolvedToday}</div>
                <div className="text-gray-600">Resolved Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{agentStats.pendingQueue}</div>
                <div className="text-gray-600">In Queue</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Agent Dashboard */}
          <div className="lg:col-span-1">
            <AgentDashboard 
              botId={activeBot._id} 
              onSessionSelect={handleSessionSelect}
            />
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <AgentChatInterface 
              session={selectedSession}
              onClose={() => setSelectedSession(null)}
              onResolve={handleSessionResolve}
            />
          </div>
        </div>
      </div>
    </div>
  );
}