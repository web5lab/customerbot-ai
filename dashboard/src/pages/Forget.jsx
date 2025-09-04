import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await resetPassword(email);
      setMessage('Reset link sent to your email');
    } catch (err) {
      setError('Failed to send reset email');
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive a reset link"
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Send reset link
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}