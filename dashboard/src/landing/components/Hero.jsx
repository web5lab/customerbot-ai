import React, { useState } from 'react';
import { ArrowRight, Play, Bot, Zap, CheckCircle, X, Clock, Users, MessageSquare, Star } from 'lucide-react';

export function Hero() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showIframe, setShowIframe] = useState(false);

  const handleSubmit = () => {
    if (!websiteUrl) {
      setErrorMessage('Please enter a website URL');
      return;
    }

    try {
      new URL(websiteUrl);
      setErrorMessage('');
      setShowIframe(true);
    } catch (error) {
      setErrorMessage('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  const handleWatchDemo = () => {
    setWebsiteUrl('https://example.com');
    setShowIframe(true);
    setErrorMessage('');
  };

  return (
    <section className="relative pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Centered Hero Content */}
        <div className="text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 px-3 sm:px-4 py-2 rounded-full border border-gray-200 mb-6 sm:mb-8">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
            <span className="text-xs sm:text-sm font-medium">Trusted by 10,000+ support teams</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight leading-tight">
            AI chatbot for your website
            <br />
            <span className="text-gray-600">with human backup</span>
          </h1>

          {/* Value Proposition */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Deploy intelligent customer support that works 24/7. 
            <span className="text-gray-900 font-semibold"> AI handles routine questions</span>, 
            humans take complex cases.
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 text-sm sm:text-base">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 sm:px-4 py-2 border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 font-medium">60-second setup</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 sm:px-4 py-2 border border-gray-200 shadow-sm">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">Human handoff</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 sm:px-4 py-2 border border-gray-200 shadow-sm">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700 font-medium">Mobile app included</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    placeholder="Enter your website URL to get started"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-lg sm:rounded-xl border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <span>Create Free Bot</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium text-center">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <button
              onClick={handleWatchDemo}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 sm:px-6 py-2 sm:py-3 font-medium transition-colors rounded-lg hover:bg-gray-50"
            >
              <Play className="w-4 h-4" />
              <span>Watch 2-min demo</span>
            </button>
            <span className="text-gray-400 hidden sm:inline">or</span>
            <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              View live examples →
            </button>
          </div>
        </div>
      </div>

      {/* Website Preview Modal */}
      {showIframe && (
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-8">
          <div className="relative w-full h-full max-w-screen-xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-lg sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-gray-900 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Live Demo</span>
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                  {websiteUrl || 'Demo Website'}
                </h3>
              </div>
              <button
                onClick={() => setShowIframe(false)}
                className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="Close preview"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
              <iframe
                src={websiteUrl || 'https://example.com'}
                className="w-full h-full border-none"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}