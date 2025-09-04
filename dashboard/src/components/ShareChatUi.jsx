import { Send, Loader2, Bot, User } from 'lucide-react';
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
    const [customPrimaryColor, setCustomPrimaryColor] = useState();
    const [customSecondaryColor, setCustomSecondaryColor] = useState();
    const [customBgColor, setCustomBgColor] = useState();
    const [themeMode, setThemeMode] = useState();
    const [botAvatar, setBotAvatar] = useState();
    const [userAvatar, setUserAvatar] = useState();
    const [selectedFontSize, setSelectedFontSize] = useState();
    const [botName, setBotName] = useState();
    const [customQuestions, setCustomQuestions] = useState([]);
    const [messages, setMessages] = useState([{ role: 'bot', content: 'Hello! How can I help you today?' }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState();
    const [activeBotId, setActiveBotId] = useState();
    const [sessionId, setSessionId] = useState();
    const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHumanSupportButton, setShowHumanSupportButton] = useState(false);
    const [humanSupportRequested, setHumanSupportRequested] = useState(false);
    const [agentInfo, setAgentInfo] = useState(null);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useLayoutEffect(() => {
        const fetchThemeData = async () => {
            try {
                setIsLoading(true);
                const query = new URLSearchParams(window.location.search);
                const id = query.get('id');
                if (id) {
                    setActiveBotId(id);
                    const data = await getBotConfig({ botId: id });
                    setCustomPrimaryColor(data.primaryColour);
                    setCustomSecondaryColor(data.secondaryColour);
                    setCustomBgColor(data.backgroundColour);
                    setThemeMode(data.themeMode);
                    setBotAvatar(data.icon);
                    setUserAvatar(data.userIcon);
                    setSelectedFontSize(data.typography);
                    setBotName(data.name);
                    setCustomQuestions(data.customQuestions);
                    setMessages([{ role: 'bot', content: data.welcomeMessage }]);
                    setInput('');
                    setIsTyping(false);
                    setSessionId(data.sessionId || null);
                }
            } catch (error) {
                console.error('Error fetching theme data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchThemeData();
    }, [])

    // Initialize socket connection
    useEffect(() => {
        if (activeBotId && sessionId) {
            socketService.connect();
            socketService.joinSession(sessionId, activeBotId);

            // Listen for agent joining
            socketService.on('agent-joined', (data) => {
                setAgentInfo({
                    name: data.agentName,
                    id: data.agentId
                });
                setHumanSupportRequested(false);
                
                // Add system message
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `${data.agentName} has joined the conversation`,
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

            // Listen for session resolved
            socketService.on('session-resolved', (data) => {
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `Session resolved by ${data.resolvedBy}`,
                    timestamp: data.timestamp
                }]);
            });

            // Listen for support confirmation
            socketService.on('support-requested', (data) => {
                setHumanSupportRequested(true);
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: data.message,
                    timestamp: Date.now()
                }]);
            });

            return () => {
                socketService.removeAllListeners();
                socketService.disconnect();
            };
        }
    }, [activeBotId, sessionId]);

    // Show human support button after 3 messages
    useEffect(() => {
        if (messages.length >= 6 && !humanSupportRequested && !agentInfo) {
            setShowHumanSupportButton(true);
        }
    }, [messages.length, humanSupportRequested, agentInfo]);

    const setInputData = (value) => setInput(value);

    const handleRequestHumanSupport = async () => {
        if (!sessionId) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat/session/${sessionId}/request-support`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'I would like to speak with a human agent',
                    customerInfo: contactInfo.email || contactInfo.name ? contactInfo : null
                })
            });

            if (response.ok) {
                setHumanSupportRequested(true);
                setShowHumanSupportButton(false);
                setShowContactForm(false);
                
                // Also notify via socket
                socketService.requestHumanSupport(
                    sessionId, 
                    'I would like to speak with a human agent',
                    contactInfo.email || contactInfo.name ? contactInfo : null
                );
            }
        } catch (error) {
            console.error('Error requesting human support:', error);
        }
    };

    const handleContactFormSubmit = (e) => {
        e.preventDefault();
        handleRequestHumanSupport();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        setIsTyping(true);
        let updatedMessages = [...messages, { role: 'user', content: input }];
        setMessages(updatedMessages);
        setInput('');

        const thinkingInterval = setInterval(() => {
            setThinkingMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
        }, 2000);

        try {
            const Chatdata = await geminiChatApi({
                data: { message: input, botId: activeBotId, sessionId }
            });

            clearInterval(thinkingInterval);
            setSessionId(Chatdata.sessionId);
            setMessages([...updatedMessages, { role: 'bot', content: Chatdata.aiResponse, animation: 'fadeIn' }]);
            
            // If agent is present, also send via socket
            if (agentInfo) {
                socketService.sendMessage(Chatdata.sessionId, input, false);
            }
        } catch (error) {
            clearInterval(thinkingInterval);
            setMessages([...updatedMessages, { role: 'bot', content: "Sorry, I encountered an error processing your request.", isError: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    return (
        <>
            {isLoading ? (<LoadingScreen />) : (
                <div className="h-screen w-screen bg-white flex flex-col">
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                {botAvatar ? (
                                    <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                    <Bot className="w-5 h-5 text-gray-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-gray-900 font-semibold">{botName || 'AI Assistant'}</h2>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    {isTyping ? (
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
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Online</span>
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
                            {showHumanSupportButton && !humanSupportRequested && !agentInfo && (
                                <div className="flex justify-center mb-4">
                                    <button
                                        onClick={() => setShowContactForm(true)}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                                    >
                                        🙋‍♂️ Talk to Human Agent
                                    </button>
                                </div>
                            )}

                            {/* Contact Form Modal */}
                            {showContactForm && (
                                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                        Connect with Human Support
                                    </h3>
                                    <p className="text-blue-700 mb-4">
                                        Please provide your contact information so our team can assist you better.
                                    </p>
                                    <form onSubmit={handleContactFormSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={contactInfo.name}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                                                className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Your email"
                                                value={contactInfo.email}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                                                className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Your phone (optional)"
                                            value={contactInfo.phone}
                                            onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowContactForm(false)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Request Human Support
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

                            {/* Agent Info */}
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
                                            {message.role === 'system' && (
                                                <div className="text-center w-full mb-2">
                                                    <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm border border-gray-200">
                                                        {message.content}
                                                    </div>
                                                </div>
                                            )}

                                            {message.role !== 'system' && (
                                            <div
                                                className={`rounded-lg px-4 py-3 border ${
                                                    message.role === 'user'
                                                        ? 'bg-gray-900 text-white border-gray-900'
                                                        : message.isError 
                                                            ? 'bg-red-50 text-red-800 border-red-200' 
                                                            : message.isAgent
                                                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                                                : 'bg-white text-gray-900 border-gray-200'
                                                }`}
                                                style={{ fontSize: selectedFontSize }}
                                            >
                                                <p className="leading-relaxed">{message.content}</p>
                                            </div>
                                            )}
                                            <div className="mt-2 text-xs text-gray-500">
                                                <span>{formatTime(message.timestamp)}</span>
                                                {message.role === 'user' && <span className="text-green-500 ml-1">✓</span>}
                                            </div>
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-lg bg-gray-600 border border-gray-600 flex items-center justify-center">
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

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex items-start gap-4 max-w-[80%]">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            {botAvatar ? (
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
                                                <span className="text-sm italic text-gray-500">{thinkingMessage}</span>
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
                        {customQuestions.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {customQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setInputData(question)}
                                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex items-end gap-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={e => setInputData(e.target.value)}
                                    placeholder={agentInfo ? `Message ${agentInfo.name}...` : "Ask me anything..."}
                                    rows={1}
                                    className="w-full px-4 py-3 pr-16 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                    style={{
                                        minHeight: '48px',
                                        maxHeight: '120px'
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
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
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
                            <span>{agentInfo ? 'Connected to human agent' : 'AI-powered responses'}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};