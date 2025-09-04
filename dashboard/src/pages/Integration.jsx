import { useState, useEffect } from 'react';
import { useBot } from '../contexts/BotContext';
import {
  Zap, Plus, X, ChevronRight, ChevronDown,
  Code, Cpu, Database, Server, Webhook, Terminal,
  GitBranch, GitPullRequest, Shield, Key, RefreshCw,
  Link, Settings, TestTube2, Layers, Network, Save, Copy
} from 'lucide-react';

const API_TOOLS = [
  {
    id: 'rest-api',
    name: 'REST API',
    icon: Server,
    category: 'core',
    color: 'bg-blue-100 text-blue-600',
    description: 'Connect to RESTful API endpoints',
    apiDescription: `This component connects to REST APIs. Configure the base URL and endpoints.
    Available methods: GET, POST, PUT, PATCH, DELETE.
    Supports authentication: API Key, Bearer Token, OAuth2, Basic Auth.
    Example usage: Fetch user data, Submit forms, Update records`
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    icon: GitBranch,
    category: 'core',
    color: 'bg-purple-100 text-purple-600',
    description: 'Query GraphQL APIs with flexible requests',
    apiDescription: `This component connects to GraphQL endpoints.
    Configure the GraphQL endpoint URL and default query.
    Supports headers for authentication.
    Example usage: Query nested data, Mutate records, Real-time subscriptions`
  },
];

const TEMPLATES = [
  {
    name: 'User Profile API',
    description: 'Complete workflow for user profile management',
    tools: [
      {
        id: 'rest-api',
        config: {
          baseUrl: 'https://api.example.com/users',
          endpoints: [
            { path: '/profile', method: 'GET' },
            { path: '/update', method: 'POST' }
          ],
          authType: 'Bearer Token'
        }
      }
    ]
  },
  {
    name: 'E-commerce Integration',
    description: 'Product catalog and order processing',
    tools: [
      {
        id: 'rest-api',
        config: {
          baseUrl: 'https://api.store.com/v1',
          endpoints: [
            { path: '/products', method: 'GET' },
            { path: '/orders', method: 'POST' }
          ],
          authType: 'API Key'
        }
      }
    ]
  }
];

