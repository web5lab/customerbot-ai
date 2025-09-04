import { Send, Loader2, Bot, User } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { geminiChatApi, getBotConfig } from '../store/global.Action';

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

    const setInputData = (value) => setInput(value);

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
                    <div className="p-6 border-b border-gray-200" style={{ backgroundColor: customBgColor || '#f0f9ff' }}>
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

                    {/* Message Area */}
                    <div className="flex-1 overflow-hidden" style={{ backgroundColor: customBgColor }}>
                        <div className="h-full overflow-y-auto p-6 space-y-6">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className="flex items-start gap-4 max-w-[85%]">
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
                                                style={{ fontSize: selectedFontSize }}
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
                                </div>
                            ))}

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

                        <form onSubmit={handleSubmit} className="flex items-end gap-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={e => setInputData(e.target.value)}
                                    placeholder="Ask me anything..."
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

                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span>Press Enter to send, Shift + Enter for new line</span>
                            <span>AI-powered responses</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};