import { Send, Loader2, Bot, User, Phone, Mail, Building, X, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { geminiChatApi, getBotConfig } from '../store/global.Action';
import socketService from '../services/socketService';

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
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="text-center px-6 max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6 border border-gray-200">
                    <Bot className="w-8 h-8 text-gray-600" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {loadingText}
                </h2>

                <div className="w-full max-w-xs mb-6 mx-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Loading</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-full bg-gray-900 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex space-x-2 justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export const ShareChatUI = () => {
    const [customPrimaryColor, setCustomPrimaryColor] = useState('#3B82F6');
    const [customSecondaryColor, setCustomSecondaryColor] = useState('#1c1d1d');
    const [customBgColor, setCustomBgColor] = useState('#f0f9ff');
    const [themeMode, setThemeMode] = useState('light');
    const [botAvatar, setBotAvatar] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [selectedFontSize, setSelectedFontSize] = useState('16px');
    const [botName, setBotName] = useState('AI Assistant');
    const [customQuestions, setCustomQuestions] = useState([]);
    const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeBotId, setActiveBotId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHumanSupportButton, setShowHumanSupportButton] = useState(false);
    const [humanSupportRequested, setHumanSupportRequested] = useState(false);
    const [agentInfo, setAgentInfo] = useState(null);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    });
    const [isConnected, setIsConnected] = useState(false);
    const [agentTyping, setAgentTyping] = useState(false);
    const [enableHandover, setEnableHandover] = useState(true);

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    // Initialize bot configuration
    useLayoutEffect(() => {
        const fetchThemeData = async () => {
            try {
                setIsLoading(true);
                const query = new URLSearchParams(window.location.search);
                const id = query.get('id');
                
                if (id) {
                    setActiveBotId(id);
                    const data = await getBotConfig({ botId: id });
                    
                    setCustomPrimaryColor(data.primaryColour || '#3B82F6');
                    setCustomSecondaryColor(data.secondaryColour || '#1c1d1d');
                    setCustomBgColor(data.backgroundColour || '#f0f9ff');
                    setThemeMode(data.themeMode || 'light');
                    setBotAvatar(data.icon || '');
                    setUserAvatar(data.userIcon || '');
                    setSelectedFontSize(data.typography || '16px');
                    setBotName(data.name || 'AI Assistant');
                    setCustomQuestions(data.customQuestions || []);
                    setWelcomeMessage(data.welcomeMessage || 'Hello! How can I help you today?');
                    
                    // Set human handover setting
                    setEnableHandover(data.enableHandover !== undefined ? data.enableHandover : true);
                    
                    setMessages([{ 
                        role: 'bot', 
                        content: data.welcomeMessage || 'Hello! How can I help you today?',
                        timestamp: Date.now()
                    }]);
                }
            } catch (error) {
                console.error('Error fetching theme data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchThemeData();
    }, []);

    // Initialize socket connection
    useEffect(() => {
        if (activeBotId && !isLoading) {
            socketService.connect();
            setIsConnected(true);

            // Join session (will create new session if needed)
            socketService.joinSession(sessionId, activeBotId);

            // Listen for session joined confirmation
            socketService.on('session-joined', (data) => {
                setSessionId(data.sessionId);
                console.log('Joined session:', data.sessionId);
            });

            // Listen for support request confirmation
            socketService.on('support-requested', (data) => {
                setHumanSupportRequested(true);
                setShowHumanSupportButton(false);
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: data.message,
                    timestamp: Date.now()
                }]);
            });

            // Listen for agent joining
            socketService.on('agent-joined', (data) => {
                setAgentInfo({
                    name: data.agentName,
                    id: data.agentId
                });
                setHumanSupportRequested(false);
                
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: data.message,
                    timestamp: Date.now()
                }]);
            });

            // Listen for new messages from agents
            socketService.on('new-message', (data) => {
                if (data.message.role === 'agent') {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: data.message.content,
                        timestamp: data.message.timestamp,
                        isAgent: true,
                        agentName: data.message.senderName
                    }]);
                }
            });

            // Listen for agent typing
            socketService.on('agent-typing', (data) => {
                setAgentTyping(data.isTyping);
            });

            // Listen for session resolved
            socketService.on('session-resolved', (data) => {
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `Session resolved by ${data.resolvedBy}. Thank you for using our support!`,
                    timestamp: data.timestamp
                }]);
                setAgentInfo(null);
                setHumanSupportRequested(false);
            });

            // Listen for errors
            socketService.on('error', (data) => {
                console.error('Socket error:', data.message);
            });

            return () => {
                socketService.removeAllListeners();
                socketService.disconnect();
                setIsConnected(false);
            };
        }
    }, [activeBotId, isLoading]);

    // Show human support button after 3 exchanges (6 messages)
    useEffect(() => {
        if (messages.length >= 4 && !humanSupportRequested && !agentInfo && enableHandover) {
            setShowHumanSupportButton(true);
        }
    }, [messages.length, humanSupportRequested, agentInfo, enableHandover]);

    // Also show button after 30 seconds if handover is enabled
    useEffect(() => {
        if (enableHandover && !humanSupportRequested && !agentInfo) {
            const timer = setTimeout(() => {
                setShowHumanSupportButton(true);
            }, 10000); // 10 seconds for faster testing

            return () => clearTimeout(timer);
        }
    }, [enableHandover, humanSupportRequested, agentInfo]);

    const handleRequestHumanSupport = () => {
        if (!sessionId) return;
        
        if (contactInfo.email || contactInfo.name) {
            socketService.requestHumanSupport(
                sessionId, 
                'I would like to speak with a human agent',
                contactInfo
            );
            setShowContactForm(false);
        } else {
            setShowContactForm(true);
        }
    };

    const handleContactFormSubmit = (e) => {
        e.preventDefault();
        socketService.requestHumanSupport(
            sessionId, 
            'I would like to speak with a human agent',
            contactInfo
        );
        setShowContactForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = { 
            role: 'user', 
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageToSend = input;
        setInput('');

        // If agent is connected, send via socket
        if (agentInfo && sessionId) {
            socketService.sendMessage(sessionId, messageToSend, false);
            return;
        }

        // Otherwise, send to AI
        setIsTyping(true);

        const thinkingInterval = setInterval(() => {
            setThinkingMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
        }, 2000);

        try {
            const chatData = {
                message: messageToSend,
                botId: activeBotId,
                sessionId
            };

            // Include lead data if available
            if (contactInfo.email || contactInfo.name || contactInfo.phone) {
                chatData.leadData = contactInfo;
            }

            const response = await geminiChatApi({ data: chatData });

            clearInterval(thinkingInterval);
            setSessionId(response.sessionId);
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: response.aiResponse, 
                timestamp: Date.now()
            }]);

            // Join socket session if not already joined
            if (!sessionId && response.sessionId) {
                socketService.joinSession(response.sessionId, activeBotId);
            }

        } catch (error) {
            clearInterval(thinkingInterval);
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Sorry, I encountered an error processing your request.", 
                isError: true,
                timestamp: Date.now()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <>
            {isLoading ? (<LoadingScreen />) : (
                <div className="h-screen w-screen bg-white flex flex-col">
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-200" style={{ backgroundColor: customBgColor }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                {botAvatar ? (
                                    <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                    <Bot className="w-5 h-5 text-gray-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-gray-900 font-semibold">
                                    {agentInfo ? `${agentInfo.name} (Human Agent)` : botName}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    {isTyping || agentTyping ? (
                                        <>
                                            <div className="flex space-x-1">
                                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                            <span>Typing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span>{agentInfo ? 'Human Support' : 'AI Assistant'} • {isConnected ? 'Online' : 'Connecting...'}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="flex-1 overflow-hidden" style={{ backgroundColor: customBgColor }}>
                        <div className="h-full overflow-y-auto p-6 space-y-6">
                            {/* Human Support Button */}
                            {enableHandover && (showHumanSupportButton || messages.length >= 4) && !humanSupportRequested && !agentInfo && (
                                <div className="flex justify-center mb-4">
                                    <button
                                        onClick={handleRequestHumanSupport}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        Talk to Human Agent
                                    </button>
                                </div>
                            )}


                            {/* Contact Form Modal */}
                            {showContactForm && (
                                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-blue-900">
                                            Connect with Human Support
                                        </h3>
                                        <button
                                            onClick={() => setShowContactForm(false)}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-blue-600" />
                                        </button>
                                    </div>
                                    <p className="text-blue-700 mb-4">
                                        Please provide your contact information so our team can assist you better.
                                    </p>
                                    <form onSubmit={handleContactFormSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Your name"
                                                    value={contactInfo.name}
                                                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Company (optional)"
                                                    value={contactInfo.company}
                                                    onChange={(e) => setContactInfo(prev => ({ ...prev, company: e.target.value }))}
                                                    className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="Your email"
                                                value={contactInfo.email}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                placeholder="Your phone (optional)"
                                                value={contactInfo.phone}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    socketService.requestHumanSupport(sessionId, 'I would like to speak with a human agent');
                                                    setShowContactForm(false);
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Skip & Request
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Request Support
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Human Support Status */}
                            {humanSupportRequested && !agentInfo && (
                                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                        <div>
                                            <p className="font-medium text-yellow-800">Connecting you with a human agent...</p>
                                            <p className="text-sm text-yellow-600">Estimated wait time: 2-5 minutes</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Agent Connected Status */}
                            {agentInfo && (
                                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-green-800">
                                                {agentInfo.name} is now assisting you
                                            </p>
                                            <p className="text-sm text-green-600">Human support agent</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className="flex items-start gap-4 max-w-[85%]">
                                        {message.role === 'bot' && (
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                {message.isAgent ? (
                                                    <User className="w-4 h-4 text-blue-600" />
                                                ) : botAvatar ? (
                                                    <img src={botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                                                ) : (
                                                    <Bot className="w-4 h-4 text-gray-600" />
                                                )}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            {/* Agent name for human messages */}
                                            {message.isAgent && message.agentName && (
                                                <div className="text-xs text-blue-600 font-medium mb-1">
                                                    {message.agentName} (Human Agent)
                                                </div>
                                            )}
                                            
                                            {/* System message styling */}
                                            {message.role === 'system' ? (
                                                <div className="text-center w-full mb-2">
                                                    <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm border border-gray-200">
                                                        <CheckCircle className="w-4 h-4 inline mr-2" />
                                                        {message.content}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`rounded-lg px-4 py-3 border ${
                                                        message.role === 'user'
                                                            ? 'text-white border-gray-900'
                                                            : message.isError 
                                                                ? 'bg-red-50 text-red-800 border-red-200' 
                                                                : message.isAgent
                                                                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                                                                    : 'bg-white text-gray-900 border-gray-200'
                                                    }`}
                                                    style={{ 
                                                        fontSize: selectedFontSize,
                                                        backgroundColor: message.role === 'user' ? customPrimaryColor : undefined
                                                    }}
                                                >
                                                    <p className="leading-relaxed">{message.content}</p>
                                                </div>
                                            )}
                                            
                                            {message.role !== 'system' && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <span>{formatTime(message.timestamp)}</span>
                                                    {message.role === 'user' && <span className="text-green-500 ml-1">✓</span>}
                                                </div>
                                            )}
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-lg border border-gray-600 flex items-center justify-center" style={{ backgroundColor: customSecondaryColor }}>
                                                {userAvatar ? (
                                                    <img src={userAvatar} alt="User" className="w-6 h-6 rounded-lg object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicators */}
                            {(isTyping || agentTyping) && (
                                <div className="flex justify-start">
                                    <div className="flex items-start gap-4 max-w-[80%]">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            {agentTyping ? (
                                                <User className="w-4 h-4 text-blue-600" />
                                            ) : botAvatar ? (
                                                <img src={botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="rounded-lg px-4 py-3 bg-white border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span className="text-sm italic text-gray-500">
                                                    {agentTyping ? `${agentInfo?.name || 'Agent'} is typing...` : thinkingMessage}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-gray-200 bg-white">
                        {customQuestions.length > 0 && !agentInfo && messages.length <= 2 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {customQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setInput(question)}
                                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Manual Human Support Button (always visible if enabled) */}
                        {enableHandover && !humanSupportRequested && !agentInfo && messages.length > 2 && (
                            <div className="mb-4 text-center">
                                <button
                                    onClick={handleRequestHumanSupport}
                                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                                >
                                    Need to talk to a human? Click here
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex items-end gap-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        // Send typing indicator for agent sessions
                                        if (agentInfo && sessionId) {
                                            socketService.sendTyping(sessionId, e.target.value.length > 0, false);
                                        }
                                    }}
                                    placeholder={agentInfo ? `Message ${agentInfo.name}...` : "Ask me anything..."}
                                    rows={1}
                                    className="w-full px-4 py-3 pr-16 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                                    style={{
                                        minHeight: '48px',
                                        maxHeight: '120px',
                                        focusRingColor: customPrimaryColor
                                    }}
                                    disabled={isTyping}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <div className="absolute right-4 bottom-3 text-xs text-gray-500">
                                    {input.length}/500
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`p-3 rounded-lg transition-all ${
                                    isTyping || !input.trim()
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'text-white hover:opacity-90'
                                }`}
                                style={{ 
                                    backgroundColor: isTyping || !input.trim() ? undefined : customPrimaryColor 
                                }}
                                disabled={isTyping || !input.trim()}
                            >
                                {isTyping ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </form>

                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span>Press Enter to send, Shift + Enter for new line</span>
                            <span>
                                {agentInfo ? `Connected to ${agentInfo.name}` : 
                                 humanSupportRequested ? 'Waiting for human agent...' : 
                                 'AI-powered responses'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};