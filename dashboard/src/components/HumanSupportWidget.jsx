import { useState, useEffect } from 'react';
import { 
  UserCheck, 
  MessageSquare, 
  Clock, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import socketService from '../services/socketService';

export function HumanSupportWidget({ 
  sessionId, 
  botId, 
  onSupportRequested, 
  onAgentJoined 
}) {
  const [showSupportButton, setShowSupportButton] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentInfo, setAgentInfo] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState('2-5 minutes');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Listen for support confirmation
    socketService.on('support-requested', (data) => {
      setSupportRequested(true);
      setEstimatedWaitTime(data.estimatedWaitTime || '2-5 minutes');
      onSupportRequested?.(data);
    });

    // Listen for agent joining
    socketService.on('agent-joined', (data) => {
      setAgentConnected(true);
      setAgentInfo({
        name: data.agentName,
        id: data.agentId
      });
      setSupportRequested(false);
      onAgentJoined?.(data);
    });

    return () => {
      socketService.off('support-requested');
      socketService.off('agent-joined');
    };
  }, [onSupportRequested, onAgentJoined]);

  const handleRequestSupport = () => {
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

  if (agentConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-green-800">
              {agentInfo?.name || 'Human Agent'} is now assisting you
            </p>
            <p className="text-sm text-green-600">You're now connected to human support</p>
          </div>
        </div>
      </div>
    );
  }

  if (supportRequested) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="font-medium text-yellow-800">Connecting you with a human agent...</p>
            <p className="text-sm text-yellow-600">Estimated wait time: {estimatedWaitTime}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showContactForm) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-blue-900">Connect with Human Support</h3>
          <button
            onClick={() => setShowContactForm(false)}
            className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Please provide your contact information so our team can assist you better.
        </p>
        <form onSubmit={handleContactFormSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={contactInfo.name}
              onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <input
              type="email"
              placeholder="Your email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
              className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <input
            type="tel"
            placeholder="Your phone (optional)"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                socketService.requestHumanSupport(sessionId, 'I would like to speak with a human agent');
                setShowContactForm(false);
              }}
              className="flex-1 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
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
    );
  }

  if (showSupportButton) {
    return (
      <div className="flex justify-center mb-4">
        <button
          onClick={handleRequestSupport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
        >
          <UserCheck className="w-4 h-4" />
          Talk to Human Agent
        </button>
      </div>
    );
  }

  return null;
}