import { useState } from 'react';
import { useBot } from '../contexts/BotContext';
import { 
  Bot, 
  Save, 
  Globe, 
  Shield,
  Plus,
  Trash2
} from 'lucide-react';

export function BotSettings() {
  const { selectedBot } = useBot();
  const [settings, setSettings] = useState({
    maxChatTextSize: 1000,
    urlWhitelist: ['https://example.com', 'https://api.trusted-service.com']
  });

  const [newUrl, setNewUrl] = useState('');

  const handleSave = () => {
    console.log('Saving bot settings:', settings);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addUrl = () => {
    if (newUrl.trim() && !settings.urlWhitelist.includes(newUrl.trim())) {
      setSettings(prev => ({
        ...prev,
        urlWhitelist: [...prev.urlWhitelist, newUrl.trim()]
      }));
      setNewUrl('');
    }
  };

  const removeUrl = (urlToRemove) => {
    setSettings(prev => ({
      ...prev,
      urlWhitelist: prev.urlWhitelist.filter(url => url !== urlToRemove)
    }));
  };

  if (!selectedBot) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bot Selected</h2>
          <p className="text-gray-600">Please select a bot to configure its settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Bot className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bot Settings</h1>
                <p className="text-gray-600">Configure {selectedBot.name} security settings</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Abuse Protection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Abuse Protection</h2>
              <p className="text-gray-600">Configure limits to prevent abuse</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Chat Text Size (characters)
            </label>
            <input
              type="number"
              value={settings.maxChatTextSize}
              onChange={(e) => updateSetting('maxChatTextSize', parseInt(e.target.value) || 0)}
              min="100"
              max="10000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter maximum characters allowed per message"
            />
            <p className="text-sm text-gray-500 mt-1">
              Messages longer than this limit will be rejected
            </p>
          </div>
        </div>

        {/* URL Whitelist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100">
              <Globe className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">URL Whitelist</h2>
              <p className="text-gray-600">Allowed domains for bot interactions</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Add New URL */}
            <div className="flex gap-3">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={addUrl}
                disabled={!newUrl.trim()}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* URL List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Whitelisted URLs:</h3>
              {settings.urlWhitelist.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <Globe className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No URLs in whitelist</p>
                  <p className="text-sm">Add URLs that your bot is allowed to access</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settings.urlWhitelist.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-mono text-sm">{url}</span>
                      </div>
                      <button
                        onClick={() => removeUrl(url)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}