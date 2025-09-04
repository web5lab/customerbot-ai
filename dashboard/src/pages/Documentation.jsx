import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Bot, 
  MessageSquare, 
  Settings, 
  Users, 
  Brain, 
  Code, 
  Globe, 
  Shield, 
  Zap, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Play,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Lightbulb,
  Target,
  Rocket
} from 'lucide-react';

const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    items: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        content: `# Quick Start Guide

Get your AI assistant up and running in minutes.

## Step 1: Create Your First Bot
1. Click "New Bot" on the main dashboard
2. Enter a name for your assistant
3. Optionally add your website URL for content scanning
4. Choose training data options or skip for now
5. Click "Create" to build your AI assistant

## Step 2: Customize Your Bot
1. Select your newly created bot
2. Choose colors and themes
3. Upload custom avatars
4. Set personality with system prompts
5. Add quick questions for common inquiries
6. Save your changes

## Step 3: Test and Deploy
1. Use the preview to test conversations
2. Adjust settings based on performance
3. Copy the integration code
4. Add to your website
5. Your bot is live!`
      },
      {
        id: 'first-bot',
        title: 'Creating Your First Bot',
        content: `# Creating Your First Bot

## Bot Creation Process

### Basic Information
- **Bot Name**: Choose a clear, descriptive name
- **Website URL**: Optional but recommended for content scanning
- **Bot Icon**: Upload a custom avatar or use default

### Training Data Options
1. **Skip**: Start with basic AI knowledge
2. **Upload PDF**: Add documents for specialized knowledge
3. **Enter Text**: Add custom training content

### Best Practices
- Use clear, descriptive names
- Add relevant training data for your industry
- Test thoroughly before deploying
- Start simple and iterate`
      }
    ]
  },
  {
    id: 'customization',
    title: 'Customization',
    icon: Settings,
    items: [
      {
        id: 'appearance',
        title: 'Appearance & Themes',
        content: `# Appearance & Themes

## Color Schemes
Choose from pre-designed color palettes or create custom colors.

## Custom Colors
- **Primary Color**: Main accent color
- **Secondary Color**: Supporting color
- **Background Color**: Chat background

## Theme Modes
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes

## Typography
Choose from 4 font sizes for optimal readability.`
      },
      {
        id: 'chat-settings',
        title: 'Chat Configuration',
        content: `# Chat Configuration

## Bot Persona
Define your bot's personality and behavior with system prompts.

## Welcome Messages
Set the first message users see when opening chat.

## Quick Questions
Add up to 5 pre-written questions for common inquiries.

## Message Settings
Configure font sizes, colors, and chat behavior.`
      }
    ]
  },
  {
    id: 'training',
    title: 'Training & AI',
    icon: Brain,
    items: [
      {
        id: 'training-data',
        title: 'Training Data Types',
        content: `# Training Data Types

## PDF Documents
Upload PDF files to train your bot:
- Supported: PDF files up to 10MB
- Best for: Manuals, guides, documentation
- Limit: 20 sources per bot

## Website Content
Scrape content from web pages:
- Input: Valid website URLs
- Best for: Product pages, FAQ sections
- Automatic content extraction

## Custom Text
Add specific knowledge directly:
- Format: Plain text content
- Limit: 5,000 characters per entry
- Best for: Policies, procedures, FAQs

## Q&A Pairs
Create specific question-answer combinations for common scenarios.`
      },
      {
        id: 'ai-behavior',
        title: 'AI Behavior & Prompts',
        content: `# AI Behavior & Prompts

## System Prompts
The system prompt defines your bot's personality and behavior.

### Example System Prompts

**Customer Support:**
\`\`\`
You are a helpful customer support assistant. Always be polite and professional. 
If you don't know something, admit it and offer to connect with a human agent.
\`\`\`

**Sales Assistant:**
\`\`\`
You are a friendly sales assistant. Help customers find products and guide them 
through the purchase process. Be enthusiastic but not pushy.
\`\`\`

## Best Practices
- Be specific about desired behavior
- Include examples of good responses
- Set clear boundaries
- Test with various scenarios`
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations & API',
    icon: Code,
    items: [
      {
        id: 'website-integration',
        title: 'Website Integration',
        content: `# Website Integration

## HTML/JavaScript
Add to any website:
\`\`\`html
<script src="https://cdn.customerbot.ai/widget.js" 
        data-bot-id="YOUR_BOT_ID">
</script>
\`\`\`

## React Integration
\`\`\`jsx
import { CustomerBotWidget } from '@customerbot/react'

<CustomerBotWidget botId="YOUR_BOT_ID" />
\`\`\`

## WordPress
Use the shortcode:
\`\`\`
[customerbot bot-id="YOUR_BOT_ID"]
\`\`\`

## Configuration Options
- Theme customization
- Position settings
- Behavior configuration`
      },
      {
        id: 'api-docs',
        title: 'API Documentation',
        content: `# API Documentation

## Authentication
All API requests require authentication:
\`\`\`javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
\`\`\`

## Endpoints

### Bots
\`\`\`
GET /api/bots - List bots
POST /api/bots - Create bot
PUT /api/bots/{id} - Update bot
DELETE /api/bots/{id} - Delete bot
\`\`\`

### Chat
\`\`\`
POST /api/chat/message - Send message
GET /api/chat/sessions - List sessions
\`\`\`

## Rate Limits
- Free: 100 requests/hour
- Pro: 1,000 requests/hour
- Enterprise: Custom limits`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: Lightbulb,
    items: [
      {
        id: 'common-issues',
        title: 'Common Issues',
        content: `# Common Issues & Solutions

## Bot Not Responding
- Check training data quality
- Verify system prompt clarity
- Ensure API limits aren't exceeded
- Test network connectivity

## Poor Response Quality
- Add more relevant training data
- Improve system prompt specificity
- Create Q&A pairs for common questions
- Regular content updates

## Integration Problems
- Verify correct bot ID
- Check script loading
- Resolve conflicts with other scripts
- Ensure proper permissions

## Getting Help
- Documentation and guides
- Live chat support
- Email support
- Community forum`
      }
    ]
  }
];

export function Documentation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['getting-started']));
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const renderContent = (content) => {
    const lines = content.trim().split('\n');
    const elements = [];
    let currentCodeBlock = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <div key={i} className="relative bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto">
              <button
                onClick={() => copyToClipboard(currentCodeBlock.join('\n'))}
                className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedCode === currentCodeBlock.join('\n') ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-300" />
                )}
              </button>
              <pre className="text-green-400 text-sm">
                <code>{currentCodeBlock.join('\n')}</code>
              </pre>
            </div>
          );
          currentCodeBlock = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeBlock.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 mb-4 mt-6">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-gray-900 mb-3 mt-5">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-medium text-gray-900 mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="text-gray-700 mb-1 ml-4">
            • {line.substring(2)}
          </li>
        );
      } else if (/^\d+\. /.test(line)) {
        elements.push(
          <li key={i} className="text-gray-700 mb-1 ml-4">
            {line}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-gray-700 mb-3 leading-relaxed">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  // If an item is selected, show its content
  if (selectedItem) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{selectedItem.title}</h1>
                <p className="text-gray-600">Documentation</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-sm max-w-none">
            {renderContent(selectedItem.content)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
                <p className="text-gray-600">Complete guide to CustomerBot</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {documentationSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{section.title}</span>
                    </div>
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.has(section.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="block w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to CustomerBot Documentation
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Everything you need to know about creating, customizing, and managing your AI assistants. 
                  Select a topic from the sidebar to get started.
                </p>
                
                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => setSelectedItem(documentationSections[0].items[0])}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Quick Start</div>
                      <div className="text-sm text-gray-600">Get started in minutes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedItem(documentationSections[3].items[0])}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Code className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">API Guide</div>
                      <div className="text-sm text-gray-600">Integration examples</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}