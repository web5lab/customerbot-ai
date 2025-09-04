import { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, Users, MessageSquare, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Zap, Target, Crown, Sparkles } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
         BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const lineChartData = [
  { day: 'Mon', ai: 420, human: 180 },
  { day: 'Tue', ai: 380, human: 220 },
  { day: 'Wed', ai: 550, human: 250 },
  { day: 'Thu', ai: 480, human: 190 },
  { day: 'Fri', ai: 600, human: 280 },
  { day: 'Sat', ai: 350, human: 150 },
  { day: 'Sun', ai: 300, human: 120 }
];

const barChartData = [
  { hour: '00:00', time: 1.2 },
  { hour: '04:00', time: 0.8 },
  { hour: '08:00', time: 2.5 },
  { hour: '12:00', time: 1.8 },
  { hour: '16:00', time: 2.2 },
  { hour: '20:00', time: 1.5 }
];

const pieChartData = [
  { name: 'Technical', value: 35 },
  { name: 'Billing', value: 25 },
  { name: 'Account', value: 20 },
  { name: 'General', value: 20 }
];

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'];

const stats = [
  {
    label: 'Total Conversations',
    value: '45.2k',
    change: '+12.5%',
    isPositive: true,
    icon: MessageSquare,
    color: 'from-sky-500 to-blue-500',
    description: 'Monthly conversations'
  },
  {
    label: 'Response Time',
    value: '1.2s',
    change: '-25.3%',
    isPositive: true,
    icon: Clock,
    color: 'from-emerald-500 to-teal-500',
    description: 'Average response time'
  },
  {
    label: 'Active Users',
    value: '8.9k',
    change: '+8.1%',
    isPositive: true,
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
    description: 'Daily active users'
  },
  {
    label: 'Resolution Rate',
    value: '94.2%',
    change: '+5.4%',
    isPositive: true,
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-500',
    description: 'First contact resolution'
  }
];

const charts = [
  {
    title: 'Conversation Volume',
    description: 'Daily conversations handled by AI vs Human agents',
    icon: LineChart,
    color: 'from-sky-500 to-blue-500'
  },
  {
    title: 'Response Times',
    description: 'Average response time distribution by hour',
    icon: BarChart,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    title: 'Issue Categories',
    description: 'Distribution of customer inquiries by type',
    icon: PieChart,
    color: 'from-emerald-500 to-teal-500'
  }
];

export function Dashboard() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-6 py-3 rounded-full border border-cyan-200 shadow-lg mb-6">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">Analytics Dashboard</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powerful Analytics
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get real-time insights into your customer support performance with our comprehensive analytics suite
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.isPositive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="font-bold text-sm">{stat.change}</span>
                  </div>
                </div>
                
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {charts.map((chart, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{chart.title}</h3>
                  <p className="text-sm text-gray-600">{chart.description}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${chart.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <chart.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 overflow-hidden">
                {index === 0 && (
                  <ResponsiveContainer width="100%\" height="100%">
                    <RechartsLineChart data={lineChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          color: '#000',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Line type="monotone" dataKey="ai" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="human" stroke="#6366f1" strokeWidth={3} dot={false} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
                {index === 1 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={barChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hour" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          color: '#000',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar dataKey="time" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
                {index === 2 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          color: '#000',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
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
    </section>
  );
}