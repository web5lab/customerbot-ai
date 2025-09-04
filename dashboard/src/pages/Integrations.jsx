import { useState } from 'react';
import { 
  Code,
  Copy,
  Check,
  Settings
} from 'lucide-react';

export function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState('react');
  const [copiedCode, setCopiedCode] = useState('');

  const getIntegrationCode = () => {
    const botId = 'bot_' + Math.random().toString(36).substr(2, 9);

    const codes = {
      react: `<script
  src="https://cdn.customerbot.ai/widget.js"
  data-bot-id="${botId}"
  data-theme="modern"
></script>`,
      html: `<script src="https://cdn.customerbot.ai/widget.js" data-bot-id="${botId}"></script>`,
      wordpress: `[customerbot bot-id="${botId}" theme="modern"]`
    };

    return codes[selectedIntegration];
  };

  const copyToClipboard = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <Code className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600">Embed your chatbot on your website</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Integration Code Section */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-gray-200">
                <Code className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Integration Code</h2>
                <p className="text-gray-600">Copy the code below to embed your chatbot</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Platform Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedIntegration('react')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedIntegration === 'react'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                React
              </button>
              <button
                onClick={() => setSelectedIntegration('html')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedIntegration === 'html'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setSelectedIntegration('wordpress')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedIntegration === 'wordpress'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                WordPress
              </button>
            </div>

            {/* Code Display */}
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{getIntegrationCode()}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(getIntegrationCode(), selectedIntegration)}
                className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedCode === selectedIntegration ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-300" />
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <p className="text-sm text-blue-800">
                {selectedIntegration === 'react' && 'Add this script tag to your React app\'s public/index.html file, preferably before the closing </body> tag.'}
                {selectedIntegration === 'html' && 'Paste this code before the closing </body> tag in your HTML file.'}
                {selectedIntegration === 'wordpress' && 'Add this shortcode to any page, post, or widget where you want the chatbot to appear.'}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Responsive design that works on all devices</li>
                <li>• Customizable theme and colors</li>
                <li>• Lightweight and fast loading</li>
                <li>• No impact on your website's performance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Setup Steps */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Quick Setup Steps
          </h3>
          <ol className="text-sm text-gray-700 space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Select your platform tab above (React, HTML, or WordPress)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Copy the provided code snippet using the copy button</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Paste it into your website according to the platform instructions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Your chatbot will appear on your website instantly!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}