import { Activity, Users, FileText, Brain, TrendingUp, MessageSquare, Zap, Clock, Target, Award } from 'lucide-react';
import { GetBots } from '../store/global.Action';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

const stats = [
  {
    label: 'Active Sessions',
    value: '24',
    icon: Activity,
    change: '+12%',
    changeType: 'positive'
  },
  {
    label: 'Total Users',
    value: '1,234',
    icon: Users,
    change: '+8%',
    changeType: 'positive'
  },
  {
    label: 'Documents',
    value: '56',
    icon: FileText,
    change: '+15%',
    changeType: 'positive'
  },
  {
    label: 'Training Items',
    value: '89',
    icon: Brain,
    change: '-2%',
    changeType: 'negative'
  },
];

const recentActivities = [
  { 
    id: 1, 
    action: 'New training data added', 
    time: '2 minutes ago', 
    type: 'training',
    icon: Brain
  },
  { 
    id: 2, 
    action: 'Bot conversation completed', 
    time: '5 minutes ago', 
    type: 'conversation',
    icon: MessageSquare
  },
  { 
    id: 3, 
    action: 'System performance optimized', 
    time: '1 hour ago', 
    type: 'system',
    icon: Zap
  },
  { 
    id: 4, 
    action: 'New user registered', 
    time: '2 hours ago', 
    type: 'user',
    icon: Users
  },
];

const systemStatus = [
  { label: 'API Status', status: 'Operational', icon: Target },
  { label: 'Training Pipeline', status: 'Active', icon: Brain },
  { label: 'Smart Contract', status: 'Connected', icon: Award },
];

export function Dashboard() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetBots());
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(() => {
      dispatch(getDashboardStats());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

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
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <activity.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
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
                <button className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Brain className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Start Training</span>
                </button>
                <button className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">New Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}