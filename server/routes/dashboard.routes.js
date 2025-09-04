import express from 'express';
import { getUserdata } from '../controller/dashboard.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post("/get-user-data",authenticateToken,getUserdata)

export default router;