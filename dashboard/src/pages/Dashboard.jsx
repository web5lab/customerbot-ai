import { Activity, Users, FileText, Brain, TrendingUp, MessageSquare, Zap, Clock, Target, Award } from 'lucide-react';
import { GetBots, getBotStats, getDashboardStats } from '../store/global.Action';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { activeBotSelector, botStatsSelector, dashboardStatsSelector } from '../store/global.Selctor';
import { getUserSubscription, getUsageStats } from '../store/global.Action';


export function Dashboard() {
  const dispatch = useDispatch();
  const activeBot = useSelector(activeBotSelector);
  const botStats = useSelector(botStatsSelector);
  const dashboardStats = useSelector(dashboardStatsSelector);

  useEffect(() => {
    dispatch(GetBots());
    dispatch(getDashboardStats());
    dispatch(getUserSubscription());
    dispatch(getUsageStats());
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(() => {
      dispatch(getDashboardStats());
      if (activeBot) {
        dispatch(getBotStats({ botId: activeBot._id }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, activeBot]);

  useEffect(() => {
    if (activeBot) {
      dispatch(getBotStats({ botId: activeBot._id }));
    }
  }, [activeBot, dispatch]);

  useEffect(() => {
    dispatch(GetBots());
    dispatch(getDashboardStats());
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(() => {
      dispatch(getDashboardStats());
      if (activeBot) {
        dispatch(getBotStats({ botId: activeBot._id }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, activeBot]);

  useEffect(() => {
    if (activeBot) {
      dispatch(getBotStats({ botId: activeBot._id }));
    }
  }, [activeBot, dispatch]);

  // Generate stats from real data
  const stats = [
    {
      label: 'Total Conversations',
      value: botStats?.totalConversations?.toLocaleString() || dashboardStats?.stats?.totalConversations?.toLocaleString() || '0',
      icon: MessageSquare,
      change: dashboardStats?.growth?.conversations || '+0%',
      changeType: 'positive'
    },
    {
      label: 'Active Users',
      value: botStats?.activeUsers?.toLocaleString() || dashboardStats?.stats?.activeUsers?.toLocaleString() || '0',
      icon: Users,
      change: dashboardStats?.growth?.users || '+0%',
      changeType: 'positive'
    }
  ];

  // Generate recent activities from real data
  const recentActivities = dashboardStats?.recentActivity || [
    { 
      id: 1, 
      action: 'No recent activity', 
      time: 'Just now', 
      type: 'system',
      icon: Activity
    }
  ];

  const systemStatus = [
    { 
      label: 'API Status', 
      status: 'Operational', 
      icon: Target 
    },
    { 
      label: 'Bot Status', 
      status: activeBot ? 'Active' : 'No Bot Selected', 
      icon: Brain 
    },
    { 
      label: 'Database', 
      status: 'Connected', 
      icon: Award 
    },
  ];

  // Generate recent activities from real data
  const recentActivities = dashboardStats?.recentActivity || [
    { 
      id: 1, 
      action: 'No recent activity', 
      time: 'Just now', 
      type: 'system',
      icon: Activity
    }
  ];

  const systemStatus = [
    { 
      label: 'API Status', 
      status: 'Operational', 
      icon: Target 
    },
    { 
      label: 'Bot Status', 
      status: activeBot ? 'Active' : 'No Bot Selected', 
      icon: Brain 
    },
    { 
      label: 'Database', 
      status: 'Connected', 
      icon: Award 
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your AI assistants</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon, change, changeType }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
                <span className={`text-sm font-medium ${
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change}
                </span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-gray-600 text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Performance Overview */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bot Performance</h3>
                {activeBot && (
                  <span className="text-sm text-gray-600">
                    {activeBot.name}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              {botStats ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {botStats.totalMessages.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Messages</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(botStats.averageResponseTime / 1000).toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {botStats.resolutionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Resolution Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {new Date(botStats.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    {activeBot ? 'Loading bot statistics...' : 'Select a bot to view performance metrics'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemStatus.map(({ label, status, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      status === 'Operational' || status === 'Active' || status === 'Connected' 
                        ? 'text-green-600 bg-green-100' 
                        : status === 'No Bot Selected'
                          ? 'text-yellow-600 bg-yellow-100'
                          : 'text-red-600 bg-red-100'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = '/training'}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Brain className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Manage Training</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/botchat'}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Test Bot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Activity Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.botName && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {activity.botName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}