import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Crown, Zap, MessageCircle, RotateCcw, X, Send, CheckCircle, Star, Bot, User } from 'lucide-react';

// --- Quick reply options ---
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
  ],
  scan_details: [
    "Does it work with Shopify?",
    "What about WordPress?",
    "Custom sites?"
  ],
  pricing: [
    "Do you have a free trial?",
    "What's the setup process?",
    "Can I customize features?",
    "Speak with sales team"
  ],
  support: [
    "How do I get started?",
    "Technical requirements?",
    "Training available?",
    "Contact support team"
  ]
};

// --- Enhanced bot responses ---
const botResponses = {
  "what does customerbot do?": {
    message: "CustomerBot uses AI to scan your website content and instantly create a knowledgeable chatbot that can answer visitor questions, guide them through your site, and even assist with sales or support inquiries 24/7.",
    stage: 'service_details'
  },
  "how does setup work?": {
    message: "Setup is super simple! You just enter your website URL, and our AI scans it. Once the bot is trained, you get a small code snippet to paste onto your website. No technical expertise needed!",
    stage: 'setup_details'
  },
  "what websites can it scan?": {
    message: "Our AI can scan most public websites, including those built with WordPress, Shopify, Wix, Squarespace, custom sites, and more. As long as the content is accessible, we can learn from it.",
    stage: 'scan_details'
  },
  "talk to sales": {
    message: "Okay, I can connect you with our sales team. They can discuss custom plans, enterprise features, and partnership opportunities.",
    stage: 'transfer',
    requiresTransfer: true
  },
  "tell me about pricing": {
    message: "Our pricing starts with a free trial, followed by flexible plans based on usage and features. You can find detailed pricing on our website, or I can give you a general idea based on your needs. Would you like a brief overview?",
    stage: 'pricing'
  },
  "show me integration options": {
    message: "CustomerBot integrates easily via a single line of JavaScript code. We also offer APIs for more advanced custom integrations. It's designed to work with virtually any website platform.",
    stage: 'support'
  },
  "what kind of support?": {
    message: "We offer email support on all paid plans, with priority support available on higher tiers. Our knowledge base is also available 24/7 to help you find answers quickly.",
    stage: 'support'
  },
  "schedule a demo": {
    message: "Great! I can help you schedule a personalized demo with our team. What days and times work best for you in the coming week?",
    stage: 'support'
  },
  "is coding required?": {
    message: "Absolutely no coding is required for the standard setup. Just copy and paste a single line of HTML onto your site.",
    stage: 'setup_details'
  },
  "how long does it take?": {
    message: "The initial scan and bot training usually takes between 5-15 minutes depending on your website's size. Embedding the code is instant.",
    stage: 'setup_details'
  },
  "can i customize?": {
    message: "Yes! You can customize the chatbot's appearance, colors, avatar, greeting message, and refine its knowledge base by adding specific FAQs or documents.",
    stage: 'setup_details'
  },
  "speak with support": {
    message: "Alright, I can connect you with our support team if you have technical questions or need help with setup.",
    stage: 'transfer',
    requiresTransfer: true,
    agentType: 'Support Specialist'
  },
  "does it work with shopify?": {
    message: "Yes, CustomerBot works perfectly with Shopify stores. You can embed the widget easily via the theme code editor.",
    stage: 'scan_details'
  },
  "what about wordpress?": {
    message: "Absolutely, we provide instructions for easily adding CustomerBot to WordPress sites, either directly in the theme or via a plugin.",
    stage: 'scan_details'
  },
  "custom sites?": {
    message: "Our standard JavaScript embed works on almost any custom-built website.",
    stage: 'scan_details'
  },
  "do you have a free trial?": {
    message: "Yes, we offer a 14-day free trial with full features, no credit card needed. It's a great way to see how it works with your own website content.",
    stage: 'pricing'
  },
  "fallback": {
    message: "Hmm, I'm not quite sure about that yet. Can you try asking differently, or would you like me to connect you with a human expert?",
    stage: 'initial'
  }
};

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationStage, setConversationStage] = useState('initial');
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('AI Assistant');

  const chatContainerRef = useRef(null);
  const initialMessageAdded = useRef(false);

  function emitCloseEvent() {
    window.parent.postMessage(
      { type: "CHATBOT" },
      "*"
    );
  }

  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0 && !initialMessageAdded.current) {
      const timer = setTimeout(() => {
        setChatMessages([
          {
            type: 'bot',
            message: "Hi there! 👋 I'm your AI assistant. How can I help you today?",
            timestamp: Date.now(),
            agent: 'AI Assistant'
          }
        ]);
        initialMessageAdded.current = true;
      }, 500);

      return () => clearTimeout(timer);
    }
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen, chatMessages.length]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = botResponses[lowerMessage];

    if (!response) {
      for (const key in botResponses) {
        if (key !== "fallback" && lowerMessage.includes(key)) {
          response = botResponses[key];
          break;
        }
      }
    }
    return response || botResponses['fallback'];
  };

  const simulateHumanTransfer = (agentType = 'Sales Specialist') => {
    setIsTransferring(true);
    setCurrentAgent('Connecting...');

    setTimeout(() => {
      setIsTransferring(false);
      const humanAgentName = agentType === 'Support Specialist' ? 'Alex (Support)' : 'Sarah (Sales)';
      setCurrentAgent(humanAgentName);

      const systemMessage = {
        type: 'system',
        message: `${humanAgentName} has joined the chat`,
        timestamp: Date.now(),
        agent: 'System'
      };
      setChatMessages(prev => [...prev, systemMessage]);
      if (!isChatOpen) setUnreadCount(prev => prev + 1);

      setTimeout(() => {
        const introMessage = agentType === 'Support Specialist'
          ? `Hi, I'm ${humanAgentName}. I understand you had a technical question. How can I help you today?`
          : `Hello, I'm ${humanAgentName}. The AI assistant mentioned you were interested in speaking with sales. What questions can I answer for you about our plans or features?`;

        const agentIntroMessage = {
          type: 'bot',
          message: introMessage,
          timestamp: Date.now(),
          agent: humanAgentName
        };
        setChatMessages(prev => [...prev, agentIntroMessage]);
        setConversationStage('support');
        setShowQuickReplies(false);
        if (!isChatOpen) setUnreadCount(prev => prev + 1);
      }, 1000);
    }, 2000);
  };

  const handleChatSubmit = () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      type: 'user',
      message: currentMessage.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setShowQuickReplies(false);
    const userMsgToSend = currentMessage.trim();
    setCurrentMessage('');

    setIsTyping(true);

    const response = handleBotResponse(userMsgToSend);

    setTimeout(() => {
      setIsTyping(false);

      const botMsg = {
        type: 'bot',
        message: response.message,
        timestamp: Date.now(),
        agent: currentAgent
      };
      setChatMessages(prev => [...prev, botMsg]);

      if (response.requiresTransfer) {
        simulateHumanTransfer(response.agentType);
      } else {
        setConversationStage(response.stage);
        if (!isTransferring) {
          setTimeout(() => setShowQuickReplies(true), 500);
        } else {
          setShowQuickReplies(false);
        }
      }

      if (!isChatOpen) setUnreadCount(prev => prev + 1);
    }, 1500); 
  };

  const handleQuickReply = (reply) => {
    const userMessage = {
      type: 'user',
      message: reply,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setShowQuickReplies(false);

    setIsTyping(true);

    const response = handleBotResponse(reply);

    setTimeout(() => {
      setIsTyping(false);

      const botMsg = {
        type: 'bot',
        message: response.message,
        timestamp: Date.now(),
        agent: currentAgent 
      };
      setChatMessages(prev => [...prev, botMsg]);

      if (response.requiresTransfer) {
        simulateHumanTransfer(response.agentType);
      } else {
        setConversationStage(response.stage);
        if (!isTransferring) {
          setTimeout(() => setShowQuickReplies(true), 500);
        } else {
          setShowQuickReplies(false); 
        }
      }
      
      if (!isChatOpen) setUnreadCount(prev => prev + 1);
    }, 1000); 
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setChatMessages([]);
    initialMessageAdded.current = false; 
    setConversationStage('initial');
    setCurrentAgent('AI Assistant'); 
    setShowQuickReplies(true);
    setUnreadCount(0);
    setIsTransferring(false);
  };

  const currentQuickReplies = (!isTyping && showQuickReplies && !isTransferring && currentAgent === 'AI Assistant')
    ? (quickReplies[conversationStage] || quickReplies['initial'])
    : [];

  return (
    <div className="w-full h-[100vh] flex flex-col overflow-hidden transform transition-all duration-500 ease-in-out scale-100 opacity-100 origin-bottom-right relative" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f4ff 100%)' }}>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' }}></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', animationDelay: '2s' }}></div>
      </div>

      {/* Enhanced Header */}
      <div className="px-6 py-4 text-white border-b-2" style={{ backgroundColor: '#1f2937', borderColor: '#3B82F6' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2" style={{ backgroundColor: '#374151', borderColor: '#3B82F6' }}>
                {currentAgent.includes('AI') || currentAgent === 'Connecting...' ? (
                  <div className="relative">
                    <Bot className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse border border-white" style={{ backgroundColor: '#3B82F6' }}></div>
                  </div>
                ) : (
                  <div className="relative">
                    <User className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse border border-white" style={{ backgroundColor: '#3B82F6' }}></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate text-white">{currentAgent}</h3>
              
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: isTransferring ? '#fbbf24' : '#3B82F6' }}></div>
                <span className="font-medium" style={{ color: '#e5e7eb' }}>{isTransferring ? 'Connecting...' : 'Online'}</span>
               
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 pl-4 flex-shrink-0">
            <button
              onClick={() => clearChat()}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors border-2 hover:opacity-80"
              style={{ backgroundColor: '#374151', borderColor: '#3B82F6' }}
              title="Clear chat"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => emitCloseEvent()}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors border-2 hover:opacity-80"
              style={{ backgroundColor: '#dc2626', borderColor: '#ef4444' }}
              title="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Message Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-6 space-y-4 overflow-y-auto"
        style={{ backgroundColor: '#f8fafc' }}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
        }}
      >
        {chatMessages.map((msg, index) => (
          <div key={index}>
            {/* System Message */}
            {msg.type === 'system' ? (
              <div className="flex justify-center">
                <div className="text-white px-4 py-2 rounded-lg text-sm font-medium border-2" style={{ backgroundColor: '#10b981', borderColor: '#059669' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {msg.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  {/* Agent name above bot messages */}
                  {msg.type === 'bot' && msg.agent && msg.agent !== currentAgent && msg.agent !== 'AI Assistant' && msg.agent !== 'System' && !isTransferring && (
                    <div className="text-xs mb-1 px-2 font-medium" style={{ color: '#6b7280' }}>
                      {msg.agent}
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        msg.type === 'user'
                          ? 'text-white'
                          : 'bg-white text-gray-900'
                      }`}
                      style={msg.type === 'user' ? {
                        backgroundColor: '#3B82F6',
                        borderColor: '#3B82F6'
                      } : {
                        borderColor: '#3B82F6'
                      }}
                    >
                      <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                      <p className={`text-xs mt-2 text-right ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="text-xs mb-1 px-2 font-medium flex items-center gap-2" style={{ color: '#6b7280' }}>
                <Bot className="w-3 h-3" />
                {currentAgent}
              </div>
              <div className="bg-white rounded-lg px-4 py-3 border-2" style={{ borderColor: '#3B82F6' }}>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#3B82F6' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: '#3B82F6' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: '#3B82F6' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Quick Replies */}
        {currentQuickReplies.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-start pt-4">
            {currentQuickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-2 bg-white border-2 text-sm rounded-lg transition-all font-medium hover:opacity-80"
                style={{ 
                  borderColor: '#3B82F6',
                  color: '#3B82F6'
                }}
              >
                <span className="flex items-center gap-2">
                  {reply}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="p-6 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm placeholder-gray-500"
              disabled={isTransferring}
            />
          </div>
          <button
            onClick={handleChatSubmit}
            className="w-12 h-12 flex items-center justify-center text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{ backgroundColor: !currentMessage.trim() || isTransferring ? '#d1d5db' : '#3B82F6' }}
            disabled={!currentMessage.trim() || isTransferring}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    
    </div>
  );
};

export default ChatWidget;