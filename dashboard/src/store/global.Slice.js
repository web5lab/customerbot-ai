import { createSlice } from '@reduxjs/toolkit'
import { GetBots, getChatSession, getChatSessions, GetUserData, updateChatBot, getBotTeam, getUserTeams } from './global.Action'

const initialState = {
  logedIn: false,
  profile: null,
  bots: [],
  activeBot: null,
  chatSessions: [],
  activeSession: null,
  teams: [],
  currentTeam: null,
  teamPermissions: null,
  uiConfig: {
    messages: [{ role: 'bot', content: 'Hello! How can I help you today?' }],
    selectedPalette: 0, // index of the selected palette
    isCustomColorMode: false,
    customPrimaryColor: '#3B82F6',
    customSecondaryColor: '#1c1d1d',
    customBgColor: '#f0f9ff',
    themeMode: 'light',
    botAvatar: '',
    userAvatar: '',
    selectedFontSize: '16px',
    botName: '',
    systemPrompt: 'You are a helpful assistant for customer support',
    customQuestions: [],
    chatPosition: 'bottom-right',
    chatSize: 'medium',
    animationStyle: 'slide-up',
    enableSounds: true,
    enableTypingIndicator: true,
    enableQuickReplies: true,
    enableHistory: true,
    enableFAQ: true,
    enableHandover: true,
    enableLeadCapture: true,
    leadCaptureMessage: 'To provide you with the best support, could you please share some details?',
    handoverMessage: 'Let me connect you with a human agent who can better assist you.',
    headerTitle: 'Chat Support',
    headerSubtitle: 'We\'re here to help',
    placeholder: 'Type your message...',
    companyName: 'CustomerBot',
    supportEmail: 'support@customerbot.com',
    businessHours: '9 AM - 6 PM EST',
    responseTime: '< 2 minutes',
    autoOpenDelay: 0,
    showBranding: true,
    customCSS: '',
    borderRadius: '12px',
    shadowIntensity: 'medium',
    messageHistoryLimit: 100,
    typingDelay: 1500,
    enableRateLimit: true,
    maxMessageLength: 500,
    messageAlignment: 'default',
    autoOpenDelay: 0,
    leadCaptureMessage: 'To provide you with the best support, could you please share some details?',
    handoverMessage: 'Let me connect you with a human agent who can better assist you.',
    sessionId: null,
    input: '',
    welcomeMessage: 'Hello, how can I help you today?',
    popupMessage: 'hey there! I am here to assist you. How can I help?',
    isTyping: false
  },
}

