import { Send, Loader2, X, Bot, User, Settings, Minimize2, Maximize2, Plus, History, HelpCircle, CheckCircle, Clock, ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeBotSelector, inputSelector, isTypingSelector, messagesSelector, sessionIdSelector, uiConfigSelector } from '../store/global.Selctor';
import { addMessage, setInput, setIsTyping, setSessionId, resetMessages } from '../store/global.Slice';
import { geminiChatApi } from '../store/global.Action';

const THINKING_MESSAGES = [
  "Analyzing your request...",
  "Consulting the knowledge base...",
  "Generating the best response...",
  "Processing your question...",
  "Thinking carefully about this..."
];

const quickReplies = {
  initial: [
    "What does CustomerBot do?",
    "How does setup work?",
    "What websites can it scan?",
    "Talk to sales"
  ],
  service_details: [
    "Tell me about pricing",
    "Show me integration options", 
    "What kind of support?",
    "Schedule a demo"
  ],
  setup_details: [
    "Is coding required?",
    "How long does it take?",
    "Can I customize?",
    "Speak with support"
  ]
};

const mockHistory = [
  {
    id: '1',
    title: 'Product Inquiry',
    lastMessage: 'Thanks for the information!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'resolved',
    messageCount: 8,
    messages: [
      {
        id: 'h1-1',
        content: 'Hi! I\'m interested in your product features.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        type: 'text'
      },
      {
        id: 'h1-2', 
        content: 'Hello! I\'d be happy to tell you about our features. What specific aspect interests you most?',
        sender: 'bot',
        timestamp: new Date(Date.now() - 1000 * 60 * 44),
        type: 'text'
      },
      {
        id: 'h1-3',
        content: 'Thanks for the information!',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text'
      }
    ]
  },
  {
    id: '2',
    title: 'Technical Support',
    lastMessage: 'The issue has been resolved.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'resolved', 
    messageCount: 6,
    messages: [
      {
        id: 'h2-1',
        content: 'I\'m having trouble with the widget installation.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 - 1000 * 60 * 15),
        type: 'text'
      },
      {
        id: 'h2-2',
        content: 'I can help you with that! What specific issue are you encountering?',
        sender: 'bot',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 - 1000 * 60 * 14),
        type: 'text'
      },
      {
        id: 'h2-3',
        content: 'The issue has been resolved.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        type: 'text'
      }
    ]
  }
];

const mockFAQ = [
  {
    id: '1',
    question: 'What are your business hours?',
    answer: 'We\'re available Monday to Friday, 9 AM to 6 PM EST. Our chatbot is available 24/7 for basic inquiries.',
    category: 'General'
  },
  {
    id: '2',
    question: 'How can I reset my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page, or contact our support team for assistance.',
    category: 'Account'
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers. Enterprise customers can also set up invoicing.',
    category: 'Billing'
  }
];

const WelcomeMessage = ({ config, messages }) => {
  if (messages.length > 1) return null;

  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
        {config.botAvatar ? (
          <img src={config.botAvatar} alt="Bot" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <Bot className="h-6 w-6 text-gray-600" />
        )}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          Welcome to {config.companyName}
        </h3>
        <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
          {config.welcomeMessage}
        </p>
      </div>
    </div>
  );
};

const TypingIndicator = ({ config, isAgent, agentName }) => {
  if (!config.enableTypingIndicator) return null;

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
        {isAgent ? (
          <User className="h-4 w-4 text-gray-600" />
        ) : config.botAvatar ? (
          <img src={config.botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600" />
        )}
      </div>
      
      <div className="rounded-lg px-3 py-2 max-w-[80%] bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-600">
            {isAgent ? agentName : config?.botName || 'AI'} is typing...
          </span>
        </div>
      </div>
    </div>
  );
};

