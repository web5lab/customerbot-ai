import { Send, Loader2, Bot, User, Phone, Mail, Building, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { geminiChatApi } from '../store/global.Action';
import { 
  uiConfigSelector, 
  messagesSelector, 
  inputSelector, 
  isTypingSelector, 
  sessionIdSelector,
  activeBotSelector 
} from '../store/global.Selctor';
import { addMessage, setInput, setIsTyping, setSessionId, resetMessages } from '../store/global.Slice';

const THINKING_MESSAGES = [
    "Analyzing your request...",
    "Consulting the knowledge base...",
    "Generating the best response...",
    "Processing your question...",
    "Thinking carefully about this..."
];

export function ChatUI() {
    const dispatch = useDispatch();
    const uiConfig = useSelector(uiConfigSelector);
    const messages = useSelector(messagesSelector);
    const input = useSelector(inputSelector);
    const isTyping = useSelector(isTypingSelector);
    const sessionId = useSelector(sessionIdSelector);
    const activeBot = useSelector(activeBotSelector);
    const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
    const [showLeadCapture, setShowLeadCapture] = useState(false);
    const [leadData, setLeadData] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    });

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    const setInputData = (value) => dispatch(setInput(value));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        dispatch(setIsTyping(true));
        dispatch(addMessage({ role: 'user', content: input }));
        const messageToSend = input;
        dispatch(setInput(''));

        const thinkingInterval = setInterval(() => {
            setThinkingMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
        }, 2000);

        try {
            const chatData = {
                message: messageToSend,
                botId: activeBot._id,
                sessionId
            };

            // Include lead data if available
            if (leadData.email || leadData.name || leadData.phone) {
                chatData.leadData = leadData;
            }

            const response = await geminiChatApi({ data: chatData });

            clearInterval(thinkingInterval);
            dispatch(setSessionId(response.sessionId));
            dispatch(addMessage({ 
                role: 'bot', 
                content: response.aiResponse, 
                animation: 'fadeIn' 
            }));

            // Check if we should show lead capture form
            if (uiConfig.enableLeadCapture && !leadData.email && !leadData.name && messages.length > 4) {
                setTimeout(() => setShowLeadCapture(true), 2000);
            }
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

    const handleLeadCapture = async (e) => {
        e.preventDefault();
        
        // Send lead data with next message
        const hasValidData = leadData.email || leadData.name || leadData.phone;
        if (hasValidData) {
            try {
                const chatData = {
                    message: "Thank you for providing your contact information!",
                    botId: activeBot._id,
                    sessionId,
                    leadData
                };

                await geminiChatApi({ data: chatData });
                setShowLeadCapture(false);
                
                // Reset lead data
                setLeadData({
                    name: '',
                    email: '',
                    phone: '',
                    company: ''
                });
            } catch (error) {
                console.error('Error capturing lead:', error);
            }
        } else {
            setShowLeadCapture(false);
        }
    };

    const currentPalette = uiConfig.isCustomColorMode 
        ? {
            primary: uiConfig.customPrimaryColor,
            secondary: uiConfig.customSecondaryColor,
            bg: uiConfig.customBgColor
          }
        : {
            primary: uiConfig.customPrimaryColor,
            secondary: uiConfig.customSecondaryColor,
            bg: uiConfig.customBgColor
          };

    return (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col relative">
            {/* Lead Capture Modal */}
            {showLeadCapture && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Get Better Support
                                </h3>
                                <button
                                    onClick={() => setShowLeadCapture(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {uiConfig.leadCaptureMessage || 'To provide you with the best support, could you please share some details?'}
                            </p>
                        </div>

                        <form onSubmit={handleLeadCapture} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={leadData.name}
                                    onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={leadData.email}
                                        onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone (Optional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={leadData.phone}
                                        onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company (Optional)
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={leadData.company}
                                        onChange={(e) => setLeadData(prev => ({ ...prev, company: e.target.value }))}
                                        placeholder="Your company"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLeadCapture(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: currentPalette.bg }}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {uiConfig.botAvatar ? (
                            <img src={uiConfig.botAvatar} alt="Bot" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <Bot className="w-5 h-5 text-gray-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-gray-900 font-semibold">{uiConfig.botName || 'AI Assistant'}</h2>
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
            <div className="flex-1 overflow-hidden" style={{ backgroundColor: currentPalette.bg }}>
                <div className="h-full overflow-y-auto p-6 space-y-6">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-start gap-4 max-w-[85%]">
                                {message.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        {uiConfig.botAvatar ? (
                                            <img src={uiConfig.botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-gray-600" />
                                        )}
                                    </div>
                                )}

                                <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-lg px-4 py-3 border ${
                                            message.role === 'user'
                                                ? 'text-white border-gray-900'
                                                : message.isError 
                                                    ? 'bg-red-50 text-red-800 border-red-200' 
                                                    : 'bg-white text-gray-900 border-gray-200'
                                        }`}
                                        style={{ 
                                            fontSize: uiConfig.selectedFontSize,
                                            backgroundColor: message.role === 'user' ? currentPalette.primary : undefined
                                        }}
                                    >
                                        <p className="leading-relaxed">{message.content}</p>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {message.role === 'user' && <span className="text-green-500 ml-1">✓</span>}
                                    </div>
                                </div>

                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-lg border border-gray-600 flex items-center justify-center" style={{ backgroundColor: currentPalette.secondary }}>
                                        {uiConfig.userAvatar ? (
                                            <img src={uiConfig.userAvatar} alt="User" className="w-6 h-6 rounded-lg object-cover" />
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
                                    {uiConfig.botAvatar ? (
                                        <img src={uiConfig.botAvatar} alt="Bot" className="w-6 h-6 rounded-lg object-cover" />
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
                {uiConfig.customQuestions.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {uiConfig.customQuestions.map((question, index) => (
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
                            placeholder={uiConfig.placeholder || "Ask me anything..."}
                            rows={1}
                            className="w-full px-4 py-3 pr-16 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                            style={{
                                minHeight: '48px',
                                maxHeight: '120px',
                                focusRingColor: currentPalette.primary
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
                            {input.length}/{uiConfig.maxMessageLength || 500}
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
                            backgroundColor: isTyping || !input.trim() ? undefined : currentPalette.primary 
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
                    <span>AI-powered responses</span>
                </div>
            </div>
        </div>
    );
}