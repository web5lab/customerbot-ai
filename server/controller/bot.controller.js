import mongoose from 'mongoose';
import Platform from '../models/Platform.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BotData from '../models/BotData.schema.js';
import puppeteer from 'puppeteer';
import { insertBotData } from '../services/vectorServices.js';
import Team from '../models/Team.schema.js';
import User from '../models/User.schema.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createChatBot = async (req, res) => {
    const id = req.user.userId;
    const { name, websiteUrl } = req.body;
    try {
        // Validate Platform ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Platform ID' });
        }

        const platform = await Platform.findOne({ userId: new mongoose.Types.ObjectId(id) });

        if (!platform) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Bot name is required' });
        }

        let pageText;

        if (websiteUrl) {
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 120000 });
            await new Promise(r => setTimeout(r, 2000)); // small delay for full content
            pageText = await page.evaluate(() => {
                const getMeta = (name) => {
                    const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
                    return el ? el.content : '';
                };

                const title = document.title || '';
                const metaDescription = getMeta('description');
                const metaKeywords = getMeta('keywords');
                const ogTitle = getMeta('og:title');
                const ogDescription = getMeta('og:description');

                const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
                    .map(h => h.innerText.trim())
                    .join(' ');

                const bodyText = document.body.innerText.trim().replace(/\s+/g, ' ');

                // Combine everything into one string
                return `
                    Title: ${title}
                    Meta Description: ${metaDescription}
                    Meta Keywords: ${metaKeywords}
                    OpenGraph Title: ${ogTitle}
                    OpenGraph Description: ${ogDescription}
                    Headings: ${headings}
                    Body: ${bodyText}
                `.replace(/\s+/g, ' ').trim();
            });
            await browser.close();
           
        }

        console.log('Website Text:', pageText);

        // Get user data for team creation
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional icon handling
        let iconPath = 'https://customerbot.in/avatars/bot1.png'; // fallback icon

        if (req.file && req.file.buffer) {
            iconPath = path.join('uploads', `${Date.now()}-${req.file.originalname}`);
            fs.writeFileSync(iconPath, req.file.buffer);
        }

        const newBot = new BotConfig({
            platFormId: platform._id,
            name,
            trainingData: '',
            discription: '',
            icon: iconPath
        });


        await newBot.save();

        // Create team for the new bot
        const newTeam = new Team({
            botId: newBot._id,
            ownerId: new mongoose.Types.ObjectId(id),
            members: [{
                userId: new mongoose.Types.ObjectId(id),
                email: user.email || 'owner@example.com',
                name: user.name || 'Bot Owner',
                role: 'admin',
                status: 'active',
                invitedBy: new mongoose.Types.ObjectId(id),
                joinedAt: new Date()
            }]
        });
        await newTeam.save();

        if (pageText) {
            await insertBotData({ botId: newBot._id, Data: pageText });
        }
        res.status(201).json({ message: 'Chatbot created successfully', bot: newBot });
    } catch (error) {
        console.error('Error creating chatbot:', error);
        res.status(500).json({ message: 'Server error while creating chatbot' });
    }
};


export const getChatBot = async (req, res) => {
    const id = req.user.userId;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Platform ID' });
        }

        // Get user's own platform and bots
        const platform = await Platform.findOne({ userId: new mongoose.Types.ObjectId(id) });
        let ownedBots = [];
        if (platform) {
            ownedBots = await BotConfig.find({ platFormId: platform._id });
        }

        // Get bots where user is a team member
        const teamMemberships = await Team.find({
            'members.userId': new mongoose.Types.ObjectId(id),
            'members.status': 'active'
        }).populate('botId');

        const teamBots = teamMemberships
            .map(team => team.botId)
            .filter(bot => bot !== null); // Filter out any null values

        // Combine owned bots and team bots, removing duplicates
        const allBotIds = new Set();
        const allBots = [];

        // Add owned bots
        ownedBots.forEach(bot => {
            if (!allBotIds.has(bot._id.toString())) {
                allBotIds.add(bot._id.toString());
                allBots.push({
                    ...bot.toObject(),
                    userRole: 'owner',
                    isOwner: true
                });
            }
        });

        // Add team bots
        teamBots.forEach(bot => {
            if (!allBotIds.has(bot._id.toString())) {
                allBotIds.add(bot._id.toString());
                
                // Find user's role in this team
                const team = teamMemberships.find(t => t.botId._id.toString() === bot._id.toString());
                const userMember = team.members.find(m => m.userId.toString() === id);
                
                allBots.push({
                    ...bot.toObject(),
                    userRole: userMember ? userMember.role : 'viewer',
                    isOwner: false,
                    teamId: team._id
                });
            }
        });

        console.log('All accessible bots:', allBots.length);
        res.status(200).json({ bots: allBots });
    } catch (error) {
        console.error('Error fetching chatbot:', error);
        res.status(500).json({ message: 'Server error while fetching chatbot' });
    }
};