const TOOL_CONFIGS = {
  'rest-api': {
    fields: [
      { name: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com/v1', required: true },
      {
        name: 'endpoints', label: 'Endpoints', type: 'array', fields: [
          { name: 'path', label: 'Path', type: 'text', placeholder: '/users' },
          { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        ]
      },
      { name: 'authType', label: 'Authentication', type: 'select', options: ['None', 'API Key', 'Bearer Token', 'OAuth2', 'Basic Auth'] },
      {
        name: 'authConfig',
        label: 'Authentication Configuration',
        type: 'conditional',
        condition: (config) => config.authType && config.authType !== 'None',
        fields: {
          'API Key': [
            { name: 'keyName', label: 'Key Name', type: 'text', placeholder: 'X-API-Key' },
            { name: 'keyValue', label: 'Key Value', type: 'password', placeholder: 'Your API key' },
            { name: 'location', label: 'Location', type: 'select', options: ['Header', 'Query Param'] }
          ],
          'Bearer Token': [
            { name: 'token', label: 'Token', type: 'password', placeholder: 'Bearer token' }
          ],
          'Basic Auth': [
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'password', label: 'Password', type: 'password' }
          ],
          'OAuth2': [
            { name: 'clientId', label: 'Client ID', type: 'text' },
            { name: 'clientSecret', label: 'Client Secret', type: 'password' },
            { name: 'tokenUrl', label: 'Token URL', type: 'text', placeholder: 'https://api.example.com/oauth/token' },
            { name: 'scopes', label: 'Scopes', type: 'text', placeholder: 'read write' }
          ]
        }
      },
      { name: 'headers', label: 'Custom Headers', type: 'keyvalue' }
    ]
  },
  'graphql': {
    fields: [
      { name: 'url', label: 'GraphQL Endpoint', type: 'text', placeholder: 'https://api.example.com/graphql', required: true },
      { name: 'query', label: 'Default Query', type: 'textarea', placeholder: 'query { users { id name } }' },
      { name: 'headers', label: 'Headers', type: 'keyvalue' },
      { name: 'authType', label: 'Authentication', type: 'select', options: ['None', 'Bearer Token', 'API Key'] },
      {
        name: 'authConfig',
        label: 'Authentication Configuration',
        type: 'conditional',
        condition: (config) => config.authType && config.authType !== 'None',
        fields: {
          'API Key': [
            { name: 'keyName', label: 'Key Name', type: 'text', placeholder: 'X-API-Key' },
            { name: 'keyValue', label: 'Key Value', type: 'password', placeholder: 'Your API key' }
          ],
          'Bearer Token': [
            { name: 'token', label: 'Token', type: 'password', placeholder: 'Bearer token' }
          ]
        }
      }
    ]
  },
};

export function ApiWorkflowBuilder() {
  const { selectedBot, updateBot } = useBot();
  const [activeConfig, setActiveConfig] = useState(null);
  const [tools, setTools] = useState([]);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    security: true,
    processing: true,
    resilience: true,
    observability: true,
    development: true
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [logs, setLogs] = useState({});
  const [testResults, setTestResults] = useState({});

  // Load saved configuration when bot changes
  useEffect(() => {
    if (selectedBot?.apiWorkflow) {
      setTools(selectedBot.apiWorkflow.tools || []);
    }
  }, [selectedBot]);

  const addTool = (tool) => {
    const newTool = {
      ...tool,
      configId: `${tool.id}-${Date.now()}`,
      config: {}
    };
    setTools([...tools, newTool]);
    setActiveConfig(newTool.configId);
    setShowToolPicker(false);
    setSearchTerm('');
  };

  const removeTool = (configId) => {
    setTools(tools.filter(tool => tool.configId !== configId));
    if (activeConfig === configId) {
      setActiveConfig(null);
    }
  };

  const updateToolConfig = (configId, field, value) => {
    setTools(tools.map(tool => {
      if (tool.configId === configId) {
        return {
          ...tool,
          config: {
            ...tool.config,
            [field]: value
          }
        };
      }
      return tool;
    }));
  };

  const saveWorkflow = () => {
    if (!selectedBot) return;

    const updatedBot = {
      ...selectedBot,
      apiWorkflow: {
        tools,
        lastSaved: new Date().toISOString()
      }
    };

    updateBot(selectedBot.id, updatedBot);
  };

  const applyTemplate = (template) => {
    const newTools = template.tools.map(tool => ({
      ...API_TOOLS.find(t => t.id === tool.id),
      configId: `${tool.id}-${Date.now()}`,
      config: tool.config
    }));

    setTools(newTools);
    setShowTemplates(false);
    if (newTools.length > 0) {
      setActiveConfig(newTools[0].configId);
    }
  };

  const testApiConnection = async (tool) => {
    const logId = `${tool.configId}-${Date.now()}`;
    const startTime = new Date();

    // Add log entry
    const newLog = {
      id: logId,
      toolId: tool.configId,
      timestamp: startTime.toISOString(),
      action: 'Test Connection',
      status: 'pending',
      details: 'Initializing test...'
    };

    setLogs(prev => ({
      ...prev,
      [logId]: newLog
    }));

    try {
      // Simulate API test (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update log with success
      const endTime = new Date();
      const duration = endTime - startTime;

      setLogs(prev => ({
        ...prev,
        [logId]: {
          ...prev[logId],
          status: 'success',
          details: `Connection successful (${duration}ms)`,
          response: { status: '200 OK' }
        }
      }));

      // Update test results
      setTestResults(prev => ({
        ...prev,
        [tool.configId]: {
          lastTested: endTime.toISOString(),
          status: 'success'
        }
      }));

      return true;
    } catch (error) {
      // Update log with error
      setLogs(prev => ({
        ...prev,
        [logId]: {
          ...prev[logId],
          status: 'error',
          details: error.message,
          error
        }
      }));

      // Update test results
      setTestResults(prev => ({
        ...prev,
        [tool.configId]: {
          lastTested: new Date().toISOString(),
          status: 'error',
          error: error.message
        }
      }));

      return false;
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredTools = API_TOOLS.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toolsByCategory = API_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const moveTool = (fromIndex, toIndex) => {
    const newTools = [...tools];
    const [removed] = newTools.splice(fromIndex, 1);
    newTools.splice(toIndex, 0, removed);
    setTools(newTools);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <Code className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Integration</h1>
              <p className="text-gray-600">Design and connect API workflows</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        {selectedBot && (
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedBot.name}</h2>
              <p className="text-sm text-gray-600">API Workflow</p>
            </div>
          </div>
        )}
      </div>

      {selectedBot && (
        <div className="flex flex-1 gap-6 h-full">
          {/* Tools Palette */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
                  <Layers className="w-5 h-5 text-gray-600" />
                  API Components
                </h2>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Templates
                </button>
              </div>

              {showTemplates && (
                <div className="mb-4 bg-gray-100 rounded-lg p-3 border border-gray-200">
                  <h3 className="font-medium text-sm mb-2 text-gray-900">Workflow Templates</h3>
                  <div className="space-y-2">
                    {TEMPLATES.map((template, index) => (
                      <div
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="p-2 text-sm bg-white rounded border border-gray-200 hover:border-gray-300 cursor-pointer"
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  onFocus={() => setShowToolPicker(true)}
                />
                <Code className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              {showToolPicker && searchTerm && (
                <div className="absolute z-10 mt-14 w-80 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredTools.length > 0 ? (
                      filteredTools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => addTool(tool)}
                          className="w-full text-left p-3 hover:bg-gray-100 flex items-center gap-3"
                        >
                          <tool.icon className="w-5 h-5 flex-shrink-0 text-gray-600" />
                          <div>
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.description}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No matching components found</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                  <div key={category} className="mb-3">
                    <button
                      onClick={() => toggleSection(category)}
                      className="w-full flex items-center justify-between py-2 px-1 text-gray-700 hover:text-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{category}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {categoryTools.length}
                        </span>
                      </div>
                      {expandedSections[category] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {expandedSections[category] && (
                      <div className="space-y-2 mt-2">
                        {categoryTools.map(tool => (
                          <div
                            key={tool.id}
                            onClick={() => addTool(tool)}
                            className="p-3 rounded-lg border border-gray-200 cursor-pointer flex items-center gap-3 text-sm hover:bg-gray-100"
                          >
                            <tool.icon className="w-4 h-4 flex-shrink-0 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{tool.name}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{tool.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Canvas */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
                  <GitPullRequest className="w-5 h-5 text-gray-600" />
                  API Workflow Canvas
                </h2>

                <div className="flex items-center gap-3">
                  {tools.length > 0 && (
                    <button
                      onClick={saveWorkflow}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save Workflow
                    </button>
                  )}
                  <div className="text-sm text-gray-500">
                    {selectedBot.apiWorkflow?.lastSaved ? `Last saved: ${new Date(selectedBot.apiWorkflow.lastSaved).toLocaleString()}` : 'Not saved yet'}
                  </div>
                </div>
              </div>

              {tools.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool, index) => (
                      <ApiWorkflowBlock
                        key={tool.configId}
                        tool={tool}
                        isActive={activeConfig === tool.configId}
                        onRemove={() => removeTool(tool.configId)}
                        onSelect={() => setActiveConfig(tool.configId)}
                        onMoveUp={index > 0 ? () => moveTool(index, index - 1) : null}
                        onMoveDown={index < tools.length - 1 ? () => moveTool(index, index + 1) : null}
                        testStatus={testResults[tool.configId]?.status}
                      />
                    ))}
                  </div>

                  <div className="mt-8">
                    <button
                      className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowToolPicker(true)}
                    >
                      <Plus className="w-5 h-5 text-gray-400" />
                      <span>Add API component</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-center py-8 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border border-gray-200">
                      <Link className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Empty API Workflow</h3>
                    <p className="text-gray-500 mb-6">
                      Start building your API integration workflow by selecting components from the left panel.
                      Begin with a REST API or Webhook component.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setShowToolPicker(true)}
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Component
                      </button>
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg border border-gray-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Configuration Panel */}
            {activeConfig && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <ApiToolConfiguration
                  tool={tools.find(t => t.configId === activeConfig)}
                  onUpdate={updateToolConfig}
                  onTest={testApiConnection}
                  logs={Object.values(logs).filter(log => log.toolId === activeConfig)}
                />
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function ApiWorkflowBlock({ tool, isActive, onRemove, onSelect, onMoveUp, onMoveDown, testStatus }) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${isActive ? 'border-indigo-400 shadow-md' : 'border-gray-200'} ${tool.color} flex flex-col cursor-pointer transition-all hover:shadow-md h-full`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <tool.icon className="w-5 h-5" />
          <h3 className="font-medium">{tool.name}</h3>
          {testStatus && (
            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${testStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {testStatus}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-500 hover:text-red-500 p-1 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-gray-600 mb-4 line-clamp-2">
        {tool.description}
      </div>
      <div className="mt-auto pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          {onMoveUp && (
            <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="hover:text-indigo-600">
              Move Up
            </button>
          )}
          {onMoveDown && (
            <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="hover:text-indigo-600">
              Move Down
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ApiToolConfiguration({ tool, onUpdate, onTest, logs }) {
  const configTemplate = TOOL_CONFIGS[tool.id] || { fields: [] };
  const [activeTab, setActiveTab] = useState('configuration');
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={tool.config[field.name] || ''}
            onChange={(e) => onUpdate(tool.configId, field.name, e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={tool.config[field.name] || ''}
            onChange={(e) => onUpdate(tool.configId, field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={4}
            className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30"
          />
        );
      case 'keyvalue':
        return (
          <KeyValueEditor
            values={tool.config[field.name] || {}}
            onChange={(values) => onUpdate(tool.configId, field.name, values)}
          />
        );
      case 'array':
        return (
          <ArrayEditor
            items={tool.config[field.name] || []}
            fields={field.fields}
            onChange={(items) => onUpdate(tool.configId, field.name, items)}
          />
        );
      case 'conditional':
        if (!field.condition(tool.config)) return null;
        return (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-sm">{field.label}</h4>
            {field.fields[tool.config.authType]?.map(subField => (
              <div key={subField.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {subField.label}
                  {subField.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(subField)}
              </div>
            ))}
          </div>
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            value={tool.config[field.name] || ''}
            onChange={(e) => onUpdate(tool.configId, field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30"
          />
        );
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    const success = await onTest(tool);
    setIsTesting(false);
    if (success) {
      setActiveTab('logs');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <tool.icon className="w-5 h-5" />
          {tool.name} Configuration
        </h3>

        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'configuration' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('configuration')}
          >
            Configuration
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'testing' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('testing')}
          >
            Testing
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'logs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('logs')}
          >
            Logs ({logs.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'api-docs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('api-docs')}
          >
            API Docs
          </button>
        </div>
      </div>

      {activeTab === 'configuration' && (
        <div className="space-y-4">
          {configTemplate.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">Test {tool.name}</h4>
            <p className="text-sm text-gray-500 mb-4">Test the API connection with current configuration</p>

            <button
              onClick={handleTest}
              disabled={isTesting}
              className={`flex items-center gap-2 ${isTesting ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-2 px-4 rounded-lg transition-colors`}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube2 className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          </div>

          {testResponse && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2">Test Results</h4>
              <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{log.action}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{new Date(log.timestamp).toLocaleString()}</div>
                <div className="text-sm">{log.details}</div>
                {log.response && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer">Show Response</summary>
                      <pre className="bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <p className="text-sm text-gray-500">No activity yet. Test the connection to see logs.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'api-docs' && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3">API Documentation</h4>
          <div className="prose prose-sm max-w-none">
            <p>{tool.apiDescription}</p>

            {tool.id === 'rest-api' && (
              <>
                <h5>Authentication Methods</h5>
                <ul>
                  <li><strong>API Key:</strong> Add to headers or query parameters</li>
                  <li><strong>Bearer Token:</strong> Include in Authorization header</li>
                  <li><strong>OAuth2:</strong> Configure client credentials and token URL</li>
                  <li><strong>Basic Auth:</strong> Provide username and password</li>
                </ul>

                <h5>Example Configuration</h5>
                <pre className="bg-white p-3 rounded border overflow-x-auto">
                  {`{
  "baseUrl": "https://api.example.com/v1",
  "endpoints": [
    { "path": "/users", "method": "GET" },
    { "path": "/users", "method": "POST" }
  ],
  "authType": "Bearer Token",
  "authConfig": {
    "token": "your_access_token_here"
  }
}`}</pre>
              </>
            )}

            {tool.id === 'graphql' && (
              <>
                <h5>Example Query</h5>
                <pre className="bg-white p-3 rounded border overflow-x-auto">
                  {`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      title
      content
    }
  }
}`}</pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KeyValueEditor({ values, onChange }) {
  const [items, setItems] = useState(Object.entries(values).map(([key, value]) => ({ key, value })));

  useEffect(() => {
    const newValues = items.reduce((acc, item) => {
      if (item.key) acc[item.key] = item.value;
      return acc;
    }, {});
    onChange(newValues);
  }, [items, onChange]);

  const addItem = () => {
    setItems([...items, { key: '', value: '' }]);
  };

  const updateItem = (index, field, newValue) => {
    const newItems = [...items];
    newItems[index][field] = newValue;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item.key}
            onChange={(e) => updateItem(index, 'key', e.target.value)}
            placeholder="Key"
            className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => updateItem(index, 'value', e.target.value)}
            placeholder="Value"
            className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            onClick={() => removeItem(index)}
            className="p-2 text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-2"
      >
        <Plus className="w-4 h-4" />
        Add Key-Value Pair
      </button>
    </div>
  );
}

function ArrayEditor({ items, fields, onChange }) {
  const [localItems, setLocalItems] = useState(items.length > 0 ? items : [{}]);

  useEffect(() => {
    onChange(localItems);
  }, [localItems, onChange]);

  const addItem = () => {
    setLocalItems([...localItems, {}]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...localItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLocalItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
  };

  return (
    <div className="space-y-4">
      {localItems.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">Item {index + 1}</h4>
            <button
              onClick={() => removeItem(index)}
              className="p-1 text-gray-500 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={item[field.name] || ''}
                    onChange={(e) => updateItem(index, field.name, e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 text-sm"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={item[field.name] || ''}
                    onChange={(e) => updateItem(index, field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-2"
      >
        <Plus className="w-4 h-4" />
        Add New Item
      </button>
    </div>
  );
}