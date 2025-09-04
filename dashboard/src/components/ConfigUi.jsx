import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Palette, 
  Type, 
  Layout, 
  MessageSquare, 
  Settings, 
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronRight,
  Bot,
  User,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { setUiConfig } from '../store/global.Slice';
import { uiConfigSelector, activeBotSelector } from '../store/global.Selctor';
import { updateChatBot } from '../store/global.Action';

const colorPalettes = [
  { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#0284c7', bg: '#f0f9ff' },
  { name: 'Forest Green', primary: '#10b981', secondary: '#059669', bg: '#f0fdf4' },
  { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#7c3aed', bg: '#faf5ff' },
  { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c', bg: '#fff7ed' },
  { name: 'Rose Pink', primary: '#f43f5e', secondary: '#e11d48', bg: '#fff1f2' },
  { name: 'Midnight', primary: '#1f2937', secondary: '#374151', bg: '#f9fafb' }
];

const fontSizes = [
  { label: 'Small', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'Extra Large', value: '20px' }
];

const chatSizes = [
  { label: 'Compact', value: 'compact', icon: Smartphone },
  { label: 'Medium', value: 'medium', icon: Tablet },
  { label: 'Large', value: 'large', icon: Monitor },
  { label: 'Full Screen', value: 'full', icon: Monitor }
];

const animations = [
  { label: 'Fade In', value: 'fade' },
  { label: 'Slide Up', value: 'slide-up' },
  { label: 'Slide Right', value: 'slide-right' },
  { label: 'Scale', value: 'scale' }
];

export function ConfigUI() {
  const dispatch = useDispatch();
  const uiConfig = useSelector(uiConfigSelector);
  const activeBot = useSelector(activeBotSelector);
  const [activeSection, setActiveSection] = useState('appearance');
  const [expandedGroups, setExpandedGroups] = useState(new Set(['colors', 'layout']));

  const updateConfig = (key, value) => {
    dispatch(setUiConfig({ [key]: value }));
  };

  const handleSave = async () => {
    if (activeBot) {
      try {
        const response = await updateChatBot({ 
          data: uiConfig, 
          botId: activeBot._id 
        });
        
        // Refresh dashboard stats after saving config
        dispatch(getDashboardStats());
        
        alert('Configuration saved successfully!');
      } catch (error) {
        console.error('Error saving configuration:', error);
        alert('Failed to save configuration');
      }
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all customizations to default values?')) {
      dispatch(setUiConfig({
        selectedPalette: 0,
        isCustomColorMode: false,
        customPrimaryColor: '#3B82F6',
        customSecondaryColor: '#1c1d1d',
        customBgColor: '#f0f9ff',
        selectedFontSize: '16px',
        chatSize: 'medium',
        animationStyle: 'slide-up',
        borderRadius: '12px',
        shadowIntensity: 'medium'
      }));
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'content', label: 'Content', icon: MessageSquare },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  const ColorPicker = ({ label, value, onChange, description }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label.replace(/\s+/g, '-').toLowerCase()}`).click()}
        />
        <input
          id={`color-${label.replace(/\s+/g, '-').toLowerCase()}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const ToggleSwitch = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const CollapsibleGroup = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedGroups.has(id);
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleGroup(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <CollapsibleGroup id="colors" title="Colors & Theme" icon={Palette}>
        <div className="space-y-6">
          {/* Color Palettes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Color Palette</label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {colorPalettes.map((palette, index) => (
                <button
                  key={index}
                  onClick={() => {
                    updateConfig('selectedPalette', index);
                    updateConfig('isCustomColorMode', false);
                    updateConfig('customPrimaryColor', palette.primary);
                    updateConfig('customSecondaryColor', palette.secondary);
                    updateConfig('customBgColor', palette.bg);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    uiConfig.selectedPalette === index && !uiConfig.isCustomColorMode
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bg }} />
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700">{palette.name}</div>
                </button>
              ))}
            </div>

            {/* Custom Colors Toggle */}
            <button
              onClick={() => updateConfig('isCustomColorMode', !uiConfig.isCustomColorMode)}
              className={`w-full p-3 rounded-lg border-2 transition-all ${
                uiConfig.isCustomColorMode
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">Custom Colors</div>
            </button>

            {/* Custom Color Pickers */}
            {uiConfig.isCustomColorMode && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                <ColorPicker
                  label="Primary Color"
                  value={uiConfig.customPrimaryColor}
                  onChange={(value) => updateConfig('customPrimaryColor', value)}
                  description="Main accent color for buttons and highlights"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={uiConfig.customSecondaryColor}
                  onChange={(value) => updateConfig('customSecondaryColor', value)}
                  description="Supporting color for secondary elements"
                />
                <ColorPicker
                  label="Background Color"
                  value={uiConfig.customBgColor}
                  onChange={(value) => updateConfig('customBgColor', value)}
                  description="Chat background color"
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="typography" title="Typography" icon={Type}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Font Size</label>
            <div className="grid grid-cols-2 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateConfig('selectedFontSize', size.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    uiConfig.selectedFontSize === size.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{size.label}</div>
                  <div className="text-xs text-gray-500" style={{ fontSize: size.value }}>
                    Sample text
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="design" title="Design Elements" icon={Sparkles}>
        <div className="space-y-4">
          {/* Border Radius */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Border Radius: {uiConfig.borderRadius}
            </label>
            <input
              type="range"
              min="0"
              max="24"
              step="2"
              value={parseInt(uiConfig.borderRadius)}
              onChange={(e) => updateConfig('borderRadius', `${e.target.value}px`)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Sharp</span>
              <span>Rounded</span>
            </div>
          </div>

          {/* Shadow Intensity */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Shadow Intensity</label>
            <div className="grid grid-cols-4 gap-2">
              {['none', 'light', 'medium', 'heavy'].map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => updateConfig('shadowIntensity', intensity)}
                  className={`p-2 rounded-lg border-2 transition-all text-xs font-medium capitalize ${
                    uiConfig.shadowIntensity === intensity
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleGroup>
    </div>
  );

  const renderLayoutSection = () => (
    <div className="space-y-6">
      <CollapsibleGroup id="size" title="Chat Size" icon={Layout}>
        <div className="grid grid-cols-2 gap-3">
          {chatSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => updateConfig('chatSize', size.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                uiConfig.chatSize === size.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <size.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-medium">{size.label}</div>
            </button>
          ))}
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="position" title="Chat Position" icon={Globe}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Bottom Right', value: 'bottom-right' },
            { label: 'Bottom Left', value: 'bottom-left' },
            { label: 'Top Right', value: 'top-right' },
            { label: 'Top Left', value: 'top-left' }
          ].map((position) => (
            <button
              key={position.value}
              onClick={() => updateConfig('chatPosition', position.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                uiConfig.chatPosition === position.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{position.label}</div>
            </button>
          ))}
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="animation" title="Animations" icon={Zap}>
        <div className="grid grid-cols-2 gap-3">
          {animations.map((animation) => (
            <button
              key={animation.value}
              onClick={() => updateConfig('animationStyle', animation.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                uiConfig.animationStyle === animation.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{animation.label}</div>
            </button>
          ))}
        </div>
      </CollapsibleGroup>
    </div>
  );

  const renderContentSection = () => (
    <div className="space-y-6">
      <CollapsibleGroup id="avatars" title="Avatars" icon={User}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Bot Avatar</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                {uiConfig.botAvatar ? (
                  <img src={uiConfig.botAvatar} alt="Bot" className="w-full h-full object-cover" />
                ) : (
                  <Bot className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <input
                type="url"
                value={uiConfig.botAvatar}
                onChange={(e) => updateConfig('botAvatar', e.target.value)}
                placeholder="https://example.com/bot-avatar.png"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">User Avatar</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                {uiConfig.userAvatar ? (
                  <img src={uiConfig.userAvatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <input
                type="url"
                value={uiConfig.userAvatar}
                onChange={(e) => updateConfig('userAvatar', e.target.value)}
                placeholder="https://example.com/user-avatar.png"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="messages" title="Messages & Text" icon={MessageSquare}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Bot Name</label>
            <input
              type="text"
              value={uiConfig.botName}
              onChange={(e) => updateConfig('botName', e.target.value)}
              placeholder="AI Assistant"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Welcome Message</label>
            <textarea
              value={uiConfig.welcomeMessage}
              onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
              placeholder="Hello! How can I help you today?"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Input Placeholder</label>
            <input
              type="text"
              value={uiConfig.placeholder}
              onChange={(e) => updateConfig('placeholder', e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">System Prompt</label>
            <textarea
              value={uiConfig.systemPrompt}
              onChange={(e) => updateConfig('systemPrompt', e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="quick-questions" title="Quick Questions" icon={Zap}>
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Add up to 5 quick questions for users</p>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index}>
              <input
                type="text"
                value={uiConfig.customQuestions[index] || ''}
                onChange={(e) => {
                  const newQuestions = [...(uiConfig.customQuestions || [])];
                  newQuestions[index] = e.target.value;
                  updateConfig('customQuestions', newQuestions.filter(q => q.trim()));
                }}
                placeholder={`Quick question ${index + 1}`}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </CollapsibleGroup>
    </div>
  );

  const renderFeaturesSection = () => (
    <div className="space-y-6">
      <CollapsibleGroup id="chat-features" title="Chat Features" icon={MessageSquare}>
        <div className="space-y-1">
          <ToggleSwitch
            label="Typing Indicator"
            checked={uiConfig.enableTypingIndicator}
            onChange={(value) => updateConfig('enableTypingIndicator', value)}
            description="Show when bot is typing"
          />
          <ToggleSwitch
            label="Quick Replies"
            checked={uiConfig.enableQuickReplies}
            onChange={(value) => updateConfig('enableQuickReplies', value)}
            description="Show suggested response buttons"
          />
          <ToggleSwitch
            label="Chat History"
            checked={uiConfig.enableHistory}
            onChange={(value) => updateConfig('enableHistory', value)}
            description="Allow users to view previous conversations"
          />
          <ToggleSwitch
            label="FAQ Help Center"
            checked={uiConfig.enableFAQ}
            onChange={(value) => updateConfig('enableFAQ', value)}
            description="Provide quick access to frequently asked questions"
          />
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="support-features" title="Support Features" icon={Shield}>
        <div className="space-y-1">
          <ToggleSwitch
            label="Human Handover"
            checked={uiConfig.enableHandover}
            onChange={(value) => updateConfig('enableHandover', value)}
            description="Allow escalation to human agents"
          />
          <ToggleSwitch
            label="Lead Capture"
            checked={uiConfig.enableLeadCapture}
            onChange={(value) => updateConfig('enableLeadCapture', value)}
            description="Collect visitor contact information"
          />
          <ToggleSwitch
            label="Sound Effects"
            checked={uiConfig.enableSounds}
            onChange={(value) => updateConfig('enableSounds', value)}
            description="Play notification sounds"
          />
          <ToggleSwitch
            label="Show Branding"
            checked={uiConfig.showBranding}
            onChange={(value) => updateConfig('showBranding', value)}
            description="Display 'Powered by' footer"
          />
        </div>
      </CollapsibleGroup>
    </div>
  );

  const renderAdvancedSection = () => (
    <div className="space-y-6">
      <CollapsibleGroup id="performance" title="Performance" icon={Zap}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Typing Delay: {uiConfig.typingDelay}ms
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={uiConfig.typingDelay}
              onChange={(e) => updateConfig('typingDelay', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Message History Limit: {uiConfig.messageHistoryLimit}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={uiConfig.messageHistoryLimit}
              onChange={(e) => updateConfig('messageHistoryLimit', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Max Message Length: {uiConfig.maxMessageLength}
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={uiConfig.maxMessageLength}
              onChange={(e) => updateConfig('maxMessageLength', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="branding" title="Company Branding" icon={Globe}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Company Name</label>
            <input
              type="text"
              value={uiConfig.companyName}
              onChange={(e) => updateConfig('companyName', e.target.value)}
              placeholder="CustomerBot"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Header Title</label>
            <input
              type="text"
              value={uiConfig.headerTitle}
              onChange={(e) => updateConfig('headerTitle', e.target.value)}
              placeholder="Chat Support"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Header Subtitle</label>
            <input
              type="text"
              value={uiConfig.headerSubtitle}
              onChange={(e) => updateConfig('headerSubtitle', e.target.value)}
              placeholder="We're here to help"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Support Email</label>
            <input
              type="email"
              value={uiConfig.supportEmail}
              onChange={(e) => updateConfig('supportEmail', e.target.value)}
              placeholder="support@company.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="custom-css" title="Custom CSS" icon={Settings}>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Additional CSS</label>
          <textarea
            value={uiConfig.customCSS}
            onChange={(e) => updateConfig('customCSS', e.target.value)}
            placeholder="/* Add custom CSS here */"
            rows={6}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Advanced: Add custom CSS to override default styles
          </p>
        </div>
      </CollapsibleGroup>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'appearance': return renderAppearanceSection();
      case 'layout': return renderLayoutSection();
      case 'content': return renderContentSection();
      case 'features': return renderFeaturesSection();
      case 'advanced': return renderAdvancedSection();
      default: return renderAppearanceSection();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chat Customization</h2>
            <p className="text-sm text-gray-600">Customize your chat widget appearance and behavior</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderCurrentSection()}
      </div>
    </div>
  );
}