export const globalSlice = createSlice({
  name: 'globalState',
  initialState,
  reducers: {
    setLogedIn: (state, action) => {
      state.logedIn = action.payload
    },
    setLogout: (state) => {
      state.logedIn = false
      state.profile = null
      state.bots = []
      state.activeBot = null
      state.chatSessions = []
      state.activeSession = null
      state.uiConfig = {
        messages: [{ role: 'bot', content: 'Hello! How can I help you today?' }],
        selectedPalette: 0,
        isCustomColorMode: false,
        customPrimaryColor: '#3B82F6',
        customSecondaryColor: '#1c1d1d',
        customBgColor: '#f0f9ff',
        themeMode: 'light',
        botAvatar: '',
        userAvatar: '',
        selectedFontSize: '16px',
        botName: '',
        customQuestions: [],
        chatPosition: 'bottom-right',
        chatSize: 'medium',
        animationStyle: 'slide-up',
        enableSounds: true,
        enableTypingIndicator: true,
        enableQuickReplies: true,
        enableHistory: true,
        enableFAQ: true,
        enableHandover: true,
        enableLeadCapture: true,
        leadCaptureMessage: 'To provide you with the best support, could you please share some details?',
        handoverMessage: 'Let me connect you with a human agent who can better assist you.',
        headerTitle: 'Chat Support',
        headerSubtitle: 'We\'re here to help',
        placeholder: 'Type your message...',
        companyName: 'CustomerBot',
        supportEmail: 'support@customerbot.com',
        businessHours: '9 AM - 6 PM EST',
        responseTime: '< 2 minutes',
        autoOpenDelay: 0,
        showBranding: true,
        customCSS: '',
        borderRadius: '12px',
        shadowIntensity: 'medium',
        messageHistoryLimit: 100,
        typingDelay: 1500,
        enableRateLimit: true,
        maxMessageLength: 500,
        messageAlignment: 'default',
        sessionId: null,
        input: '',
        isTyping: false
      }
    },
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    setBots: (state, action) => {
      state.bots = action.payload
    },
    setBotsActive: (state, action) => {
      state.activeBot = action.payload;
      state.uiConfig.botAvatar = action.payload.icon || '';
      state.uiConfig.botName = action.payload.name || '';
      state.uiConfig.systemPrompt = action.payload.systemPrompt || 'You are a helpful assistant for customer support';
      state.uiConfig.customQuestions = action.payload.customQuestions || [];
      state.uiConfig.customPrimaryColor = action.payload.primaryColour || '#3B82F6';
      state.uiConfig.customSecondaryColor = action.payload.secondaryColour || '#1c1d1d';
      state.uiConfig.customBgColor = action.payload.backgroundColour || '#f0f9ff';
      state.uiConfig.themeMode = action.payload.themeMode || 'light';
      state.uiConfig.userAvatar = action.payload.userIcon || 'https://arcai.fun/assets/logo-CrKFoPSZ.png';
      state.uiConfig.selectedFontSize = action.payload.typography; // Default font size
      state.uiConfig.welcomeMessage = action.payload.welcomeMessage || 'Hello, how can I help you today?';
      state.uiConfig.popupMessage = action.payload.popupMessage || 'hey there! I am here to assist you. How can I help?';
      // Set other customizable options with defaults
      state.uiConfig.chatPosition = action.payload.chatPosition || 'bottom-right';
      state.uiConfig.chatSize = action.payload.chatSize || 'medium';
      state.uiConfig.animationStyle = action.payload.animationStyle || 'slide-up';
      state.uiConfig.enableSounds = action.payload.enableSounds !== undefined ? action.payload.enableSounds : true;
      state.uiConfig.enableTypingIndicator = action.payload.enableTypingIndicator !== undefined ? action.payload.enableTypingIndicator : true;
      state.uiConfig.enableQuickReplies = action.payload.enableQuickReplies !== undefined ? action.payload.enableQuickReplies : true;
      state.uiConfig.enableHistory = action.payload.enableHistory !== undefined ? action.payload.enableHistory : true;
      state.uiConfig.enableFAQ = action.payload.enableFAQ !== undefined ? action.payload.enableFAQ : true;
      state.uiConfig.enableHandover = action.payload.enableHandover !== undefined ? action.payload.enableHandover : true;
      state.uiConfig.enableLeadCapture = action.payload.enableLeadCapture !== undefined ? action.payload.enableLeadCapture : true;
      state.uiConfig.headerTitle = action.payload.headerTitle || 'Chat Support';
      state.uiConfig.headerSubtitle = action.payload.headerSubtitle || 'We\'re here to help';
      state.uiConfig.placeholder = action.payload.placeholder || 'Type your message...';
      state.uiConfig.companyName = action.payload.companyName || 'CustomerBot';
      state.uiConfig.supportEmail = action.payload.supportEmail || 'support@customerbot.com';
      state.uiConfig.businessHours = action.payload.businessHours || '9 AM - 6 PM EST';
      state.uiConfig.responseTime = action.payload.responseTime || '< 2 minutes';
      state.uiConfig.showBranding = action.payload.showBranding !== undefined ? action.payload.showBranding : true;
    },
    setUiConfig: (state, action) => {
      state.uiConfig = { ...state.uiConfig, ...action.payload }
    },
    addMessage: (state, action) => {
      state.uiConfig.messages.push(action.payload)
    },
    setInput: (state, action) => {
      state.uiConfig.input = action.payload
    },
    setIsTyping: (state, action) => {
      state.uiConfig.isTyping = action.payload
    },
    setSessionId: (state, action) => {
      state.uiConfig.sessionId = action.payload
    },
    resetMessages: (state) => {
      state.uiConfig.messages = [{ role: 'bot', content: state.uiConfig.welcomeMessage || 'Hello! How can I help you today?' }]
    },
    setTeams: (state, action) => {
      state.teams = action.payload
    },
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload
    },
    setTeamPermissions: (state, action) => {
      state.teamPermissions = action.payload
    },
    addTeamMember: (state, action) => {
      if (state.currentTeam) {
        state.currentTeam.members.push(action.payload)
      }
    },
    updateTeamMemberInState: (state, action) => {
      const { memberId, updates } = action.payload;
      if (state.currentTeam) {
        const memberIndex = state.currentTeam.members.findIndex(m => m._id === memberId);
        if (memberIndex !== -1) {
          state.currentTeam.members[memberIndex] = { ...state.currentTeam.members[memberIndex], ...updates };
        }
      }
    },
    removeTeamMemberFromState: (state, action) => {
      const memberId = action.payload;
      if (state.currentTeam) {
        state.currentTeam.members = state.currentTeam.members.filter(m => m._id !== memberId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUserData.pending, (state) => {
        state.logedIn = false;
      })
      .addCase(GetUserData.rejected, (state, action) => {
        state.logedIn = false;
      })
      .addCase(GetUserData.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.logedIn = true;
      });
    builder
      .addCase(GetBots.fulfilled, (state, action) => {
        state.bots = action.payload.bots || [];
      });
    builder
      .addCase(getChatSessions.pending, (state) => {
        state.chatSessions = [];
      })
      .addCase(getChatSessions.rejected, (state, action) => {
        state.chatSessions = [];
      })
      .addCase(getChatSessions.fulfilled, (state, action) => {
        state.chatSessions = action.payload || [];
      });
    builder
      .addCase(getChatSession.pending, (state) => {
        state.activeSession = null;
      })
      .addCase(getChatSession.rejected, (state, action) => {
        state.activeSession = null;
      })
      .addCase(getChatSession.fulfilled, (state, action) => {
        state.activeSession = action.payload || null;
      });
    builder
      .addCase(getBotTeam.pending, (state) => {
        state.currentTeam = null;
      })
      .addCase(getBotTeam.rejected, (state, action) => {
        state.currentTeam = null;
      })
      .addCase(getBotTeam.fulfilled, (state, action) => {
        state.currentTeam = action.payload.team || null;
      });
    builder
      .addCase(getUserTeams.pending, (state) => {
        state.teams = [];
      })
      .addCase(getUserTeams.rejected, (state, action) => {
        state.teams = [];
      })
      .addCase(getUserTeams.fulfilled, (state, action) => {
        state.teams = action.payload.teams || [];
      });
  }
})

export const { setLogedIn,
  setProfile,
  setBots,
  setInvitations,
  removeInvitation,
  setBotsActive,
  setUiConfig,
  addMessage,
  setInput,
  setIsTyping,
  setSessionId,
  setLogout,
  resetMessages,
  setTeams,
  setCurrentTeam,
  setTeamPermissions,
  addTeamMember,
  updateTeamMemberInState,
  removeTeamMemberFromState } = globalSlice.actions

export default globalSlice.reducer