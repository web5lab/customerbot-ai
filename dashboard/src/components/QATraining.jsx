import { Brain, Plus, Edit, Save, X } from 'lucide-react';
import { WordCounter } from './WordCounter';
import { useState } from 'react';

const MAX_ANSWER_LENGTH = 500;
const MAX_QUESTION_LENGTH = 150;

export function QATraining({ pairs, onAddQA, onEditQA, onDeleteQA }) {
  const totalPairs = pairs.length;
  const MAX_PAIRS = 50;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const handleEditSubmit = (index) => {
    onEditQA(index, editQuestion, editAnswer);
    setEditingIndex(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditQuestion(pairs[index].question);
    setEditAnswer(pairs[index].answer);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Q&A Training</h2>
        <span className="text-sm text-gray-600">{totalPairs}/{MAX_PAIRS} Pairs</span>
      </div>
      
      <form onSubmit={(e) => {
        if (totalPairs >= MAX_PAIRS) {
          e.preventDefault();
          alert('Maximum number of Q&A pairs reached');
          return;
        }
        onAddQA(e);
      }} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-gray-600" />
          Add New Q&A Pair
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
            <input
              type="text"
              name="question"
              placeholder="Enter question"
              maxLength={MAX_QUESTION_LENGTH}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
            <WordCounter maxLength={MAX_QUESTION_LENGTH} name="question" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
            <textarea
              name="answer"
              placeholder="Enter answer"
              rows={3}
              maxLength={MAX_ANSWER_LENGTH}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              required
            />
            <WordCounter maxLength={MAX_ANSWER_LENGTH} name="answer" />
          </div>
          <button
            type="submit"
            className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
              totalPairs >= MAX_PAIRS
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
            disabled={totalPairs >= MAX_PAIRS}
          >
            <Plus className="w-4 h-4" />
            Add Q&A Pair
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {pairs.map((pair, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    maxLength={MAX_QUESTION_LENGTH}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Edit question"
                  />
                  <WordCounter maxLength={MAX_QUESTION_LENGTH} name={`edit-question-${index}`} />
                </div>
                <div>
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    maxLength={MAX_ANSWER_LENGTH}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                    placeholder="Edit answer"
                  />
                  <WordCounter maxLength={MAX_ANSWER_LENGTH} name={`edit-answer-${index}`} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditSubmit(index)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 flex items-center gap-1 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">{pair.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(index)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDeleteQA(index)}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="pl-6 mt-2">
                  <p className="text-sm text-gray-600">{pair.answer}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}