export const updateChatBot = async (req, res) => {
    const { botId } = req.params;
    const {
        name,
        botAvatar,
        userAvatar,
        trainingData,
        description,
        systemPrompt,
        customPrimaryColor,
        customSecondaryColor,
        customBgColor,
        themeMode,
        selectedFontSize,
        customQuestions,
    } = req.body;

    const iconFile = req.files?.icon?.[0] || null;
    const userIconFile = req.files?.userIcon?.[0] || null;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const updateFields = {};

        if (name) updateFields.name = name;
        if (trainingData) updateFields.trainingData = trainingData;
        if (description) updateFields.discription = description;
        if (systemPrompt) updateFields.systemPrompt = systemPrompt;

        // Optional theme-related fields
        if (customPrimaryColor) updateFields.primaryColour = customPrimaryColor;
        if (customSecondaryColor) updateFields.secondaryColour = customSecondaryColor;
        if (customBgColor) updateFields.backgroundColour = customBgColor;
        if (themeMode) updateFields.themeMode = themeMode;
        if (selectedFontSize) updateFields.typography = selectedFontSize;
        if (Array.isArray(customQuestions) && customQuestions.length > 0) {
            updateFields.customQuestions = customQuestions;
        }
        if (iconFile) {
            const iconPath = path.join('uploads', `${Date.now()}-${iconFile.originalname}`);
            fs.writeFileSync(iconPath, iconFile.buffer);
            updateFields.icon = iconPath;
        }

        if (botAvatar) {
            updateFields.icon = botAvatar;
        }

        // Handle userIcon file
        if (userIconFile) {
            const userIconPath = path.join('uploads', `${Date.now()}-${userIconFile.originalname}`);
            fs.writeFileSync(userIconPath, userIconFile.buffer);
            updateFields.userIcon = userIconPath;
        }

        if (userAvatar) {
            updateFields.userIcon = userAvatar;
        }

        const updatedBot = await BotConfig.findByIdAndUpdate(
            botId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedBot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        res.status(200).json({ message: 'Bot updated successfully', bot: updatedBot });
    } catch (error) {
        console.error('Error updating chatbot:', error);
        res.status(500).json({ message: 'Server error while updating chatbot' });
    }
};

export const serveAvatar = (req, res) => {
    try {
        const { filename } = req.params;

        // Validate filename to prevent directory traversal attacks
        if (!filename || !filename.match(/^[\w-]+\.(jpg|jpeg|png)$/)) {
            return res.status(400).json({ message: 'Invalid filename' });
        }

        const avatarPath = path.join(__dirname, '..', 'uploads', filename);

        // Check if file exists
        if (!fs.existsSync(avatarPath)) {
            return res.status(404).json({ message: 'Avatar not found' });
        }

        // Serve the file
        res.sendFile(avatarPath);
    } catch (error) {
        console.error('Error serving avatar:', error);
        res.status(500).json({ message: error.message });
    }
};


export const addWebsiteUrl = async (req, res) => {
    const { botId } = req.params;
    const { url, data } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.websiteUrls.push({ url, data });
        await botData.save();

        res.status(200).json({ message: 'Website URL added successfully', botData });
    } catch (error) {
        console.error('Error adding website URL:', error);
        res.status(500).json({ message: 'Server error while adding website URL' });
    }
};

export const addFaq = async (req, res) => {
    const { botId } = req.params;
    const { question, answer } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.faqs.push({ question, answer });
        await botData.save();

        res.status(200).json({ message: 'FAQ added successfully', botData });
    } catch (error) {
        console.error('Error adding FAQ:', error);
        res.status(500).json({ message: 'Server error while adding FAQ' });
    }
};

export const addPdfData = async (req, res) => {
    const { botId } = req.params;
    const { fileName, data } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.pdfData.push({ fileName, data });
        await botData.save();

        res.status(200).json({ message: 'PDF data added successfully', botData });
    } catch (error) {
        console.error('Error adding PDF data:', error);
        res.status(500).json({ message: 'Server error while adding PDF data' });
    }
};

export const addTextData = async (req, res) => {
    const { botId } = req.params;
    const { title, content } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.textData.push({ title, content });
        await botData.save();

        res.status(200).json({ message: 'Text data added successfully', botData });
    } catch (error) {
        console.error('Error adding text data:', error);
        res.status(500).json({ message: 'Server error while adding text data' });
    }
};

