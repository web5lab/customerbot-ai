import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  MoreHorizontal,
  ArrowUpDown,
  FileText,
  Star,
  Clock,
  Tag,
  ExternalLink,
  Trash2,
  Edit3,
  Plus,
  UserPlus,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { activeBotSelector, botsSelector } from '../store/global.Selctor';
import { getLeads, getLeadStats, updateLead, deleteLead, createLead, exportLeads } from '../store/global.Action';
import { CreateLeadModal } from '../components/CreateLeadModal';
import { EditLeadModal } from '../components/EditLeadModal';
import toast from 'react-hot-toast';

const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  converted: 'bg-green-100 text-green-800 border-green-200',
  lost: 'bg-red-100 text-red-800 border-red-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

export function Leads() {
  const activeBot = useSelector(activeBotSelector);
  const bots = useSelector(botsSelector);
  const dispatch = useDispatch();
  
  const [leads, setLeads] = useState([]);
  const [leadStats, setLeadStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('capturedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedBotFilter, setSelectedBotFilter] = useState('all');

  // Fetch leads and stats
  useEffect(() => {
    fetchLeads();
    fetchLeadStats();
  }, [activeBot, selectedBotFilter, statusFilter, priorityFilter, searchQuery, sortBy, sortOrder]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedBotFilter !== 'all') params.append('botId', selectedBotFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await dispatch(getLeads(params.toString())).unwrap();
      setLeads(response.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBotFilter !== 'all') params.append('botId', selectedBotFilter);
      
      const response = await dispatch(getLeadStats(params.toString())).unwrap();
      setLeadStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching lead stats:', error);
    }
  };

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = 
        (lead.name && lead.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchesBot = selectedBotFilter === 'all' || lead.botId === selectedBotFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesBot;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'capturedAt' || sortBy === 'lastContact') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const handleExport = async (format) => {
    try {
      const selectedLeadIds = Array.from(selectedLeads);
      const exportData = {
        leadIds: selectedLeadIds.length > 0 ? selectedLeadIds : undefined,
        format,
        filters: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined
        }
      };
      
      await dispatch(exportLeads(exportData)).unwrap();
      toast.success(`Leads exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads');
    }
  };

  const handleCreateLead = async (leadData) => {
    try {
      await dispatch(createLead(leadData)).unwrap();
      toast.success('Lead created successfully');
      setShowCreateModal(false);
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    }
  };

  const handleUpdateLead = async (leadId, updates) => {
    try {
      await dispatch(updateLead({ leadId, updates })).unwrap();
      toast.success('Lead updated successfully');
      setShowEditModal(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await dispatch(deleteLead(leadId)).unwrap();
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await dispatch(updateLead({ 
        leadId, 
        updates: { status: newStatus } 
      })).unwrap();
      toast.success('Lead status updated');
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'website_chat': return <MessageSquare className="w-4 h-4" />;
      case 'mobile_app': return <Phone className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Modals */}
          {showCreateModal && (
            <CreateLeadModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateLead}
              bots={bots}
            />
          )}

          {showEditModal && editingLead && (
            <EditLeadModal
              lead={editingLead}
              onClose={() => {
                setShowEditModal(false);
                setEditingLead(null);
              }}
              onSubmit={(updates) => handleUpdateLead(editingLead._id, updates)}
              bots={bots}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-gray-600">
                  {loading ? 'Loading...' : `${leads.length} leads captured`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mr-3"
                >
                  <Plus className="w-4 h-4" />
                  New Lead
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2">
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-gray-400" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{leadStats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-5 h-5 text-gray-400" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-blue-600">{leadStats.new || 0}</div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{leadStats.contacted || 0}</div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-gray-400" />
              <CheckCircle className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{leadStats.qualified || 0}</div>
            <div className="text-sm text-gray-600">Qualified</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-gray-400" />
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{leadStats.converted || 0}</div>
            <div className="text-sm text-gray-600">Converted</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Bot Filter */}
            <div className="flex-1">
              <select
                value={selectedBotFilter}
                onChange={(e) => setSelectedBotFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Bots</option>
                {bots.map((bot) => (
                  <option key={bot._id} value={bot._id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              {/* Sort Filter */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="capturedAt-desc">Newest First</option>
                <option value="capturedAt-asc">Oldest First</option>
                <option value="leadScore-desc">Highest Score</option>
                <option value="leadScore-asc">Lowest Score</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Export Selected
                  </button>
                  <button
                    onClick={() => setSelectedLeads(new Set())}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leads Table */}
        <div className="bg-white border mb-3 border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading leads...</span>
              </div>
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Captured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          {getSourceIcon(lead.source)}
                        </div>
                        <div>
                          {lead.name && (
                            <div className="font-medium text-gray-900">{lead.name}</div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${lead.email}`} className="hover:text-gray-600">
                                {lead.email}
                              </a>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a href={`tel:${lead.phone}`} className="hover:text-gray-600">
                                {lead.phone}
                              </a>
                            </div>
                          )}
                          {lead.company && (
                            <div className="text-sm text-gray-600">{lead.company}</div>
                          )}
                          {!lead.name && !lead.email && (
                            <div className="text-sm text-gray-500 italic">No contact info</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadScoreColor(lead.leadScore || 50)}`}>
                          {lead.leadScore || 50}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${lead.leadScore || 50}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[lead.priority || 'medium']}`}>
                        {(lead.priority || 'medium').charAt(0).toUpperCase() + (lead.priority || 'medium').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[lead.status]} bg-transparent cursor-pointer`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(lead.source)}
                        <span className="text-sm text-gray-900 capitalize">
                          {lead.source.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(lead.capturedAt)}</div>
                      <div className="text-xs text-gray-500">
                        {lead.sessionId?.title || `Session ${lead.sessionId?._id?.slice(-6)}`}
                      </div>
                      {lead.assignedTo && (
                        <div className="text-xs text-blue-600 mt-1">
                          Assigned to {lead.assignedTo.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit lead"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/chat?id=${lead.botId._id}&session=${lead.sessionId._id}`, '_blank')}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View conversation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* Empty State */}
          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'No leads found' 
                  : 'No leads yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Leads will appear here when visitors provide their contact information'}
              </p>
              {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="text-gray-900 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lead Details Panel */}
        {filteredLeads.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Contact Data</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">With Email</span>
                    <span className="text-sm font-medium text-gray-900">{leadStats.withEmail || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">With Name</span>
                    <span className="text-sm font-medium text-gray-900">{leadStats.withName || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">With Phone</span>
                    <span className="text-sm font-medium text-gray-900">{leadStats.withPhone || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Conversion Rate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-sm font-medium text-green-600">{leadStats.conversionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Month</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Lead Sources</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Website Chat</span>
                    <span className="text-sm font-medium text-gray-900">
                      {leadStats.total > 0 ? Math.round((leads.filter(l => l.source === 'website_chat').length / leadStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mobile App</span>
                    <span className="text-sm font-medium text-gray-900">
                      {leadStats.total > 0 ? Math.round((leads.filter(l => l.source === 'mobile_app').length / leadStats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}