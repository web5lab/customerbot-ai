import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MinimalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">CustomerBot</span>
          </Link>
        </div>
      </div>
    </header>
  );
}