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

const LoadingScreen = () => {
    const [loadingText, setLoadingText] = useState("Initializing AI Assistant...");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const texts = [
            "Initializing AI Assistant...",
            "Loading configuration...",
            "Setting up your experience...",
            "Almost ready..."
        ];

        let textIndex = 0;
        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % texts.length;
            setLoadingText(texts[textIndex]);
        }, 1500);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 15;
            });
        }, 300);

        return () => {
            clearInterval(textInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
            <div className="text-center px-6 max-w-md">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 border-2" style={{ backgroundColor: '#1c1d1d', borderColor: '#3B82F6' }}>
                    <Bot className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                    {loadingText}
                </h2>

                <div className="w-full max-w-xs mb-6 mx-auto">
                    <div className="flex justify-between text-sm mb-2" style={{ color: '#1c1d1d' }}>
                        <span>Loading</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ backgroundColor: '#3B82F6', width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex space-x-2 justify-center">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3B82F6' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3B82F6', animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3B82F6', animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

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
    const activeBot = useSelector(activeBotSelector);
    const messages = useSelector(messagesSelector);
    const input = useSelector(inputSelector);
    const isTyping = useSelector(isTypingSelector);
    const sessionId = useSelector(sessionIdSelector);
    const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        customPrimaryColor,
        customSecondaryColor,
        customBgColor,
        botAvatar,
        userAvatar,
        selectedFontSize,
        botName,
        customQuestions,
        welcomeMessage,
        systemPrompt
    } = uiConfig;

    const setInputData = (value) => dispatch(setInput(value));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        dispatch(setIsTyping(true));
        dispatch(addMessage({ role: 'user', content: input }));
        dispatch(setInput(''));

        const thinkingInterval = setInterval(() => {
            setThinkingMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
        }, 2000);

        try {
            const Chatdata = await geminiChatApi({
                data: { message: input, botId: activeBot._id, sessionId }
            });

            clearInterval(thinkingInterval);
            dispatch(setSessionId(Chatdata.sessionId));
            dispatch(addMessage({ role: 'bot', content: Chatdata.aiResponse, animation: 'fadeIn' }));
        } catch (error) {
            clearInterval(thinkingInterval);
            dispatch(addMessage({ role: 'bot', content: "Sorry, I encountered an error processing your request.", isError: true }));
        } finally {
            dispatch(setIsTyping(false));
        }
    };

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    return (
        <>
            {isLoading ? (<LoadingScreen />) : (
                <div className="h-full bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b-2" style={{ backgroundColor: customBgColor || '#f0f9ff', borderColor: customPrimaryColor || '#3B82F6' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg border-2 flex items-center justify-center" style={{ backgroundColor: customSecondaryColor || '#1c1d1d', borderColor: customPrimaryColor || '#3B82F6' }}>
                                {botAvatar ? (
                                    <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                    <Bot className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h2 className="font-semibold" style={{ color: customPrimaryColor || '#3B82F6' }}>{botName || 'AI Assistant'}</h2>
                                <div className="flex items-center gap-2 text-sm" style={{ color: customSecondaryColor || '#1c1d1d' }}>
                                    {isTyping ? (
                                        <>
                                            <div className="flex space-x-1">
                                                <div className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: customPrimaryColor || '#3B82F6' }}></div>
                                                <div className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: customPrimaryColor || '#3B82F6', animationDelay: '150ms' }}></div>
                                                <div className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: customPrimaryColor || '#3B82F6', animationDelay: '300ms' }}></div>
                                            </div>
                                            <span>Typing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: customPrimaryColor || '#3B82F6' }}></div>
                                            <span>Online</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Welcome Message */}
                        {messages.length === 1 && (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                    {botAvatar ? (
                                        <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                        <Bot className="h-6 w-6 text-gray-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        Welcome! I'm here to help
                                    </h3>
                                    <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                                        {welcomeMessage || "Ask me anything about our services, and I'll do my best to assist you."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chat Messages */}
                        {messages.slice(1).map((message, index) => (
                            <div key={index + 1} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ backgroundColor: customSecondaryColor || '#1c1d1d', borderColor: customPrimaryColor || '#3B82F6' }}>
                                        {botAvatar ? (
                                            <img src={botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                )}

                                <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-lg px-4 py-3 border-2 ${
                                            message.role === 'user'
                                                ? 'text-white'
                                                : message.isError 
                                                    ? 'bg-red-50 text-red-800 border-red-200'
                                                    : 'bg-white text-gray-900'
                                        }`}
                                        style={message.role === 'user' ? {
                                            backgroundColor: customPrimaryColor || '#3B82F6',
                                            borderColor: customPrimaryColor || '#3B82F6'
                                        } : message.isError ? {} : {
                                            borderColor: customPrimaryColor || '#3B82F6'
                                        }}
                                    >
                                        <p className="leading-relaxed">{message.content}</p>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {message.role === 'user' && <span className="ml-1" style={{ color: customPrimaryColor || '#3B82F6' }}>✓</span>}
                                    </div>
                                </div>

                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ backgroundColor: customSecondaryColor || '#1c1d1d', borderColor: customPrimaryColor || '#3B82F6' }}>
                                        {userAvatar ? (
                                            <img src={userAvatar} alt="User" className="w-6 h-6 rounded-lg object-cover" />
                                        ) : (
                                            <User className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex items-start gap-4 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ backgroundColor: customSecondaryColor || '#1c1d1d', borderColor: customPrimaryColor || '#3B82F6' }}>
                                        {botAvatar ? (
                                            <img src={botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div className="rounded-lg px-4 py-3 bg-white border-2" style={{ borderColor: customPrimaryColor || '#3B82F6' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: customPrimaryColor || '#3B82F6' }}></div>
                                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: customPrimaryColor || '#3B82F6', animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: customPrimaryColor || '#3B82F6', animationDelay: '300ms' }}></div>
                                            </div>
                                            <span className="text-sm italic" style={{ color: customSecondaryColor || '#1c1d1d' }}>{thinkingMessage}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-6">
                        {/* Quick Questions */}
                        {customQuestions.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {customQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setInputData(question)}
                                        className="px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors hover:opacity-80"
                                        style={{ 
                                            borderColor: customPrimaryColor || '#3B82F6',
                                            color: customPrimaryColor || '#3B82F6',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="flex items-end gap-3">
                            <div className="flex-1">
                                <textarea
                                    value={input}
                                    onChange={e => setInputData(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                    style={{ minHeight: '48px', maxHeight: '120px', fontSize: selectedFontSize || '14px' }}
                                    disabled={isTyping}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`p-3 rounded-lg transition-all text-white ${
                                    isTyping || !input.trim()
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:opacity-80'
                                }`}
                                style={{ backgroundColor: isTyping || !input.trim() ? '#d1d5db' : (customPrimaryColor || '#3B82F6') }}
                                disabled={isTyping || !input.trim()}
                            >
                                {isTyping ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};