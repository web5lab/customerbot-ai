import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { authenticateToken } from '../middleware/auth.js';
import {
    createChatBot,
    getChatBot,
    serveAvatar,
    updateChatBot,
    addWebsiteUrl,
    addFaq,
    addPdfData,
    addTextData,
    getAllBotData,
    deleteWebsiteUrl,
    updateWebsiteUrl,
    deleteFaq,
    updateFaq,
    deletePdfData,
    updatePdfData,
    deleteTextData,
    updateTextData,
    deleteBot,
    getBotById
} from '../controller/bot.controller.js';

// Create a new router object
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage to process the image in memory

const upload = multer({ storage });

// Middleware to compress and reduce image quality
const compressImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const buffer = await sharp(req.file.buffer)
            .resize(200, 200) // Resize to 200x200 pixels
            .jpeg({ quality: 80 }) // Reduce quality to 80%
            .toBuffer();

        req.file.buffer = buffer;
        req.file.mimetype = 'image/jpeg';
        req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, ".jpg"); // Change extension to .jpg

        next();
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ message: 'Error processing image' });
    }
};

// Route to create a new chatbot, requires authentication
router.post("/create-bot", authenticateToken, upload.single('icon'), compressImage, createChatBot);

// Route to update an existing chatbot, requires authentication
router.post(
    "/update-bot/:botId",
    authenticateToken,
    upload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'userIcon', maxCount: 1 }
    ]),
    compressImage,
    updateChatBot
);

// Route to get details of a chatbot, requires authentication
router.get("/get-bot", authenticateToken, getChatBot);
router.get('/bot-config/:botId', getBotById);
// Route to get all data of a chatbot, requires authentication
router.get('/bot/:botId/data', authenticateToken, getAllBotData);

// Routes to add data to a chatbot, requires authentication
router.post('/bot/:botId/website-url', authenticateToken, addWebsiteUrl);
router.post('/bot/:botId/faq', authenticateToken, addFaq);
router.post('/bot/:botId/pdf-data', authenticateToken, addPdfData);
router.post('/bot/:botId/text-data', authenticateToken, addTextData);

// Routes to delete data from a chatbot, requires authentication
router.delete('/bot/:botId/website-url/:urlId', authenticateToken, deleteWebsiteUrl);
router.delete('/bot/:botId/faq/:faqId', authenticateToken, deleteFaq);
router.delete('/bot/:botId/pdf-data/:pdfId', authenticateToken, deletePdfData);
router.delete('/bot/:botId/text-data/:textId', authenticateToken, deleteTextData);

// Routes to update data of a chatbot, requires authentication
router.put('/bot/:botId/website-url/:urlId', authenticateToken, updateWebsiteUrl);
router.put('/bot/:botId/faq/:faqId', authenticateToken, updateFaq);
router.put('/bot/:botId/pdf-data/:pdfId', authenticateToken, updatePdfData);
router.put('/bot/:botId/text-data/:textId', authenticateToken, updateTextData);

// Route to delete a chatbot, requires authentication
router.delete('/delete-bot/:botId', authenticateToken, deleteBot);

// Serve static files from the "uploads" directory
router.get('/uploads/:filename', serveAvatar);

// Export the router object to be used in other parts of the application
export default router;