import mongoose from 'mongoose';
import Lead from '../models/Lead.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import Platform from '../models/Platform.schema.js';
import Session from '../models/Session.schema.js';
import Team from '../models/Team.schema.js';

// Get all leads for user's bots
export const getLeads = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            botId, 
            status, 
            priority, 
            assignedTo, 
            search, 
            sortBy = 'capturedAt', 
            sortOrder = 'desc',
            page = 1,
            limit = 50
        } = req.query;

        // Get user's accessible bots
        const platform = await Platform.findOne({ userId });
        let accessibleBotIds = [];

        if (platform) {
            const ownedBots = await BotConfig.find({ platFormId: platform._id }).select('_id');
            accessibleBotIds = ownedBots.map(bot => bot._id);
        }

        // Get bots where user is a team member
        const teamMemberships = await Team.find({
            'members.userId': userId,
            'members.status': 'active'
        }).populate('botId');

        const teamBotIds = teamMemberships
            .filter(team => team.botId)
            .map(team => team.botId._id);

        accessibleBotIds = [...accessibleBotIds, ...teamBotIds];

        // Build query
        const query = { botId: { $in: accessibleBotIds } };

        if (botId && mongoose.Types.ObjectId.isValid(botId)) {
            query.botId = botId;
        }
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
            query.assignedTo = assignedTo;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const leads = await Lead.find(query)
            .populate('botId', 'name icon')
            .populate('sessionId', 'title messageCount')
            .populate('assignedTo', 'name email')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Lead.countDocuments(query);

        res.status(200).json({
            leads,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Server error while fetching leads' });
    }
};

// Get lead statistics
export const getLeadStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { botId, period = '30d' } = req.query;

        // Get user's accessible bots
        const platform = await Platform.findOne({ userId });
        let accessibleBotIds = [];

        if (platform) {
            const ownedBots = await BotConfig.find({ platFormId: platform._id }).select('_id');
            accessibleBotIds = ownedBots.map(bot => bot._id);
        }

        const teamMemberships = await Team.find({
            'members.userId': userId,
            'members.status': 'active'
        }).populate('botId');

        const teamBotIds = teamMemberships
            .filter(team => team.botId)
            .map(team => team.botId._id);

        accessibleBotIds = [...accessibleBotIds, ...teamBotIds];

        const query = { botId: { $in: accessibleBotIds } };
        if (botId && mongoose.Types.ObjectId.isValid(botId)) {
            query.botId = botId;
        }

        // Calculate date range
        const now = new Date();
        const periodStart = new Date();
        if (period === '7d') {
            periodStart.setDate(periodStart.getDate() - 7);
        } else if (period === '30d') {
            periodStart.setDate(periodStart.getDate() - 30);
        } else if (period === '90d') {
            periodStart.setDate(periodStart.getDate() - 90);
        }

        query.capturedAt = { $gte: periodStart };

        // Get basic stats
        const totalLeads = await Lead.countDocuments(query);
        const newLeads = await Lead.countDocuments({ ...query, status: 'new' });
        const contactedLeads = await Lead.countDocuments({ ...query, status: 'contacted' });
        const qualifiedLeads = await Lead.countDocuments({ ...query, status: 'qualified' });
        const convertedLeads = await Lead.countDocuments({ ...query, status: 'converted' });
        const lostLeads = await Lead.countDocuments({ ...query, status: 'lost' });

        // Get leads with contact info
        const leadsWithEmail = await Lead.countDocuments({ ...query, email: { $ne: null, $ne: '' } });
        const leadsWithPhone = await Lead.countDocuments({ ...query, phone: { $ne: null, $ne: '' } });
        const leadsWithName = await Lead.countDocuments({ ...query, name: { $ne: null, $ne: '' } });

        // Calculate conversion rate
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

        // Get source distribution
        const sourceStats = await Lead.aggregate([
            { $match: query },
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);

        // Get daily lead capture for chart
        const dailyStats = await Lead.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({
            stats: {
                total: totalLeads,
                new: newLeads,
                contacted: contactedLeads,
                qualified: qualifiedLeads,
                converted: convertedLeads,
                lost: lostLeads,
                withEmail: leadsWithEmail,
                withPhone: leadsWithPhone,
                withName: leadsWithName,
                conversionRate: parseFloat(conversionRate)
            },
            sourceDistribution: sourceStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            dailyCapture: dailyStats.map(item => ({
                date: item._id,
                count: item.count
            }))
        });
    } catch (error) {
        console.error('Error fetching lead stats:', error);
        res.status(500).json({ message: 'Server error while fetching lead stats' });
    }
};

