import React, { useState } from 'react';
import { X, MessageSquare, Bell, Info } from 'lucide-react';


export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [lastActivity, setLastActivity] = useState(Date.now());

  window.addEventListener("message", (event) => {
    if (event.data?.type === "CHATBOT") {
      // Close the modal, iframe, or whatever UI element you need to hide
      setIsOpen(false);
    }
  });

  return (
    <>
      {/* Toasts Notification System */}
      <div className="fixed bottom-24 right-6 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-2 transition-all duration-300 ${toast.type === 'message' ? 'bg-sky-500 text-white' :
              toast.type === 'system' ? 'bg-gray-800 text-white' :
                'bg-white border border-gray-200 text-gray-800'
              }`}
          >
            {toast.type === 'message' ? (
              <MessageSquare className="h-4 w-4" />
            ) : toast.type === 'system' ? (
              <Info className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              className="ml-2 opacity-70 hover:opacity-100"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Chat Button with Enhanced Notification Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {notification && (
            <div
              className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-xl shadow-lg p-4 border border-sky-100 animate-pulse-subtle"
              onClick={() => {
                setIsOpen(true);
                setHasUnreadMessages(false);
                setNotification(null);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-sky-500" />
                <p className="text-sm font-medium text-gray-800">{notification}</p>
              </div>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 pl-7">Click to view your messages</p>
              )}
            </div>
          )}
          <button
            onClick={() => {
              setIsOpen(true);
              setHasUnreadMessages(false);
              setNotification(null);
              setUnreadCount(0);
              setLastActivity(Date.now());
            }}
            className="relative p-0 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 transition-colors"
          >
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                {unreadCount > 0 ? unreadCount : '!'}
              </span>
            )}
            <svg className="w-16 p-2 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300 overflow-hidden ${isExpanded ? 'w-[540px] h-[700px]' : 'w-[440px] h-[600px]'
            }`}
        >
          <iframe src='https://ai.customerbot.in/' className='h-full w-full rounded-2xl' />
        </div>
      )}
    </>
  );
}