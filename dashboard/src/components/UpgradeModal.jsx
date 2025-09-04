import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageCircle, RotateCcw, X, Send, CheckCircle } from 'lucide-react';

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
    <div className="w-full h-[100vh] bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                {currentAgent.includes('AI') || currentAgent === 'Connecting...' ? (
                  <Bot className="w-6 h-6 text-gray-600" />
                ) : (
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                )}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate text-gray-900">{currentAgent}</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${isTransferring ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="font-medium">{isTransferring ? 'Connecting...' : 'Online'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 pl-4 flex-shrink-0">
            <button
              onClick={() => clearChat()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => emitCloseEvent()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Close chat"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50"
      >
        {chatMessages.map((msg, index) => (
          <div key={index}>
            {/* System Message */}
            {msg.type === 'system' ? (
              <div className="flex justify-center">
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    {msg.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  {/* Agent name above bot messages */}
                  {msg.type === 'bot' && msg.agent && msg.agent !== currentAgent && msg.agent !== 'AI Assistant' && msg.agent !== 'System' && !isTransferring && (
                    <div className="text-xs text-gray-500 mb-1 px-2 font-medium">
                      {msg.agent}
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={`px-4 py-3 rounded-lg border transition-all ${
                        msg.type === 'user'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-2 text-right ${
                        msg.type === 'user' ? 'text-gray-300' : 'text-gray-500'
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
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="text-xs text-gray-500 mb-1 px-2 font-medium">
                {currentAgent}
              </div>
              <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Replies */}
        {currentQuickReplies.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-start pt-4">
            {currentQuickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm placeholder-gray-500"
              disabled={isTransferring}
            />
          </div>
          <button
            onClick={handleChatSubmit}
            className="group relative w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            disabled={!currentMessage.trim() || isTransferring}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <Send className="w-5 h-5 relative group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>

    
    </div>
  );
};

export const UpgradeModal = ChatWidget;
export default UpgradeModal;