import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";
import toast from "react-hot-toast";

export const GetUserData = createAsyncThunk(
    "global/getUserData",
    async (token) => {
        try {
            const Response = await axiosInstance.get(`/auth/user-data`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const createBot = createAsyncThunk(
    "global/createBot",
    async ({ data }) => {
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.post(`/bot/create-bot`, data, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            toast.success("Bot Created Successfully");
            return Response.data;
        } catch (err) {
            toast.error("Bot Created Failed");
            if (err) {
                throw err;
            }
        }
    }
);

export const createBotApi = async ({ data }) => {
    try {
        const token = localStorage.getItem('authToken');
        const Response = await axiosInstance.post(`/bot/create-bot`, data, {
            headers: {
                Authorization: `Bearer ${token}` // Add the token to the request headers
            }
        });
        toast.success("Bot Created Successfully");
        return Response.data;
    } catch (err) {
        toast.error("Bot Created Failed");
        if (err) {
            throw err;
        }
    }
}


export const GetBots = createAsyncThunk(
    "global/getBots",
    async () => {
        console.log("get data api call")
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.get(`/bot/get-bot`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            console.log("api err 1 =>", err);
            if (err) {
                throw err;
            }
        }
    }
);

export const GetBotData = createAsyncThunk(
    "global/getBotData",
    async (token) => {
        try {
            const Response = await axiosInstance.get(`/auth/bot-data`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const DeleteChatBot = async ({chatBotId}) => {
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.delete(`/bot/delete-bot/${chatBotId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }


export const addFaq = createAsyncThunk(
    "global/addFaq",
    async ({ data, token }) => {
        try {
            const Response = await axiosInstance.post(`/auth/add-faq`, data, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const scrapPdfData = createAsyncThunk(
    "global/addPdfData",
    async ({ data }) => {
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.post(`/scrap-data/process-pdf`, data, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const scrapWebsiteUrl = createAsyncThunk(
    "global/scrapWebsiteUrl",
    async ({ url }) => {
        const token = localStorage.getItem('authToken');
        try {
            const Response = await axiosInstance.get(`/scrap-data/process-url?url=${url}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const getBotsession = createAsyncThunk(
    "global/getBotsession",
    async ({ data, token }) => {
        try {
            const Response = await axiosInstance.post(`/auth/get-bot-session`, data, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const getChatSessions = createAsyncThunk(
    "global/getChatSessions",
    async ({ botId }) => {
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.get(`/chat/get-chat-sessions/${botId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const getChatSession = createAsyncThunk(
    "global/getChatSession",
    async ({ sessionId }) => {
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.get(`/chat/get-chat-session/${sessionId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const updateChatBot = async ({ data, botId }) => {
    try {
        const token = localStorage.getItem('authToken');
        const Response = await axiosInstance.post(`/bot/update-bot/${botId}`, data, {
            headers: {
                Authorization: `Bearer ${token}` // Add the token to the request headers
            }
        });
        console.log("api data", Response);
        return Response.data;
    } catch (err) {
        if (err) {
            throw err;
        }
    }
}

export const getBotConfig = async ({ botId }) => {
    try {
        const Response = await axiosInstance.get(`/bot/bot-config/${botId}`);
        return Response.data.bot;
    } catch (err) {
        if (err) {
            throw err;
        }
    }
}

export const chatApi = createAsyncThunk(
    "global/chatApi",
    async ({ data }) => {
        try {
            const token = localStorage.getItem('authToken');
            const Response = await axiosInstance.post(`/chat/process-chat`, data, {
                headers: {
                    Authorization: `Bearer ${token}` // Add the token to the request headers
                }
            });
            console.log("api data", Response);
            return Response.data;
        } catch (err) {
            if (err) {
                throw err;
            }
        }
    }
);

export const geminiChatApi = async ({ data }) => {
    try {
        const token = localStorage.getItem('authToken');
        const Response = await axiosInstance.post(`/chat/process-chat`, data, {
            headers: {
                Authorization: `Bearer ${token}` // Add the token to the request headers
            }
        });
        return Response.data;
    } catch (err) {
        if (err) {
            throw err;
        }
    }
}

// Team Management Actions
export const getBotTeam = createAsyncThunk(
    "global/getBotTeam",
    async ({ botId }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axiosInstance.get(`/team/bot/${botId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }
);

export const getUserTeams = createAsyncThunk(
    "global/getUserTeams",
    async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axiosInstance.get(`/team/user-teams`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }
);

export const inviteTeamMember = async ({ botId, email, role }) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.post(`/team/bot/${botId}/invite`, 
            { email, role },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        toast.success("Team member invited successfully");
        return response.data;
    } catch (err) {
        toast.error("Failed to invite team member");
        throw err;
    }
};

export const updateTeamMember = async ({ botId, memberId, role, status }) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.put(`/team/bot/${botId}/member/${memberId}`, 
            { role, status },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        toast.success("Team member updated successfully");
        return response.data;
    } catch (err) {
        toast.error("Failed to update team member");
        throw err;
    }
};

export const removeTeamMember = async ({ botId, memberId }) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.delete(`/team/bot/${botId}/member/${memberId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success("Team member removed successfully");
        return response.data;
    } catch (err) {
        toast.error("Failed to remove team member");
        throw err;
    }
};

// Respond to team invitation
export const respondToInvitation = async ({ invitationId, action }) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.post(`/team/invitation/${invitationId}/respond`, 
            { action },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        toast.success(action === 'accept' ? 'Invitation accepted!' : 'Invitation declined');
        return response.data;
    } catch (err) {
        toast.error(`Failed to ${action} invitation`);
        throw err;
    }
};

export const getTeamPermissions =createAsyncThunk(
    "global/getTeamPermissions", async ({ botId }) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.get(`/team/bot/${botId}/permissions`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (err) {
        throw err;
    }
});