// Get specific lead
export const getLeadById = async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({ message: 'Invalid Lead ID' });
        }

        const lead = await Lead.findById(leadId)
            .populate('botId', 'name icon')
            .populate('sessionId')
            .populate('assignedTo', 'name email');

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if user has access to this lead's bot
        const platform = await Platform.findOne({ userId });
        const hasAccess = platform && await BotConfig.findOne({ 
            _id: lead.botId._id, 
            platFormId: platform._id 
        });

        if (!hasAccess) {
            // Check team access
            const teamAccess = await Team.findOne({
                botId: lead.botId._id,
                'members.userId': userId,
                'members.status': 'active'
            });

            if (!teamAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.status(200).json({ lead });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ message: 'Server error while fetching lead' });
    }
};

// Create new lead manually
export const createLead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            botId, 
            name, 
            email, 
            phone, 
            company, 
            source = 'manual', 
            status = 'new',
            priority = 'medium',
            notes,
            tags
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        // Verify user has access to this bot
        const platform = await Platform.findOne({ userId });
        const hasAccess = platform && await BotConfig.findOne({ 
            _id: botId, 
            platFormId: platform._id 
        });

        if (!hasAccess) {
            const teamAccess = await Team.findOne({
                botId,
                'members.userId': userId,
                'members.status': 'active'
            });

            if (!teamAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // Create dummy session for manual leads
        const session = new Session({
            botId,
            title: `Manual Lead: ${name || email || 'Unknown'}`,
            lastMessage: 'Lead created manually',
            messages: [{
                role: 'system',
                content: 'Lead created manually by team member',
                timestamp: new Date()
            }],
            messageCount: 1,
            status: 'active'
        });
        await session.save();

        const lead = new Lead({
            botId,
            sessionId: session._id,
            name,
            email,
            phone,
            company,
            source,
            status,
            priority,
            notes,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            assignedTo: userId
        });

        // Calculate initial lead score
        lead.calculateLeadScore();
        await lead.save();

        await lead.populate('botId', 'name icon');
        await lead.populate('sessionId');
        await lead.populate('assignedTo', 'name email');

        res.status(201).json({ 
            message: 'Lead created successfully', 
            lead 
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ message: 'Server error while creating lead' });
    }
};

// Capture lead from chat session
export const captureLead = async (req, res) => {
    try {
        const { 
            sessionId, 
            botId, 
            name, 
            email, 
            phone, 
            company,
            metadata = {}
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Session ID or Bot ID' });
        }

        // Check if lead already exists for this session
        const existingLead = await Lead.findOne({ sessionId });
        if (existingLead) {
            // Update existing lead with new information
            if (name) existingLead.name = name;
            if (email) existingLead.email = email;
            if (phone) existingLead.phone = phone;
            if (company) existingLead.company = company;
            
            existingLead.calculateLeadScore();
            await existingLead.save();
            
            return res.status(200).json({ 
                message: 'Lead updated successfully', 
                lead: existingLead 
            });
        }

        // Get session data for conversation analysis
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Analyze conversation for lead scoring
        const conversationData = {
            totalMessages: session.messageCount || 0,
            lastMessage: session.lastMessage || '',
            sentiment: analyzeSentiment(session.messages || []),
            topics: extractTopics(session.messages || [])
        };

        const lead = new Lead({
            botId,
            sessionId,
            name,
            email,
            phone,
            company,
            source: 'website_chat',
            conversationData,
            metadata
        });

        // Calculate lead score
        lead.calculateLeadScore();
        await lead.save();

        await lead.populate('botId', 'name icon');
        await lead.populate('sessionId');

        res.status(201).json({ 
            message: 'Lead captured successfully', 
            lead 
        });
    } catch (error) {
        console.error('Error capturing lead:', error);
        res.status(500).json({ message: 'Server error while capturing lead' });
    }
};

