import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { procesPdf, processUrl } from '../controller/scrapper.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/process-pdf', authenticateToken, upload.single('pdf'), procesPdf)
router.get('/process-url', authenticateToken, processUrl)

export default router;