import { useState } from 'react';
import { TrainingSources } from '../components/TrainingSources';
import { QATraining } from '../components/QATraining';
import { useDispatch } from 'react-redux';
import { scrapPdfData, scrapWebsiteUrl } from '../store/global.Action';
import { FileText, Globe, MessageSquare, Brain } from 'lucide-react';

export function Training() {
  const [activeTab, setActiveTab] = useState('pdf');
  const dispatch = useDispatch();

  const [trainingItems, setTrainingItems] = useState({
    pdf: [{ name: 'documentation.pdf', status: 'completed' }],
    websites: [{ name: 'https://example.com', status: 'processing' }],
    text: [],
  });

  const [qaPairs, setQaPairs] = useState([
    { question: 'What is Web3?', answer: 'Web3 refers to the next generation of the internet...' },
  ]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTrainingItems((prev) => ({
      ...prev,
      pdf: [...prev.pdf, { name: file.name, status: 'processing' }],
    }));

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      dispatch(scrapPdfData({ data: formData }));

      setTrainingItems((prev) => ({
        ...prev,
        pdf: prev.pdf.map((item) =>
          item.name === file.name ? { ...item, status: 'completed' } : item
        ),
      }));
    } catch (error) {
      setTrainingItems((prev) => ({
        ...prev,
        pdf: prev.pdf.map((item) =>
          item.name === file.name ? { ...item, status: 'failed' } : item
        ),
      }));
    }
  };

  const handleWebsiteAdd = (e) => {
    e.preventDefault();
    const url = new FormData(e.currentTarget).get('url');
    if (url) {
      dispatch(scrapWebsiteUrl({ url: url.toString() }));
      setTrainingItems((prev) => ({
        ...prev,
        websites: [...prev.websites, { name: url.toString(), status: 'processing' }],
      }));
      e.currentTarget.reset();
    }
  };

  const handleTextAdd = (e) => {
    e.preventDefault();
    const text = new FormData(e.currentTarget).get('text');
    if (text) {
      setTrainingItems((prev) => ({
        ...prev,
        text: [...prev.text, { name: 'Text Document', content: text.toString(), status: 'processing' }],
      }));
      e.currentTarget.reset();
    }
  };

  const handleAddQA = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const question = formData.get('question');
    const answer = formData.get('answer');
    if (question && answer) {
      setQaPairs((prev) => [...prev, { question: question.toString(), answer: answer.toString() }]);
      e.currentTarget.reset();
    }
  };

  const handleEditQA = (index, question, answer) => {
    setQaPairs((prev) =>
      prev.map((pair, i) => (i === index ? { question, answer } : pair))
    );
  };

  const handleDeleteQA = (index) => {
    setQaPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const tabs = [
    { 
      key: 'pdf', 
      label: 'PDF Documents', 
      icon: FileText,
      description: 'Upload and process PDF documents'
    },
    { 
      key: 'websites', 
      label: 'Websites', 
      icon: Globe,
      description: 'Scrape content from web pages'
    },
    { 
      key: 'text', 
      label: 'Text Sources', 
      icon: MessageSquare,
      description: 'Add custom text content'
    },
    { 
      key: 'qa', 
      label: 'Q&A Pairs', 
      icon: Brain,
      description: 'Create question-answer pairs'
    },
  ];

  const getTabStats = (key) => {
    switch (key) {
      case 'pdf': return trainingItems.pdf.length;
      case 'websites': return trainingItems.websites.length;
      case 'text': return trainingItems.text.length;
      case 'qa': return qaPairs.length;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Brain className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training</h1>
                <p className="text-gray-600">Train your AI assistant with custom data</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Brain className="w-4 h-4" />
              Start Training
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tabs.map((tab) => (
            <div key={tab.key} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <tab.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{getTabStats(tab.key)}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{tab.label}</h3>
              <p className="text-sm text-gray-600">{tab.description}</p>
            </div>
          ))}
        </div>

        {/* Main Training Interface */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-gray-100">
                    <tab.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>{tab.label}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    {getTabStats(tab.key)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'pdf' && (
              <TrainingSources items={trainingItems.pdf} type="pdf" onFileUpload={handleFileUpload} />
            )}

            {activeTab === 'websites' && (
              <TrainingSources items={trainingItems.websites} type="websites" onWebsiteAdd={handleWebsiteAdd} />
            )}

            {activeTab === 'text' && (
              <TrainingSources items={trainingItems.text} type="text" onTextAdd={handleTextAdd} />
            )}

            {activeTab === 'qa' && (
              <QATraining
                pairs={qaPairs}
                onAddQA={handleAddQA}
                onEditQA={handleEditQA}
                onDeleteQA={handleDeleteQA}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}