// Update lead
export const updateLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({ message: 'Invalid Lead ID' });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check access permissions
        const hasAccess = await checkLeadAccess(userId, lead.botId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update fields
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && key !== '_id' && key !== 'botId' && key !== 'sessionId') {
                if (key === 'tags' && typeof updates[key] === 'string') {
                    lead[key] = updates[key].split(',').map(tag => tag.trim()).filter(tag => tag);
                } else {
                    lead[key] = updates[key];
                }
            }
        });

        // Update timestamps based on status changes
        if (updates.status === 'contacted' && lead.status !== 'contacted') {
            lead.lastContactedAt = new Date();
        }
        if (updates.status === 'converted' && lead.status !== 'converted') {
            lead.convertedAt = new Date();
        }

        // Recalculate lead score
        lead.calculateLeadScore();
        await lead.save();

        await lead.populate('botId', 'name icon');
        await lead.populate('sessionId');
        await lead.populate('assignedTo', 'name email');

        res.status(200).json({ 
            message: 'Lead updated successfully', 
            lead 
        });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ message: 'Server error while updating lead' });
    }
};

// Update lead status
export const updateLeadStatus = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { status, notes } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({ message: 'Invalid Lead ID' });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const hasAccess = await checkLeadAccess(userId, lead.botId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const oldStatus = lead.status;
        lead.status = status;
        
        if (notes) {
            lead.notes = notes;
        }

        // Update timestamps
        if (status === 'contacted' && oldStatus !== 'contacted') {
            lead.lastContactedAt = new Date();
        }
        if (status === 'converted' && oldStatus !== 'converted') {
            lead.convertedAt = new Date();
        }

        lead.calculateLeadScore();
        await lead.save();

        res.status(200).json({ 
            message: 'Lead status updated successfully', 
            lead 
        });
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({ message: 'Server error while updating lead status' });
    }
};

// Assign lead to team member
export const assignLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { assignedTo } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({ message: 'Invalid Lead ID' });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const hasAccess = await checkLeadAccess(userId, lead.botId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Verify assignee has access to the bot
        if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
            const assigneeAccess = await checkLeadAccess(assignedTo, lead.botId);
            if (!assigneeAccess) {
                return res.status(400).json({ message: 'Assignee does not have access to this bot' });
            }
        }

        lead.assignedTo = assignedTo || null;
        await lead.save();

        await lead.populate('assignedTo', 'name email');

        res.status(200).json({ 
            message: 'Lead assigned successfully', 
            lead 
        });
    } catch (error) {
        console.error('Error assigning lead:', error);
        res.status(500).json({ message: 'Server error while assigning lead' });
    }
};

