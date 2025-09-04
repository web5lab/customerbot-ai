import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getBotTeam,
    getUserTeams,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    updateTeamSettings,
    acceptInvitation,
    getTeamPermissions,
    acceptInvitationWithToken
} from '../controller/team.controller.js';

const router = express.Router();

// Get team for specific bot
router.get('/bot/:botId', authenticateToken, getBotTeam);

// Get all teams for user's bots
router.get('/user-teams', authenticateToken, getUserTeams);

// Invite team member
router.post('/bot/:botId/invite', authenticateToken, inviteTeamMember);

// Update team member
router.put('/bot/:botId/member/:memberId', authenticateToken, updateTeamMember);

// Remove team member
router.delete('/bot/:botId/member/:memberId', authenticateToken, removeTeamMember);

// Update team settings
router.put('/bot/:botId/settings', authenticateToken, updateTeamSettings);

// Accept invitation
router.post('/bot/:botId/accept/:memberId', authenticateToken, acceptInvitation);

// Accept invitation with token (for email links)
router.get('/accept-invitation', authenticateToken, acceptInvitationWithToken);

// Get team permissions for current user
router.get('/bot/:botId/permissions', authenticateToken, getTeamPermissions);

// Accept or decline invitation
router.post('/invitation/:invitationId/respond', authenticateToken, respondToInvitation);
export default router;