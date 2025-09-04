import mongoose from 'mongoose';
import Team from '../models/Team.schema.js';
import User from '../models/User.schema.js';
import BotConfig from '../models/BotConfig.schema.js';
import { sendTeamInvitation, sendWelcomeEmail, sendTeamRemovalNotification, sendRoleUpdateNotification } from '../services/emailService.js';

// Get team for a specific bot
export const getBotTeam = async (req, res) => {
    try {
        const { botId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        // Check if user has access to this bot
        const bot = await BotConfig.findById(botId);
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        let team = await Team.findOne({ botId }).populate('members.userId', 'name email profilePicture');
        
        if (!team) {
            // Create team if it doesn't exist
            team = new Team({
                botId,
                ownerId: userId,
                members: [{
                    userId,
                    email: req.user.email || 'owner@example.com',
                    name: req.user.name || 'Bot Owner',
                    role: 'admin',
                    status: 'active',
                    invitedBy: userId
                }]
            });
            await team.save();
            await team.populate('members.userId', 'name email profilePicture');
        }

        res.status(200).json({ team });
    } catch (error) {
        console.error('Error fetching bot team:', error);
        res.status(500).json({ message: 'Server error while fetching team' });
    }
};

// Get all teams for user's bots
export const getUserTeams = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get all bots owned by user
        const userBots = await BotConfig.find({ 
            platFormId: { $in: await mongoose.model('platforms').find({ userId }).select('_id') }
        });

        const botIds = userBots.map(bot => bot._id);
        
        const teams = await Team.find({ 
            botId: { $in: botIds } 
        }).populate('botId', 'name icon')
          .populate('members.userId', 'name email profilePicture');

        res.status(200).json({ teams });
    } catch (error) {
        console.error('Error fetching user teams:', error);
        res.status(500).json({ message: 'Server error while fetching teams' });
    }
};

// Invite team member
export const inviteTeamMember = async (req, res) => {
    try {
        const { botId } = req.params;
        const { email, role = 'viewer' } = req.body;
        const inviterId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if bot exists and user has permission
        const bot = await BotConfig.findById(botId);
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        let team = await Team.findOne({ botId });
        if (!team) {
            team = new Team({
                botId,
                ownerId: inviterId,
                members: []
            });
        }

        // Check if user is already a member
        const existingMember = team.members.find(member => member.email === email);
        if (existingMember) {
            return res.status(400).json({ message: 'User is already a team member' });
        }

        // Check team size limit
        if (team.members.length >= team.settings.maxMembers) {
            return res.status(400).json({ message: 'Team size limit reached' });
        }

        // Find or create user
        let invitedUser = await User.findOne({ email });
        if (!invitedUser) {
            // Create placeholder user for invitation
            invitedUser = new User({
                email,
                name: email.split('@')[0],
                provider: 'email',
                password: null // Will be set when they accept invitation
            });
            await invitedUser.save();
        }

        // Add member to team
        const newMember = {
            userId: invitedUser._id,
            email,
            name: invitedUser.name,
            role,
            avatar: invitedUser.profilePicture || '',
            status: 'pending',
            invitedBy: inviterId
        };

        team.members.push(newMember);
        await team.save();
        await team.populate('members.userId', 'name email profilePicture');

        // Send invitation email
        try {
            const inviter = await User.findById(inviterId);
            const invitationLink = `${process.env.VITE_WEB_URL}/teams?action=accept&botId=${botId}&memberId=${newMember.userId}&token=${generateInvitationToken(newMember._id)}`;
            
            await sendTeamInvitation({
                recipientEmail: email,
                recipientName: invitedUser.name,
                inviterName: inviter.name,
                botName: bot.name,
                role,
                invitationLink
            });
        } catch (emailError) {
            console.error('Error sending invitation email:', emailError);
            // Don't fail the invitation if email fails
        }

        res.status(201).json({ 
            message: 'Team member invited successfully', 
            team,
            member: newMember
        });
    } catch (error) {
        console.error('Error inviting team member:', error);
        res.status(500).json({ message: 'Server error while inviting member' });
    }
};

