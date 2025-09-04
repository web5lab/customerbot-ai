import express from 'express';
import { AiChatController, AiChatSession, AiChatSessions } from '../controller/chat.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post("/process-chat",AiChatController)
router.get("/get-chat-sessions/:botId",authenticateToken,AiChatSessions)
router.get("/get-chat-session/:sessionId",authenticateToken,AiChatSession)

export default router;