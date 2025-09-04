import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Bot,
  Save,
  Copy,
  Globe,
  User,
  Code,
  Database,
  Check,
  FileText,
  Loader2
} from 'lucide-react';
import { createBotApi, GetBots } from '../store/global.Action';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

export function CreateBotModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [botName, setBotName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [botIcon, setBotIcon] = useState(null);
  const [faqMethod, setFaqMethod] = useState('skip');
  const [faqFile, setFaqFile] = useState(null);
  const [faqText, setFaqText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState('react');
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const faqFileInputRef = useRef(null);

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBotIcon(file);
    }
  };

  const handleFaqFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaqFile(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      if (!botName) {
        toast.error("Bot name is required");
        setIsCreating(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', botName);
      formData.append('websiteUrl', websiteUrl);
      formData.append('faqMethod', faqMethod);
      if (faqMethod === 'upload' && faqFile) {
        formData.append('faqFile', faqFile);
      }
      if (faqMethod === 'text') {
        formData.append('faqText', faqText);
      }
      formData.append('icon', botIcon);

      await createBotApi({ data: formData });
      dispatch(GetBots());
      setIsCreating(false);
      setIsCreated(true);
      setCurrentStep(4);
    } catch (error) {
      setIsCreating(false);
      console.error("Error creating bot:", error);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const copyToClipboard = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const getIntegrationCode = () => {
    const botId = 'bot_' + Math.random().toString(36).substr(2, 9);

    const codes = {
      react: `<script
  src="https://cdn.customerbot.ai/widget.js"
  data-bot-id="${botId}"
  data-theme="modern"
></script>`,
      html: `<script src="https://cdn.customerbot.ai/widget.js" data-bot-id="${botId}"></script>`,
      wordpress: `[customerbot bot-id="${botId}" theme="modern"]`
    };

    return codes[selectedIntegration];
  };

  const getTotalSteps = () => faqMethod === 'skip' ? 3 : 4;

  // Loading Screen
  if (isCreating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-sm shadow-lg border border-gray-200">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-lg bg-gray-50 flex items-center justify-center mb-4 border border-gray-200">
              <Bot className="w-8 h-8 text-gray-600" />
            </div>

            <Loader2 className="w-6 h-6 mx-auto text-gray-600 animate-spin mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Assistant</h3>
            <p className="text-sm text-gray-600 mb-4">Please wait...</p>

            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                <span>Processing configuration</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                <span>Training AI model</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create AI Assistant</h2>
                <p className="text-sm text-gray-600">Step {currentStep} of {getTotalSteps()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-gray-900 rounded-full h-1 transition-all duration-300"
                style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 flex items-center justify-center mb-3 border border-gray-200">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-600">Name your AI assistant</p>
              </div>

              {/* Bot Icon Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Icon (Optional)
                </label>
                <div
                  className="w-20 h-20 mx-auto bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {botIcon ? (
                    <img
                      src={URL.createObjectURL(botIcon)}
                      alt="Bot Icon"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleIconUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Bot Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant Name *
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g., Support Assistant"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: FAQ Setup */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 flex items-center justify-center mb-3 border border-gray-200">
                  <Database className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Training Data Setup</h3>
                <p className="text-sm text-gray-600">Add training data (optional)</p>
              </div>

              {/* Tab Headers */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {["skip", "upload", "text"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setFaqMethod(method)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                      faqMethod === method
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {method === "skip" && "Skip"}
                    {method === "upload" && "Upload PDF"}
                    {method === "text" && "Enter Text"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="rounded-lg border border-gray-200 p-4 bg-white">
                {faqMethod === "skip" && (
                  <p className="text-sm text-gray-600 text-center">
                    You can skip adding training data now and add it later.
                  </p>
                )}

                {faqMethod === "upload" && (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => faqFileInputRef.current?.click()}
                  >
                    {faqFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700 font-medium">{faqFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-700 font-medium">Click to upload PDF</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={faqFileInputRef}
                      onChange={handleFaqFileUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                  </div>
                )}

                {faqMethod === "text" && (
                  <textarea
                    value={faqText}
                    onChange={(e) => setFaqText(e.target.value)}
                    placeholder="Enter your training content here..."
                    rows="4"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Create */}
          {currentStep === 3 && !isCreated && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 flex items-center justify-center mb-3 border border-gray-200">
                  <Check className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
                <p className="text-sm text-gray-600">Review your configuration</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200">
                    {botIcon ? (
                      <img
                        src={URL.createObjectURL(botIcon)}
                        alt="Bot Icon"
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <Bot className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-gray-900">{botName || 'Unnamed Assistant'}</h4>
                    {websiteUrl && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{websiteUrl}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Database className="w-3 h-3" />
                      <span>
                        Training: {faqMethod === 'skip' ? 'None' :
                          faqMethod === 'upload' ? `PDF: ${faqFile?.name || 'Selected'}` :
                            'Custom text'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Integration Code */}
          {(currentStep === 4 || (currentStep === 3 && isCreated)) && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 flex items-center justify-center mb-3 border border-gray-200">
                  <Code className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Integration Code</h3>
                <p className="text-sm text-gray-600">Copy code to your website</p>
              </div>

              {/* Platform Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedIntegration('react')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    selectedIntegration === 'react'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  React
                </button>
                <button
                  onClick={() => setSelectedIntegration('html')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    selectedIntegration === 'html'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setSelectedIntegration('wordpress')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    selectedIntegration === 'wordpress'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  WordPress
                </button>
              </div>

              {/* Code Display */}
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs">
                  <code>{getIntegrationCode()}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(getIntegrationCode(), selectedIntegration)}
                  className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {copiedCode === selectedIntegration ? (
                    <Check className="w-3 h-3 text-gray-100" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-1 text-sm">Instructions:</h4>
                <p className="text-xs text-gray-600">
                  {selectedIntegration === 'react' && 'Add this script tag to your React app'}
                  {selectedIntegration === 'html' && 'Paste before closing </body> tag'}
                  {selectedIntegration === 'wordpress' && 'Add shortcode to any page or widget'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : prevStep}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm"
            disabled={isCreated && (currentStep === 3 || currentStep === 4)}
          >
            {currentStep === 1 ? 'Cancel' : (isCreated ? 'Close' : 'Back')}
          </button>

          {(currentStep < 3 || (currentStep === 2 && faqMethod === 'skip')) ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 2 && faqMethod === 'skip') {
                  setCurrentStep(3);
                } else {
                  nextStep();
                }
              }}
              disabled={currentStep === 1 && !botName.trim()}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 hover:bg-gray-800 text-sm"
            >
              Next
            </button>
          ) : currentStep === 3 && !isCreated ? (
            <button
              onClick={handleCreate}
              disabled={!botName.trim()}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 hover:bg-gray-800 text-sm"
            >
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Create
              </div>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors bg-gray-900 hover:bg-gray-800 text-sm"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}