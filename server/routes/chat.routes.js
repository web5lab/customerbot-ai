import express from 'express';
import { AiChatController, AiChatSessions, AiChatSession, markSessionAsResolved, updateSessionStatus } from '../controller/chat.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post("/process-chat",AiChatController)
router.get("/get-chat-sessions/:botId",authenticateToken,AiChatSessions)
router.get("/get-chat-session/:sessionId",authenticateToken,AiChatSession)
router.put("/session/:sessionId/resolve",authenticateToken,markSessionAsResolved)
router.put("/session/:sessionId/status",authenticateToken,updateSessionStatus)

export default router;