export const getAllBotData = async (req, res) => {
    const { botId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        res.status(200).json({ botData });
    } catch (error) {
        console.error('Error fetching bot data:', error);
        res.status(500).json({ message: 'Server error while fetching bot data' });
    }
};

export const deleteWebsiteUrl = async (req, res) => {
    const { botId, urlId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(urlId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or URL ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.websiteUrls.id(urlId).remove();
        await botData.save();

        res.status(200).json({ message: 'Website URL deleted successfully', botData });
    } catch (error) {
        console.error('Error deleting website URL:', error);
        res.status(500).json({ message: 'Server error while deleting website URL' });
    }
};

export const updateWebsiteUrl = async (req, res) => {
    const { botId, urlId } = req.params;
    const { url, data } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(urlId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or URL ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        const websiteUrl = botData.websiteUrls.id(urlId);
        if (!websiteUrl) {
            return res.status(404).json({ message: 'Website URL not found' });
        }

        if (url) websiteUrl.url = url;
        if (data) websiteUrl.data = data;
        await botData.save();

        res.status(200).json({ message: 'Website URL updated successfully', botData });
    } catch (error) {
        console.error('Error updating website URL:', error);
        res.status(500).json({ message: 'Server error while updating website URL' });
    }
};

export const deleteFaq = async (req, res) => {
    const { botId, faqId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(faqId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or FAQ ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.faqs.id(faqId).remove();
        await botData.save();

        res.status(200).json({ message: 'FAQ deleted successfully', botData });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Server error while deleting FAQ' });
    }
};

export const updateFaq = async (req, res) => {
    const { botId, faqId } = req.params;
    const { question, answer } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(faqId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or FAQ ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        const faq = botData.faqs.id(faqId);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        if (question) faq.question = question;
        if (answer) faq.answer = answer;
        await botData.save();

        res.status(200).json({ message: 'FAQ updated successfully', botData });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ message: 'Server error while updating FAQ' });
    }
};

export const deletePdfData = async (req, res) => {
    const { botId, pdfId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(pdfId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or PDF ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.pdfData.id(pdfId).remove();
        await botData.save();

        res.status(200).json({ message: 'PDF data deleted successfully', botData });
    } catch (error) {
        console.error('Error deleting PDF data:', error);
        res.status(500).json({ message: 'Server error while deleting PDF data' });
    }
};

export const updatePdfData = async (req, res) => {
    const { botId, pdfId } = req.params;
    const { fileName, data } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(pdfId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or PDF ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        const pdf = botData.pdfData.id(pdfId);
        if (!pdf) {
            return res.status(404).json({ message: 'PDF data not found' });
        }

        if (fileName) pdf.fileName = fileName;
        if (data) pdf.data = data;
        await botData.save();

        res.status(200).json({ message: 'PDF data updated successfully', botData });
    } catch (error) {
        console.error('Error updating PDF data:', error);
        res.status(500).json({ message: 'Server error while updating PDF data' });
    }
};

export const deleteTextData = async (req, res) => {
    const { botId, textId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(textId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or Text ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        botData.textData.id(textId).remove();
        await botData.save();

        res.status(200).json({ message: 'Text data deleted successfully', botData });
    } catch (error) {
        console.error('Error deleting text data:', error);
        res.status(500).json({ message: 'Server error while deleting text data' });
    }
};

export const updateTextData = async (req, res) => {
    const { botId, textId } = req.params;
    const { title, content } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(textId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or Text ID' });
        }

        const botData = await BotData.findOne({ botConfigId: botId });
        if (!botData) {
            return res.status(404).json({ message: 'Bot data not found' });
        }

        const text = botData.textData.id(textId);
        if (!text) {
            return res.status(404).json({ message: 'Text data not found' });
        }

        if (title) text.title = title;
        if (content) text.content = content;
        await botData.save();

        res.status(200).json({ message: 'Text data updated successfully', botData });
    } catch (error) {
        console.error('Error updating text data:', error);
        res.status(500).json({ message: 'Server error while updating text data' });
    }
};

export const deleteBot = async (req, res) => {
    const { botId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const bot = await BotConfig.findByIdAndDelete(botId);
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        // Also delete associated BotData
        await BotData.findOneAndDelete({ botConfigId: botId });

        res.status(200).json({ message: 'Bot deleted successfully' });
    } catch (error) {
        console.error('Error deleting bot:', error);
        res.status(500).json({ message: 'Server error while deleting bot' });
    }
};

export const getBotById = async (req, res) => {
    const { botId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const bot = await BotConfig.findById(botId);
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        res.status(200).json({ bot });
    } catch (error) {
        console.error('Error fetching bot by ID:', error);
        res.status(500).json({ message: 'Server error while fetching bot by ID' });
    }
}