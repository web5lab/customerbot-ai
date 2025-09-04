import React from 'react';
import { Puzzle, ArrowRight, Box, RefreshCw, Workflow, Zap, Code, Globe, Shield, Sparkles, CheckCircle } from 'lucide-react';

const integrations = [
  {
    name: 'Seamless CRM Integration',
    description: 'Connect with popular CRM platforms to maintain customer context and history across all touchpoints.',
    icon: Box,
    color: 'from-purple-500 to-indigo-500',
    features: ['Salesforce', 'HubSpot', 'Pipedrive']
  },
  {
    name: 'Real-time Sync',
    description: 'Keep your systems in perfect harmony with bi-directional synchronization and instant updates.',
    icon: RefreshCw,
    color: 'from-emerald-500 to-teal-500',
    features: ['Live Updates', 'Data Sync', 'Event Triggers']
  },
  {
    name: 'Workflow Automation',
    description: 'Automate repetitive tasks and create custom workflows that scale with your business needs.',
    icon: Workflow,
    color: 'from-orange-500 to-amber-500',
    features: ['Custom Flows', 'Auto-routing', 'Smart Actions']
  }
];

const platforms = [
  { name: 'Shopify', logo: '🛍️', category: 'E-commerce' },
  { name: 'WordPress', logo: '📝', category: 'CMS' },
  { name: 'Slack', logo: '💬', category: 'Communication' },
  { name: 'Salesforce', logo: '☁️', category: 'CRM' },
  { name: 'HubSpot', logo: '🎯', category: 'Marketing' },
  { name: 'Zendesk', logo: '🎧', category: 'Support' },
  { name: 'Discord', logo: '🎮', category: 'Community' },
  { name: 'Telegram', logo: '✈️', category: 'Messaging' }
];

const apiFeatures = [
  {
    icon: Code,
    title: 'RESTful API',
    description: 'Comprehensive REST API with full documentation'
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'OAuth 2.0 and API key authentication'
  },
  {
    icon: Zap,
    title: 'Real-time',
    description: 'WebSocket support for live updates'
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Low-latency access worldwide'
  }
];

export function Integrations() {
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-6 py-3 rounded-full border border-orange-200 shadow-lg mb-6">
            <Puzzle className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">Integrations</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Connect with Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Favorite Tools
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Seamlessly integrate CustomerBot with your existing tech stack. Our flexible API and pre-built integrations make setup effortless.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column: Content */}
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-2xl opacity-60"></div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  200+ Integrations Available
                </div>
                
                <h3 className="text-4xl font-bold text-gray-900 mb-6">
                  Integrate with Your
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Existing Workflow
                  </span>
                </h3>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Connect CustomerBot with your existing tech stack in minutes. Our flexible API and pre-built integrations ensure seamless data flow across all your tools.
                </p>
              </div>
            </div>

            {/* Integration Features */}
            <div className="grid gap-6">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${integration.color} group-hover:scale-110 transition-transform shadow-lg`}>
                      <integration.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {integration.name}
                      </h4>
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="group inline-flex items-center gap-3 text-blue-600 font-semibold hover:text-blue-700 transition-colors text-lg">
              <span>View All Integrations</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Column: Platform Grid */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Popular Platforms
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform, index) => (
                  <div
                    key={index}
                    className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {platform.logo}
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {platform.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">{platform.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Features */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Code className="w-6 h-6" />
                Developer-Friendly API
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {apiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm">{feature.title}</h5>
                      <p className="text-xs text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="group mt-6 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all">
                <span className="text-sm font-medium">View Documentation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}