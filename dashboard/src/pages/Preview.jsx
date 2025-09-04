import { ConfigUI } from '../components/ConfigUi';
import { ChatUI } from '../components/ChatUi';

export function Preview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConfigUI />
          <ChatUI />
        </div>
      </div>
    </div>
  );
}

export default Preview;