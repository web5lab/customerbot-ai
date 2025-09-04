import { Upload, Globe, FileText, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SOURCES = 20;
const MAX_TEXT_LENGTH = 5000;

export function TrainingSources({ 
  items, 
  type, 
  onFileUpload, 
  onWebsiteAdd, 
  onTextAdd 
}) {
  const totalSources = items.length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-gray-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderUploadSection = () => {
    switch (type) {
      case 'pdf':
        return (
          <div className="mb-8">
            <label className="block w-full cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > MAX_FILE_SIZE) {
                    alert('File size must be less than 10MB');
                    e.target.value = '';
                    return;
                  }
                  if (totalSources >= MAX_SOURCES) {
                    alert('Maximum number of sources reached');
                    e.target.value = '';
                    return;
                  }
                  onFileUpload?.(e);
                }} 
              />
              <div className={`flex items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all ${
                totalSources >= MAX_SOURCES
                  ? 'border-gray-200 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    totalSources >= MAX_SOURCES ? 'bg-gray-200' : 'bg-gray-100'
                  }`}>
                    <Upload className={`w-6 h-6 ${totalSources >= MAX_SOURCES ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${totalSources >= MAX_SOURCES ? 'text-gray-400' : 'text-gray-900'}`}>
                    {totalSources >= MAX_SOURCES ? 'Maximum sources reached' : 'Upload PDF Document'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {totalSources >= MAX_SOURCES ? 'Remove some sources to add new ones' : 'Drag and drop or click to browse (Max 10MB)'}
                  </p>
                </div>
              </div>
            </label>
          </div>
        );
      
      case 'websites':
        return (
          <form onSubmit={(e) => {
            if (totalSources >= MAX_SOURCES) {
              e.preventDefault();
              alert('Maximum number of sources reached');
              return;
            }
            onWebsiteAdd?.(e);
          }} className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-600" />
                Add Website URL
              </h3>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    name="url"
                    placeholder="https://example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    totalSources >= MAX_SOURCES
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  disabled={totalSources >= MAX_SOURCES}
                >
                  Add Website
                </button>
              </div>
            </div>
          </form>
        );
      
      case 'text':
        return (
          <form onSubmit={(e) => {
            if (totalSources >= MAX_SOURCES) {
              e.preventDefault();
              alert('Maximum number of sources reached');
              return;
            }
            onTextAdd?.(e);
          }} className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Add Custom Text
              </h3>
              <div className="space-y-4">
                <div>
                  <textarea
                    name="text"
                    placeholder="Enter your training text here..."
                    maxLength={MAX_TEXT_LENGTH}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none bg-white"
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Maximum {MAX_TEXT_LENGTH.toLocaleString()} characters
                    </span>
                    <span className="text-xs text-gray-500">
                      {totalSources}/{MAX_SOURCES} sources
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                    totalSources >= MAX_SOURCES
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  disabled={totalSources >= MAX_SOURCES}
                >
                  Add Text Content
                </button>
              </div>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'pdf' ? 'PDF Documents' : 
             type === 'websites' ? 'Website Sources' : 
             'Text Content'}
          </h2>
          <p className="text-gray-600 mt-1">
            {type === 'pdf' ? 'Upload PDF files to extract knowledge' :
             type === 'websites' ? 'Add websites to scrape content from' :
             'Add custom text content for training'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{totalSources}</span>
          <span className="text-gray-500">/{MAX_SOURCES}</span>
          <p className="text-sm text-gray-500">Sources added</p>
        </div>
      </div>
      
      {renderUploadSection()}

      {/* Sources List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Added Sources ({items.length})
        </h3>
        
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${getStatusColor(item.status)}`}>
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-white border border-gray-200">
                    {type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-gray-600" />
                    ) : type === 'websites' ? (
                      <Globe className="w-4 h-4 text-gray-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 truncate max-w-xs">
                      {type === 'text' ? `Text Document ${index + 1}` : item.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {type === 'pdf' ? 'PDF Document' :
                       type === 'websites' ? 'Website Content' :
                       'Custom Text'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.status}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-red-100 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
              {type === 'pdf' ? (
                <FileText className="w-6 h-6 text-gray-400" />
              ) : type === 'websites' ? (
                <Globe className="w-6 h-6 text-gray-400" />
              ) : (
                <FileText className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sources added yet</h3>
            <p className="text-gray-600">
              {type === 'pdf' ? 'Upload your first PDF document to get started' :
               type === 'websites' ? 'Add your first website URL to begin scraping' :
               'Add your first text content to start training'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}