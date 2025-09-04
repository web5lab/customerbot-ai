import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Smartphone, 
  Bot, 
  Bell, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Headphones,
  Download,
  Star
} from 'lucide-react';

const mobileFeatures = [
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Instant messaging with customers across all channels'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Seamless handoffs between AI and human agents'
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get notified about urgent conversations instantly'
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Monitor performance and customer satisfaction'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance standards'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-second response times with global CDN'
  }
];

const appStats = [
  { label: 'Response Time', value: '<1s', icon: Clock },
  { label: 'Uptime', value: '99.9%', icon: Shield },
  { label: 'Languages', value: '50+', icon: Globe },
  { label: 'Support', value: '24/7', icon: Headphones }
];

export function AppFeatures() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Mobile app for support teams
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage customer support from anywhere with our native mobile app. 
            Respond to customers and collaborate with your team on the go.
          </p>
        </div>

        {/* Mobile App Preview */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
          {/* Left - Mobile Screenshots */}
          <div className="relative order-2 lg:order-1">
            <div className="flex gap-4 sm:gap-6 justify-center">
              {/* Chat List Screenshot */}
              <div className="w-40 sm:w-48 lg:w-56 h-80 sm:h-96 lg:h-[450px] bg-gray-900 rounded-2xl lg:rounded-3xl p-2 sm:p-3 shadow-xl">
                <div className="w-full h-full bg-white rounded-xl lg:rounded-2xl overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-6 sm:h-8 bg-gray-900 flex items-center justify-center">
                    <div className="text-white text-xs sm:text-sm font-medium">9:41 AM</div>
                  </div>

                  {/* App Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Support Chats</h4>
                    <p className="text-xs sm:text-sm text-gray-600">3 active conversations</p>
                  </div>

                  {/* Chat List */}
                  <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">John D.</div>
                        <div className="text-xs text-gray-600 truncate">Need help with account...</div>
                        <div className="text-xs text-gray-500">2 min ago</div>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">Sarah M.</div>
                        <div className="text-xs text-gray-600 truncate">Payment issue resolved</div>
                        <div className="text-xs text-gray-500">5 min ago</div>
                      </div>
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">Mike R.</div>
                        <div className="text-xs text-gray-600 truncate">Technical question</div>
                        <div className="text-xs text-gray-500">10 min ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Interface Screenshot */}
              <div className="w-40 sm:w-48 lg:w-56 h-80 sm:h-96 lg:h-[450px] bg-gray-900 rounded-2xl lg:rounded-3xl p-2 sm:p-3 shadow-xl">
                <div className="w-full h-full bg-white rounded-xl lg:rounded-2xl overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-6 sm:h-8 bg-gray-900 flex items-center justify-center">
                    <div className="text-white text-xs sm:text-sm font-medium">9:41 AM</div>
                  </div>

                  {/* Chat Header */}
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">John D.</div>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Agent: You
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-2 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex gap-1 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs">
                        I can't access my account
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2 justify-end">
                      <div className="bg-gray-900 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs max-w-[80%]">
                        I can help you with that. Let me check your account status.
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2 justify-end">
                      <div className="bg-gray-900 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs max-w-[80%]">
                        I've reset your password. Check your email for the new login details.
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs">
                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1 text-green-600" />
                        <span className="text-green-700">Issue resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-2 sm:p-3 border-t border-gray-200">
                    <div className="flex gap-1 sm:gap-2">
                      <input
                        className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-200 rounded-lg text-xs bg-gray-50"
                        placeholder="Type a message..."
                        disabled
                      />
                      <button className="bg-gray-900 text-white p-1 sm:p-2 rounded-lg">
                        <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Everything you need in your pocket
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Our mobile app gives your support team the flexibility to help customers 
              from anywhere, ensuring no conversation goes unanswered.
            </p>

            {/* Features List */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {[
                'Respond to customers instantly',
                'Collaborate with team members',
                'Access conversation history',
                'Receive push notifications',
                'View real-time analytics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" />
                <span>App Store</span>
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" />
                <span>Google Play</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mobileFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center mb-3 sm:mb-4 border border-gray-200 shadow-sm">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}