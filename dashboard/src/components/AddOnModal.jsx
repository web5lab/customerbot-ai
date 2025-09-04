import { useState } from 'react';
import { Loader2, X, AlertCircle, CheckCircle, Package } from 'lucide-react';

export function AddOnModal({ addOn, onClose }) {
  const [quantity, setQuantity] = useState(addOn?.quantity || 1);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const totalPrice = Number(addOn?.price?.replace('$', '') || 0) * quantity;

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (quantity <= 0) return;

    try {
      setStatus('loading');
      
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process purchase');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Purchase {addOn?.name || 'Add-on'}
              </h2>
              <p className="text-sm text-gray-600">{addOn?.description || 'Additional features'}</p>
            </div>
          </div>

          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Purchase Successful!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You have successfully purchased {quantity} {addOn?.name?.toLowerCase() || 'items'}.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-6">
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Price per unit</span>
                  <span className="text-sm font-medium text-gray-900">{addOn?.price || '$0'}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total price</span>
                    <span className="text-lg font-semibold text-gray-900">${totalPrice}</span>
                  </div>
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-lg bg-red-100 flex items-center gap-2 text-red-700 border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Purchase for $${totalPrice}`
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}