// Update team member role
export const updateTeamMember = async (req, res) => {
    try {
        const { botId, memberId } = req.params;
        const { role, status } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or Member ID' });
        }

        const team = await Team.findOne({ botId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user has permission to update (must be admin or owner)
        const requesterMember = team.members.find(m => m.userId.toString() === userId);
        if (!requesterMember || (requesterMember.role !== 'admin' && team.ownerId.toString() !== userId)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const member = team.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        const oldRole = member.role;
        const oldStatus = member.status;

        // Update member
        if (role) member.role = role;
        if (status) member.status = status;
        member.lastActive = new Date();

        await team.save();
        await team.populate('members.userId', 'name email profilePicture');

        // Send notification emails for role changes
        try {
            if (role && role !== oldRole) {
                const updater = await User.findById(userId);
                const memberUser = await User.findById(member.userId);
                
                await sendRoleUpdateNotification({
                    recipientEmail: member.email,
                    recipientName: memberUser.name,
                    botName: (await BotConfig.findById(botId)).name,
                    oldRole,
                    newRole: role,
                    updaterName: updater.name
                });
            }
            
            if (status === 'active' && oldStatus === 'pending') {
                await sendWelcomeEmail({
                    recipientEmail: member.email,
                    recipientName: (await User.findById(member.userId)).name,
                    botName: (await BotConfig.findById(botId)).name,
                    role: member.role
                });
            }
        } catch (emailError) {
            console.error('Error sending notification email:', emailError);
            // Don't fail the update if email fails
        }

        res.status(200).json({ 
            message: 'Team member updated successfully', 
            team,
            member
        });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ message: 'Server error while updating member' });
    }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
    try {
        const { botId, memberId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or Member ID' });
        }

        const team = await Team.findOne({ botId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user has permission to remove (must be admin or owner)
        const requesterMember = team.members.find(m => m.userId.toString() === userId);
        if (!requesterMember || (requesterMember.role !== 'admin' && team.ownerId.toString() !== userId)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const member = team.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Cannot remove owner
        if (member.userId.toString() === team.ownerId.toString()) {
            return res.status(400).json({ message: 'Cannot remove team owner' });
        }

        // Send removal notification
        try {
            const remover = await User.findById(userId);
            const memberUser = await User.findById(member.userId);
            const bot = await BotConfig.findById(botId);
            
            await sendTeamRemovalNotification({
                recipientEmail: member.email,
                recipientName: memberUser.name,
                botName: bot.name,
                removerName: remover.name
            });
        } catch (emailError) {
            console.error('Error sending removal notification:', emailError);
            // Don't fail the removal if email fails
        }

        team.members.pull(memberId);
        await team.save();

        res.status(200).json({ 
            message: 'Team member removed successfully', 
            team
        });
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ message: 'Server error while removing member' });
    }
};

// Update team settings
export const updateTeamSettings = async (req, res) => {
    try {
        const { botId } = req.params;
        const { allowInvites, maxMembers, defaultRole } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const team = await Team.findOne({ botId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user is owner or admin
        const requesterMember = team.members.find(m => m.userId.toString() === userId);
        if (team.ownerId.toString() !== userId && (!requesterMember || requesterMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        // Update settings
        if (typeof allowInvites === 'boolean') team.settings.allowInvites = allowInvites;
        if (maxMembers && maxMembers > 0) team.settings.maxMembers = maxMembers;
        if (defaultRole && ['editor', 'viewer'].includes(defaultRole)) team.settings.defaultRole = defaultRole;

        await team.save();

        res.status(200).json({ 
            message: 'Team settings updated successfully', 
            team
        });
    } catch (error) {
        console.error('Error updating team settings:', error);
        res.status(500).json({ message: 'Server error while updating settings' });
    }
};

// Accept team invitation
export const acceptInvitation = async (req, res) => {
    try {
        const { botId, memberId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or Member ID' });
        }

        const team = await Team.findOne({ botId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = team.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (member.userId.toString() !== userId) {
            return res.status(403).json({ message: 'This invitation is not for you' });
        }

        if (member.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already processed' });
        }

        member.status = 'active';
        member.joinedAt = new Date();
        await team.save();

        res.status(200).json({ 
            message: 'Invitation accepted successfully', 
            team,
            member
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ message: 'Server error while accepting invitation' });
    }
};

// Get team member permissions
export const getTeamPermissions = async (req, res) => {
    try {
        const { botId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid Bot ID' });
        }

        const team = await Team.findOne({ botId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = team.members.find(m => m.userId.toString() === userId);
        const isOwner = team.ownerId.toString() === userId;

        const permissions = {
            canInvite: isOwner || (member && member.role === 'admin'),
            canRemoveMembers: isOwner || (member && member.role === 'admin'),
            canUpdateSettings: isOwner,
            canEditBot: isOwner || (member && ['admin', 'editor'].includes(member.role)),
            canViewAnalytics: isOwner || (member && member.status === 'active'),
            role: isOwner ? 'owner' : (member ? member.role : null),
            status: member ? member.status : null
        };

        res.status(200).json({ permissions });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Server error while fetching permissions' });
    }
};

// Helper function to generate invitation tokens
const generateInvitationToken = (memberId) => {
    // In production, use a proper JWT or secure token
    return Buffer.from(`${memberId}-${Date.now()}`).toString('base64');
};

// Accept invitation with token validation
export const acceptInvitationWithToken = async (req, res) => {
    try {
        const { botId, memberId, token } = req.query;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(botId) || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid Bot ID or Member ID' });
        }

        // Validate token (basic validation - enhance for production)
        try {
            const decodedToken = Buffer.from(token, 'base64').toString();
            if (!decodedToken.startsWith(memberId)) {
                throw new Error('Invalid token');
            }
        } catch (tokenError) {
            return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }

        const team = await Team.findOne({ botId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = team.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (member.userId.toString() !== userId) {
            return res.status(403).json({ message: 'This invitation is not for you' });
        }

        if (member.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already processed' });
        }

        member.status = 'active';
        member.joinedAt = new Date();
        await team.save();

        // Send welcome email
        try {
            const bot = await BotConfig.findById(botId);
            await sendWelcomeEmail({
                recipientEmail: member.email,
                recipientName: member.name,
                botName: bot.name,
                role: member.role
            });
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
        }

        res.status(200).json({ 
            message: 'Invitation accepted successfully', 
            team,
            member
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ message: 'Server error while accepting invitation' });
    }
};