// Bulk update leads
export const bulkUpdateLeads = async (req, res) => {
    try {
        const { leadIds, updates } = req.body;
        const userId = req.user.userId;

        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ message: 'Lead IDs array is required' });
        }

        // Verify all leads exist and user has access
        const leads = await Lead.find({ _id: { $in: leadIds } });
        
        for (const lead of leads) {
            const hasAccess = await checkLeadAccess(userId, lead.botId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied to one or more leads' });
            }
        }

        // Perform bulk update
        const updateData = {};
        if (updates.status) updateData.status = updates.status;
        if (updates.priority) updateData.priority = updates.priority;
        if (updates.assignedTo) updateData.assignedTo = updates.assignedTo;
        if (updates.tags) updateData.tags = updates.tags.split(',').map(tag => tag.trim());

        // Add timestamp updates
        if (updates.status === 'contacted') {
            updateData.lastContactedAt = new Date();
        }
        if (updates.status === 'converted') {
            updateData.convertedAt = new Date();
        }

        const result = await Lead.updateMany(
            { _id: { $in: leadIds } },
            { $set: updateData }
        );

        res.status(200).json({ 
            message: `${result.modifiedCount} leads updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk updating leads:', error);
        res.status(500).json({ message: 'Server error while updating leads' });
    }
};

// Delete lead
export const deleteLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({ message: 'Invalid Lead ID' });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const hasAccess = await checkLeadAccess(userId, lead.botId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Lead.findByIdAndDelete(leadId);

        res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: 'Server error while deleting lead' });
    }
};

// Export leads
export const exportLeads = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { leadIds, format = 'csv', filters = {} } = req.body;

        // Build query
        const platform = await Platform.findOne({ userId });
        let accessibleBotIds = [];

        if (platform) {
            const ownedBots = await BotConfig.find({ platFormId: platform._id }).select('_id');
            accessibleBotIds = ownedBots.map(bot => bot._id);
        }

        const teamMemberships = await Team.find({
            'members.userId': userId,
            'members.status': 'active'
        }).populate('botId');

        const teamBotIds = teamMemberships
            .filter(team => team.botId)
            .map(team => team.botId._id);

        accessibleBotIds = [...accessibleBotIds, ...teamBotIds];

        let query = { botId: { $in: accessibleBotIds } };

        // If specific leads are requested
        if (leadIds && leadIds.length > 0) {
            query._id = { $in: leadIds };
        }

        // Apply filters
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.dateFrom) query.capturedAt = { $gte: new Date(filters.dateFrom) };
        if (filters.dateTo) {
            query.capturedAt = { ...query.capturedAt, $lte: new Date(filters.dateTo) };
        }

        const leads = await Lead.find(query)
            .populate('botId', 'name')
            .populate('assignedTo', 'name email')
            .sort({ capturedAt: -1 });

        if (format === 'csv') {
            const csvData = generateCSV(leads);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=leads-${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csvData);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=leads-${new Date().toISOString().split('T')[0]}.json`);
            res.json(leads);
        }
    } catch (error) {
        console.error('Error exporting leads:', error);
        res.status(500).json({ message: 'Server error while exporting leads' });
    }
};

// Helper function to check lead access
const checkLeadAccess = async (userId, botId) => {
    try {
        // Check if user owns the bot
        const platform = await Platform.findOne({ userId });
        if (platform) {
            const ownedBot = await BotConfig.findOne({ 
                _id: botId, 
                platFormId: platform._id 
            });
            if (ownedBot) return true;
        }

        // Check if user is a team member
        const teamAccess = await Team.findOne({
            botId,
            'members.userId': userId,
            'members.status': 'active'
        });

        return !!teamAccess;
    } catch (error) {
        console.error('Error checking lead access:', error);
        return false;
    }
};

// Helper function to analyze sentiment
const analyzeSentiment = (messages) => {
    if (!messages || messages.length === 0) return 'neutral';
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'amazing', 'love', 'thank', 'thanks'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'problem', 'issue', 'broken', 'error'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    messages.forEach(message => {
        if (message.role === 'user') {
            const content = message.content.toLowerCase();
            positiveWords.forEach(word => {
                if (content.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (content.includes(word)) negativeCount++;
            });
        }
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
};

// Helper function to extract topics
const extractTopics = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const topics = ['billing', 'technical', 'account', 'product', 'support', 'pricing', 'feature'];
    const foundTopics = [];
    
    messages.forEach(message => {
        if (message.role === 'user') {
            const content = message.content.toLowerCase();
            topics.forEach(topic => {
                if (content.includes(topic) && !foundTopics.includes(topic)) {
                    foundTopics.push(topic);
                }
            });
        }
    });
    
    return foundTopics;
};

// Helper function to generate CSV
const generateCSV = (leads) => {
    const headers = [
        'Name', 'Email', 'Phone', 'Company', 'Status', 'Priority', 
        'Source', 'Lead Score', 'Captured At', 'Bot Name', 'Assigned To', 'Tags', 'Notes'
    ];
    
    const rows = leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.status,
        lead.priority,
        lead.source,
        lead.leadScore,
        new Date(lead.capturedAt).toLocaleDateString(),
        lead.botId?.name || '',
        lead.assignedTo?.name || '',
        lead.tags.join(', '),
        lead.notes || ''
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    return csvContent;
};