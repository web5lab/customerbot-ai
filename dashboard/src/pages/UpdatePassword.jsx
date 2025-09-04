import { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      // await updatePassword(newPassword);
      setMessage('Password updated successfully');
    } catch (err) {
      setError('Failed to update password');
    }
  };

  return (
    <AuthLayout
      title="Update password"
      subtitle="Enter your new password"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 flex items-center gap-2 text-red-700 border border-red-200">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 flex items-center gap-2 text-green-700 border border-green-200">
          <CheckCircle className="w-4 h-4" />
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Update password
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}