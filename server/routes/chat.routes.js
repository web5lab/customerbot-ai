import express from 'express';
import { 
    AiChatController, 
    AiChatSessions, 
    AiChatSession, 
    markSessionAsResolved, 
    updateSessionStatus,
    requestHumanSupport,
    getActiveSupportSessions,
    assignAgentToSession
} from '../controller/chat.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post("/process-chat",AiChatController)
router.get("/get-chat-sessions/:botId",authenticateToken,AiChatSessions)
router.get("/get-chat-session/:sessionId",authenticateToken,AiChatSession)
router.put("/session/:sessionId/resolve",authenticateToken,markSessionAsResolved)
router.put("/session/:sessionId/status",authenticateToken,updateSessionStatus)
router.post("/session/:sessionId/request-support", requestHumanSupport)
router.get("/bot/:botId/support-sessions", authenticateToken, getActiveSupportSessions)
router.post("/session/:sessionId/assign-agent", authenticateToken, assignAgentToSession)

export default router;