import React from 'react';
import { Puzzle, Code, Smartphone, Globe, ArrowRight, CheckCircle } from 'lucide-react';

const platforms = [
  { name: 'WordPress', users: '40M+', logo: '📝' },
  { name: 'Shopify', users: '2M+', logo: '🛍️' },
  { name: 'React', users: '15M+', logo: '⚛️' },
  { name: 'Webflow', users: '3M+', logo: '🌊' },
  { name: 'Squarespace', users: '4M+', logo: '⬜' },
  { name: 'HTML/JS', users: 'Universal', logo: '🌐' }
];

const apiFeatures = [
  'RESTful API with full documentation',
  'Webhook support for real-time events',
  'SDKs for popular programming languages',
  'Rate limiting and authentication',
  'Comprehensive error handling',
  'Real-time chat via WebSockets'
];

export function Integration() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Integrate with your existing tools
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect CustomerBot with your favorite platforms and tools. Works everywhere your customers are.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Platform Integrations */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-4 sm:mb-6">
              <Puzzle className="w-4 h-4" />
              <span>Platform Integrations</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Works with your favorite platforms
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {platforms.map((platform, index) => (
                <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <span className="text-xl sm:text-2xl">{platform.logo}</span>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900">{platform.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{platform.users} sites</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base">
              <span>View all integrations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* API & Mobile */}
          <div className="space-y-8 sm:space-y-12">
            {/* API Section */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3 sm:mb-4">
                <Code className="w-4 h-4" />
                <span>Developer API</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Powerful API for custom integrations
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                {apiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile App Section */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3 sm:mb-4">
                <Smartphone className="w-4 h-4" />
                <span>Mobile App</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Native mobile apps
              </h3>
              
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Download our mobile app for iOS and Android. Manage support tickets, respond to customers, and collaborate with your team from anywhere.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  <span>📱</span>
                  <span>App Store</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  <span>🤖</span>
                  <span>Google Play</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}