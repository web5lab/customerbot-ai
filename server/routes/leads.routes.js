import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadById,
    exportLeads,
    updateLeadStatus,
    assignLead,
    getLeadStats,
    bulkUpdateLeads,
    captureLead
} from '../controller/leads.controller.js';

const router = express.Router();

// Get all leads for user's bots
router.get('/', authenticateToken, getLeads);

// Get lead statistics
router.get('/stats', authenticateToken, getLeadStats);

// Get specific lead
router.get('/:leadId', authenticateToken, getLeadById);

// Create new lead
router.post('/', authenticateToken, createLead);

// Capture lead from chat (public endpoint)
router.post('/capture', captureLead);

// Update lead
router.put('/:leadId', authenticateToken, updateLead);

// Update lead status
router.put('/:leadId/status', authenticateToken, updateLeadStatus);

// Assign lead to team member
router.put('/:leadId/assign', authenticateToken, assignLead);

// Bulk update leads
router.put('/bulk/update', authenticateToken, bulkUpdateLeads);

// Delete lead
router.delete('/:leadId', authenticateToken, deleteLead);

// Export leads
router.post('/export', authenticateToken, exportLeads);

export default router;