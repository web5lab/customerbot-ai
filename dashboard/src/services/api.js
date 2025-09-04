import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const api = {
  // Sessions
  getSessions: async () => {
    const response = await axios.get(`${API_URL}/sessions`);
    return response.data.map((session) => ({
      ...session,
      timestamp: new Date(session.timestamp).toISOString()
    }));
  },

  getSession: async (id) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_URL}/chat/get-chat-session/${id}`, {
      headers: {
        Authorization: `Bearer ${token}` // Add the token to the request headers
      }
    });
    const session = response.data;
    return {
      ...session,
      timestamp: new Date(session.timestamp).toISOString(),
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp).toISOString()
      }))
    };
  },

  createSession: async (title, firstMessage) => {
    const response = await axios.post < ChatSession > (`${API_URL}/sessions`, {
      title,
      lastMessage: firstMessage.content,
      messages: [firstMessage],
      messageCount: 1
    });
    return response.data;
  },

  deleteSession: async (id) => {
    await axios.delete(`${API_URL}/sessions/${id}`);
  },

  // Messages
  addMessage: async (sessionId, message) => {
    const response = await axios.post < ChatSession > (
      `${API_URL}/sessions/${sessionId}/messages`,
      message
    );
    return response.data;
  },

  // Session management
  markSessionAsResolved: async (sessionId, rating, feedback) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_URL}/chat/session/${sessionId}/resolve`, {
      rating,
      feedback
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateSessionStatus: async (sessionId, updates) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_URL}/chat/session/${sessionId}/status`, updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};