const FAQList = ({ config, onBack, onFAQSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = mockFAQ.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredFAQs.map((faq) => (
          <button
            key={faq.id}
            onClick={() => onFAQSelect(faq)}
            className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 mb-1">{faq.question}</div>
                <div className="text-xs text-gray-600 line-clamp-2">{faq.answer}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Chat
        </button>
      </div>
    </div>
  );
};

const HistoryList = ({ config, onSelectConversation, onBack }) => {
  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Chat History</h3>
        <p className="text-xs text-gray-600">Select a conversation to continue</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mockHistory.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm text-gray-900 truncate">{conversation.title}</p>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                conversation.status === 'active' 
                  ? 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20' 
                  : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10'
              }`}>
                {conversation.status === 'active' ? 'Active' : 'Resolved'}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
              </div>
              <span className="text-xs text-gray-500">{conversation.messageCount} messages</span>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Current Chat
        </button>
      </div>
    </div>
  );
};

export const ChatUI = () => {
  const dispatch = useDispatch();
  const uiConfig = useSelector(uiConfigSelector);
  const messages = useSelector(messagesSelector);
  const input = useSelector(inputSelector);
  const isTyping = useSelector(isTypingSelector);
  const activeBot = useSelector(activeBotSelector);
  const sessionId = useSelector(sessionIdSelector);
  
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationStage, setConversationStage] = useState('initial');
  const [currentAgent, setCurrentAgent] = useState('AI Assistant');
  const [isHandedOver, setIsHandedOver] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadCaptureState, setLeadCaptureState] = useState('none');
  const [isTransferring, setIsTransferring] = useState(false);

  const setInputData = (value) => dispatch(setInput(value));
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Create config object from uiConfig
  const config = {
    name: uiConfig.botName || 'AI Assistant',
    welcomeMessage: uiConfig.welcomeMessage || 'Hello! How can I help you today?',
    primaryColor: uiConfig.customPrimaryColor || '#000000',
    secondaryColor: uiConfig.customSecondaryColor || '#6b7280',
    backgroundColor: uiConfig.customBgColor || '#ffffff',
    avatar: uiConfig.botAvatar || '🤖',
    userAvatar: uiConfig.userAvatar,
    placeholder: uiConfig.placeholder || 'Type your message...',
    theme: uiConfig.themeMode || 'light',
    fontSize: uiConfig.selectedFontSize || '14px',
    showTypingIndicator: uiConfig.enableTypingIndicator,
    headerTitle: uiConfig.headerTitle || 'Chat Support',
    headerSubtitle: uiConfig.headerSubtitle || 'We\'re here to help',
    enableHandover: uiConfig.enableHandover,
    enableFAQ: uiConfig.enableFAQ,
    enableHistory: uiConfig.enableHistory,
    enableQuickReplies: uiConfig.enableQuickReplies,
    enableLeadCapture: uiConfig.enableLeadCapture,
    companyName: uiConfig.companyName || 'CustomerBot',
    supportEmail: uiConfig.supportEmail || 'support@customerbot.com',
    businessHours: uiConfig.businessHours || '9 AM - 6 PM EST',
    responseTime: uiConfig.responseTime || '< 2 minutes',
    showBranding: uiConfig.showBranding,
    borderRadius: uiConfig.borderRadius || '12px',
    shadowIntensity: uiConfig.shadowIntensity || 'medium',
    messageAlignment: uiConfig.messageAlignment || 'default',
    customQuestions: uiConfig.customQuestions || [],
    leadCaptureMessage: uiConfig.leadCaptureMessage,
    handoverMessage: uiConfig.handoverMessage,
    systemPrompt: uiConfig.systemPrompt
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Check message length limit
    if (input.length > (uiConfig.maxMessageLength || 500)) {
      alert(`Message too long. Maximum ${uiConfig.maxMessageLength || 500} characters allowed.`);
      return;
    }

    dispatch(setIsTyping(true));
    dispatch(addMessage({ role: 'user', content: input }));
    dispatch(setInput(''));
    setShowQuickReplies(false);

    const thinkingInterval = setInterval(() => {
      setThinkingMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
    }, 2000);

    try {
      const Chatdata = await geminiChatApi({
        data: { message: input, botId: activeBot?._id, sessionId }
      });

      clearInterval(thinkingInterval);
      dispatch(setSessionId(Chatdata.sessionId));
      
      // Apply typing delay from config
      setTimeout(() => {
        dispatch(addMessage({
          role: 'bot',
          content: Chatdata.aiResponse,
          animation: 'fadeIn'
        }));
        
        if (config.enableQuickReplies) {
          setTimeout(() => setShowQuickReplies(true), 500);
        }
      }, uiConfig.typingDelay || 1500);
    } catch (error) {
      clearInterval(thinkingInterval);
      dispatch(addMessage({
        role: 'bot',
        content: "Sorry, I encountered an error processing your request.",
        isError: true
      }));
    } finally {
      dispatch(setIsTyping(false));
    }
  };

  const handleQuickReply = (reply) => {
    setInputData(reply);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  const handleNewChat = () => {
    dispatch(resetMessages());
    setShowHistory(false);
    setShowFAQ(false);
    setShowQuickReplies(true);
    setConversationStage('initial');
    setCurrentAgent('AI Assistant');
    setIsHandedOver(false);
    setLeadCaptured(false);
    setLeadCaptureState('none');
    setIsTransferring(false);
  };

  const handleFAQSelect = (faq) => {
    const faqMessage = {
      role: 'user',
      content: faq.question
    };

    const botResponse = {
      role: 'bot',
      content: faq.answer
    };

    dispatch(addMessage(faqMessage));
    setTimeout(() => {
      dispatch(addMessage(botResponse));
    }, 500);
    setShowFAQ(false);
  };

  const loadHistoryConversation = (conversation) => {
    dispatch(resetMessages());
    
    conversation.messages.forEach((msg, index) => {
      setTimeout(() => {
        dispatch(addMessage({
          role: msg.sender === 'user' ? 'user' : 'bot',
          content: msg.content,
          timestamp: msg.timestamp
        }));
      }, index * 100);
    });
    
    setShowHistory(false);
    if (config.enableQuickReplies) {
      setShowQuickReplies(true);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  // Get chat size class
  const getChatSizeClass = () => {
    switch (uiConfig.chatSize) {
      case 'compact': return 'w-80 h-96';
      case 'medium': return 'w-96 h-[500px]';
      case 'large': return 'w-[500px] h-[600px]';
      case 'full': return 'w-full h-full';
      default: return 'w-96 h-[500px]';
    }
  };

  // Get shadow class
  const getShadowClass = () => {
    switch (uiConfig.shadowIntensity) {
      case 'none': return '';
      case 'light': return 'shadow-sm';
      case 'medium': return 'shadow-lg';
      case 'heavy': return 'shadow-2xl';
      default: return 'shadow-lg';
    }
  };

  const chatHeight = isMinimized ? 'h-16' : getChatSizeClass().split(' ')[1];
  const chatWidth = getChatSizeClass().split(' ')[0];
  
  const currentQuickReplies = (!isTyping && showQuickReplies && !isHandedOver && currentAgent === 'AI Assistant' && config.enableQuickReplies)
    ? (config.customQuestions.length > 0 ? config.customQuestions : (quickReplies[conversationStage] || quickReplies['initial']))
    : [];

  const renderMainView = () => {
    if (showFAQ && config.enableFAQ) {
      return (
        <div 
          className="flex flex-col h-full"
          style={{ 
            backgroundColor: config.backgroundColor,
            color: config.theme === 'dark' ? '#ffffff' : '#000000'
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: config.theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: config.theme === 'dark' ? '#ffffff' : '#000000',
                  borderRadius: config.borderRadius,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockFAQ.filter(faq =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFAQSelect(faq)}
                className="w-full text-left p-4 rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  borderRadius: config.borderRadius,
                  color: config.theme === 'dark' ? '#ffffff' : '#000000'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = config.primaryColor;
                  e.target.style.backgroundColor = config.theme === 'dark' ? '#4b5563' : '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = config.theme === 'dark' ? '#4b5563' : '#e5e7eb';
                  e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#ffffff';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{faq.question}</div>
                    <div className="text-xs opacity-70 line-clamp-2">{faq.answer}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                </div>
              </button>
            ))}
          </div>

          <div 
            className="p-4 border-t"
            style={{ 
              borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: config.theme === 'dark' ? '#1f2937' : '#f9fafb'
            }}
          >
            <button
              onClick={() => setShowFAQ(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium"
              style={{
                borderColor: config.theme === 'dark' ? '#4b5563' : '#d1d5db',
                backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                color: config.theme === 'dark' ? '#ffffff' : '#374151',
                borderRadius: config.borderRadius
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Chat
            </button>
          </div>
        </div>
      );
    }

    if (showHistory && config.enableHistory) {
      return (
        <div 
          className="flex flex-col h-full"
          style={{ 
            backgroundColor: config.backgroundColor,
            color: config.theme === 'dark' ? '#ffffff' : '#000000'
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <h3 className="text-sm font-semibold mb-2">Chat History</h3>
            <p className="text-xs opacity-70">Select a conversation to continue</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockHistory.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => loadHistoryConversation(conversation)}
                className="w-full text-left p-4 rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  borderRadius: config.borderRadius,
                  color: config.theme === 'dark' ? '#ffffff' : '#000000'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = config.primaryColor;
                  e.target.style.backgroundColor = config.theme === 'dark' ? '#4b5563' : '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = config.theme === 'dark' ? '#4b5563' : '#e5e7eb';
                  e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#ffffff';
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm truncate">{conversation.title}</p>
                  <span 
                    className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset"
                    style={{
                      backgroundColor: conversation.status === 'active' 
                        ? (config.theme === 'dark' ? '#065f46' : '#dcfce7')
                        : (config.theme === 'dark' ? '#374151' : '#f3f4f6'),
                      color: conversation.status === 'active' 
                        ? (config.theme === 'dark' ? '#34d399' : '#166534')
                        : (config.theme === 'dark' ? '#9ca3af' : '#6b7280')
                    }}
                  >
                    {conversation.status === 'active' ? 'Active' : 'Resolved'}
                  </span>
                </div>
                <p className="text-xs opacity-70 truncate mb-2">{conversation.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 opacity-50" />
                    <span className="text-xs opacity-70">{formatTime(conversation.timestamp)}</span>
                  </div>
                  <span className="text-xs opacity-70">{conversation.messageCount} messages</span>
                </div>
              </button>
            ))}
          </div>

          <div 
            className="p-4 border-t"
            style={{ 
              borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: config.theme === 'dark' ? '#1f2937' : '#f9fafb'
            }}
          >
            <button
              onClick={() => setShowHistory(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium"
              style={{
                borderColor: config.theme === 'dark' ? '#4b5563' : '#d1d5db',
                backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                color: config.theme === 'dark' ? '#ffffff' : '#374151',
                borderRadius: config.borderRadius
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Current Chat
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
          style={{ 
            backgroundColor: config.backgroundColor,
            scrollBehavior: 'smooth',
            color: config.theme === 'dark' ? '#ffffff' : '#000000'
          }}
        >
          <WelcomeMessage config={config} messages={messages} />
          
          {/* Lead Capture Indicator */}
          {config.enableLeadCapture && leadCaptureState !== 'none' && leadCaptureState !== 'completed' && (
            <div 
              className="border rounded-lg p-4"
              style={{
                backgroundColor: config.theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                borderColor: config.theme === 'dark' ? '#3b82f6' : '#93c5fd',
                borderRadius: config.borderRadius
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center border"
                  style={{
                    backgroundColor: config.theme === 'dark' ? '#3b82f6' : '#dbeafe',
                    borderColor: config.theme === 'dark' ? '#60a5fa' : '#93c5fd'
                  }}
                >
                  <User className="h-4 w-4" style={{ color: config.theme === 'dark' ? '#ffffff' : '#1d4ed8' }} />
                </div>
                <div className="flex-1">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: config.theme === 'dark' ? '#ffffff' : '#1e3a8a' }}
                  >
                    {config.leadCaptureMessage}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: config.theme === 'dark' ? '#d1d5db' : '#1e40af' }}
                  >
                    Type "skip" if you prefer not to share
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {messages.slice(1).map((message, index) => (
            <div
              key={index + 1}
              className={`flex gap-3 group ${
                message.role === 'user' ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === 'bot' && (
                <div 
                  className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    backgroundColor: config.theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    borderRadius: config.borderRadius
                  }}
                >
                  {config.avatar && config.avatar !== '🤖' ? (
                    <img src={config.avatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                  ) : (
                    <Bot className="h-4 w-4" style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }} />
                  )}
                </div>
              )}
              
              <div 
                className={`max-w-[80%] rounded-lg px-3 py-2 space-y-2 ${
                  message.role === 'user' 
                    ? "ml-auto" 
                    : ""
                }`}
                style={{
                  backgroundColor: message.role === 'user' ? config.primaryColor : 
                                 message.isError ? (config.theme === 'dark' ? '#7f1d1d' : '#fef2f2') : 
                                 (config.theme === 'dark' ? '#374151' : '#ffffff'),
                  color: message.role === 'user' ? '#ffffff' : 
                         message.isError ? (config.theme === 'dark' ? '#fca5a5' : '#991b1b') : 
                         (config.theme === 'dark' ? '#ffffff' : '#111827'),
                  borderRadius: config.borderRadius,
                  border: message.role !== 'user' ? `1px solid ${config.theme === 'dark' ? '#4b5563' : '#e5e7eb'}` : 'none'
                }}
              >
                {message.role === 'bot' && isHandedOver && (
                  <div 
                    className="flex items-center gap-2 mb-2 pb-2 border-b"
                    style={{ borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb' }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span 
                      className="text-xs font-medium"
                      style={{ color: config.theme === 'dark' ? '#34d399' : '#047857' }}
                    >
                      {currentAgent}
                    </span>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: config.theme === 'dark' ? '#065f46' : '#dcfce7',
                        color: config.theme === 'dark' ? '#34d399' : '#047857'
                      }}
                    >
                      Live Support
                    </span>
                  </div>
                )}
                
                <p 
                  className="text-sm leading-relaxed whitespace-pre-wrap" 
                  style={{ fontSize: config.fontSize }}
                >
                  {message.content}
                </p>
                
                <div className="flex items-center justify-between mt-2 pt-1">
                  <p className={`text-xs flex items-center gap-1 ${
                    message.role === 'user' ? "text-white/70" : ""
                  }`}
                    style={{
                      color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 
                             (config.theme === 'dark' ? '#9ca3af' : '#6b7280')
                    }}
                  >
                    <Clock className="h-3 w-3" />
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.role === 'user' && (
                    <CheckCircle className="h-3 w-3 text-white/70" />
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border"
                  style={{ 
                    backgroundColor: config.primaryColor,
                    borderColor: config.primaryColor,
                    borderRadius: config.borderRadius
                  }}
                >
                  {config.userAvatar ? (
                    <img src={config.userAvatar} alt="User" className="w-6 h-6 rounded-lg object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div 
                className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  backgroundColor: config.theme === 'dark' ? '#374151' : '#f9fafb',
                  borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  borderRadius: config.borderRadius
                }}
              >
                {isHandedOver ? (
                  <User className="h-4 w-4" style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }} />
                ) : config.avatar && config.avatar !== '🤖' ? (
                  <img src={config.avatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                ) : (
                  <Bot className="h-4 w-4" style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }} />
                )}
              </div>
              
              <div 
                className="rounded-lg px-3 py-2 max-w-[80%] border"
                style={{
                  backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  borderRadius: config.borderRadius
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        backgroundColor: config.theme === 'dark' ? '#9ca3af' : '#6b7280',
                        animationDelay: '0ms' 
                      }} 
                    />
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        backgroundColor: config.theme === 'dark' ? '#9ca3af' : '#6b7280',
                        animationDelay: '150ms' 
                      }} 
                    />
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        backgroundColor: config.theme === 'dark' ? '#9ca3af' : '#6b7280',
                        animationDelay: '300ms' 
                      }} 
                    />
                  </div>
                  <span 
                    className="text-sm"
                    style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                  >
                    {isHandedOver ? currentAgent : config?.botName || 'AI'} is typing...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {currentQuickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {currentQuickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-2 text-sm border rounded-lg transition-colors font-medium"
                  style={{ 
                    borderRadius: config.borderRadius,
                    borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                    color: config.theme === 'dark' ? '#ffffff' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = config.theme === 'dark' ? '#4b5563' : '#f9fafb';
                    e.target.style.borderColor = config.primaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#ffffff';
                    e.target.style.borderColor = config.theme === 'dark' ? '#4b5563' : '#e5e7eb';
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div 
          className="border-t"
          style={{ 
            borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: config.theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          {/* Quick Actions */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex gap-2 flex-wrap">
              {config.enableFAQ && !showFAQ && !showHistory && (
                <button
                  onClick={() => setShowFAQ(true)}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-7 px-3 gap-1 border"
                  style={{
                    borderColor: config.theme === 'dark' ? '#4b5563' : '#d1d5db',
                    backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                    color: config.theme === 'dark' ? '#ffffff' : '#374151',
                    borderRadius: config.borderRadius
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = config.theme === 'dark' ? '#4b5563' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#ffffff';
                  }}
                >
                  <HelpCircle className="h-3 w-3" style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }} />
                  Quick Help
                </button>
              )}
              {config.enableHandover && !isHandedOver && !showFAQ && !showHistory && (
                <button
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-7 px-3 gap-1 border"
                  style={{
                    borderColor: config.theme === 'dark' ? '#4b5563' : '#d1d5db',
                    backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                    color: config.theme === 'dark' ? '#ffffff' : '#374151',
                    borderRadius: config.borderRadius
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = config.theme === 'dark' ? '#4b5563' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#ffffff';
                  }}
                >
                  <User className="h-3 w-3" style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }} />
                  Human Support
                </button>
              )}
              {leadCaptured && (
                <span 
                  className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium gap-1"
                  style={{
                    backgroundColor: config.theme === 'dark' ? '#065f46' : '#dcfce7',
                    color: config.theme === 'dark' ? '#34d399' : '#047857',
                    borderRadius: config.borderRadius
                  }}
                >
                  <CheckCircle className="h-3 w-3" style={{ color: config.theme === 'dark' ? '#34d399' : '#047857' }} />
                  Contact Saved
                </span>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInputData(e.target.value)}
                  placeholder={config.placeholder}
                  rows={1}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px',
                    fontSize: config.fontSize,
                    borderRadius: config.borderRadius,
                    backgroundColor: config.theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    color: config.theme === 'dark' ? '#ffffff' : '#000000',
                    focusRingColor: config.primaryColor
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.primaryColor;
                    e.target.style.boxShadow = `0 0 0 2px ${config.primaryColor}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = config.theme === 'dark' ? '#4b5563' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={isTyping}
                  maxLength={uiConfig.maxMessageLength || 500}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div 
                  className="absolute right-3 bottom-2 text-xs"
                  style={{ color: config.theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  {input.length}/{uiConfig.maxMessageLength || 500}
                </div>
              </div>
              <button
                type="submit"
                className={`p-3 rounded-lg transition-all ${
                  isTyping || !input.trim()
                    ? 'cursor-not-allowed'
                    : 'text-white hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isTyping || !input.trim() ? 
                    (config.theme === 'dark' ? '#4b5563' : '#e5e7eb') : config.primaryColor,
                  color: isTyping || !input.trim() ? 
                    (config.theme === 'dark' ? '#9ca3af' : '#9ca3af') : '#ffffff',
                  borderRadius: config.borderRadius
                }}
                disabled={isTyping || !input.trim()}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {config.showBranding && (
              <div className="flex items-center justify-center mt-3">
                <p 
                  className="text-xs"
                  style={{ color: config.theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Powered by {config.companyName}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Get animation class
  const getAnimationClass = () => {
    switch (uiConfig.animationStyle) {
      case 'fade': return 'animate-fade-in';
      case 'slide-up': return 'animate-slide-up';
      case 'slide-right': return 'animate-slide-right';
      case 'scale': return 'animate-scale-in';
      default: return '';
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-500 flex flex-col relative ${chatHeight} ${chatWidth} ${getShadowClass()} ${getAnimationClass()}`}
      style={{
        borderRadius: config.borderRadius,
        backgroundColor: config.theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb',
        ...(uiConfig.customCSS ? { style: uiConfig.customCSS } : {})
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{ 
          backgroundColor: config.theme === 'dark' ? '#1f2937' : '#f9fafb',
          borderColor: config.theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="flex items-center gap-3">
          {(showFAQ || showHistory) && (
            <button
              onClick={() => {
                setShowFAQ(false);
                setShowHistory(false);
              }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-8"
              style={{
                color: config.theme === 'dark' ? '#d1d5db' : '#6b7280',
                borderRadius: config.borderRadius
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: config.theme === 'dark' ? '#374151' : '#f9fafb',
                borderColor: config.theme === 'dark' ? '#4b5563' : '#e5e7eb',
                borderRadius: config.borderRadius
              }}
            >
              {config.avatar && config.avatar !== '🤖' ? (
                <img src={config.avatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
              ) : (
                <Bot className="h-4 w-4" style={{ color: config.theme === 'dark' ? '#d1d5db' : '#6b7280' }} />
              )}
            </div>
            <div>
              <h3 
                className="text-sm font-semibold"
                style={{ color: config.theme === 'dark' ? '#ffffff' : '#111827' }}
              >
                {showHistory ? 'Chat History' :
                 showFAQ ? 'Help Center' :
                 isHandedOver ? currentAgent : config.headerTitle}
                {isHandedOver && (
                  <span 
                    className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: config.theme === 'dark' ? '#065f46' : '#dcfce7',
                      color: config.theme === 'dark' ? '#34d399' : '#047857'
                    }}
                  >
                    Live
                  </span>
                )}
              </h3>
              <p 
                className="text-xs"
                style={{ color: config.theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                {showHistory ? 'Select a conversation to continue' :
                 showFAQ ? 'Find answers to common questions' :
                 isHandedOver ? 'Connected to human support' : config.headerSubtitle}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!showFAQ && !showHistory && (
            <button
              onClick={handleNewChat}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-8"
              style={{
                color: config.theme === 'dark' ? '#d1d5db' : '#6b7280',
                borderRadius: config.borderRadius
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          
          {config.enableHistory && !showFAQ && !showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-8"
              style={{
                color: config.theme === 'dark' ? '#d1d5db' : '#6b7280',
                borderRadius: config.borderRadius
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Chat History"
            >
              <History className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-8"
            style={{
              color: config.theme === 'dark' ? '#d1d5db' : '#6b7280',
              borderRadius: config.borderRadius
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          
          <button 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-8"
            style={{
              color: config.theme === 'dark' ? '#d1d5db' : '#6b7280',
              borderRadius: config.borderRadius
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0">
          {renderMainView()}
        </div>
      )}
    </div>
  );
};