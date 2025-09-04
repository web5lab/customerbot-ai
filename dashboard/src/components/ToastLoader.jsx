import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// Custom toast component with beautiful styling
const CustomToast = ({ t, type, title, message, icon: Icon }) => (
  <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
  >
    <div className="flex-1 w-0 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-green-100' :
            type === 'error' ? 'bg-red-100' :
            type === 'loading' ? 'bg-blue-100' :
            'bg-gray-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              type === 'success' ? 'text-green-600' :
              type === 'error' ? 'text-red-600' :
              type === 'loading' ? 'text-blue-600 animate-spin' :
              'text-gray-600'
            }`} />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {title}
          </p>
          {message && (
            <p className="mt-1 text-sm text-gray-500">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Loading toast with progress bar
const LoadingToast = ({ t, title, message, progress }) => (
  <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
  >
    <div className="flex-1 w-0 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {title}
          </p>
          {message && (
            <p className="mt-1 text-sm text-gray-500">
              {message}
            </p>
          )}
          {progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Promise toast for async operations
const PromiseToast = ({ t, title, loadingMessage, successMessage, errorMessage }) => {
  const getContent = () => {
    if (t.type === 'loading') {
      return {
        icon: Loader2,
        title: title,
        message: loadingMessage,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600 animate-spin',
        titleColor: 'text-gray-900'
      };
    } else if (t.type === 'success') {
      return {
        icon: CheckCircle,
        title: 'Success!',
        message: successMessage,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        titleColor: 'text-green-900'
      };
    } else {
      return {
        icon: AlertCircle,
        title: 'Error',
        message: errorMessage,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900'
      };
    }
  };

  const content = getContent();

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
    >
      <div className={`w-1 ${
        t.type === 'loading' ? 'bg-blue-500' :
        t.type === 'success' ? 'bg-green-500' :
        'bg-red-500'
      }`}></div>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${content.bgColor}`}>
              <content.icon className={`w-5 h-5 ${content.iconColor}`} />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${content.titleColor}`}>
              {content.title}
            </p>
            {content.message && (
              <p className="mt-1 text-sm text-gray-500">
                {content.message}
              </p>
            )}
          </div>
        </div>
      </div>
      {t.type !== 'loading' && (
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Toast utility functions
export const toastLoader = {
  // Simple loading toast
  loading: (title, message) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        type="loading" 
        title={title} 
        message={message} 
        icon={Loader2} 
      />
    ), {
      duration: Infinity,
      position: 'top-right'
    });
  },

  // Loading toast with progress
  loadingWithProgress: (title, message, progress = 0) => {
    return toast.custom((t) => (
      <LoadingToast 
        t={t} 
        title={title} 
        message={message} 
        progress={progress} 
      />
    ), {
      duration: Infinity,
      position: 'top-right'
    });
  },

  // Success toast
  success: (title, message) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        type="success" 
        title={title} 
        message={message} 
        icon={CheckCircle} 
      />
    ), {
      duration: 4000,
      position: 'top-right'
    });
  },

  // Error toast
  error: (title, message) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        type="error" 
        title={title} 
        message={message} 
        icon={AlertCircle} 
      />
    ), {
      duration: 5000,
      position: 'top-right'
    });
  },

  // Info toast
  info: (title, message) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        type="info" 
        title={title} 
        message={message} 
        icon={Info} 
      />
    ), {
      duration: 4000,
      position: 'top-right'
    });
  },

  // Promise toast for async operations
  promise: (promise, { loading, success, error }) => {
    return toast.promise(
      promise,
      {
        loading: loading.title,
        success: success.title,
        error: error.title,
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 4000,
          icon: '✅',
        },
        error: {
          duration: 5000,
          icon: '❌',
        },
        loading: {
          icon: '⏳',
        }
      }
    );
  },

  // Advanced promise toast with custom components
  promiseAdvanced: (promise, config) => {
    const toastId = toast.custom((t) => (
      <PromiseToast 
        t={t} 
        title={config.loading.title}
        loadingMessage={config.loading.message}
        successMessage={config.success.message}
        errorMessage={config.error.message}
      />
    ), {
      duration: Infinity,
      position: 'top-right'
    });

    promise
      .then(() => {
        toast.dismiss(toastId);
        toast.custom((t) => (
          <PromiseToast 
            t={{...t, type: 'success'}} 
            title={config.loading.title}
            loadingMessage={config.loading.message}
            successMessage={config.success.message}
            errorMessage={config.error.message}
          />
        ), {
          duration: 4000,
          position: 'top-right'
        });
      })
      .catch(() => {
        toast.dismiss(toastId);
        toast.custom((t) => (
          <PromiseToast 
            t={{...t, type: 'error'}} 
            title={config.loading.title}
            loadingMessage={config.loading.message}
            successMessage={config.success.message}
            errorMessage={config.error.message}
          />
        ), {
          duration: 5000,
          position: 'top-right'
        });
      });

    return toastId;
  },

  // Update progress of existing loading toast
  updateProgress: (toastId, progress, message) => {
    toast.dismiss(toastId);
    return toast.custom((t) => (
      <LoadingToast 
        t={t} 
        title="Processing..." 
        message={message} 
        progress={progress} 
      />
    ), {
      duration: Infinity,
      position: 'top-right',
      id: toastId
    });
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  }
};

// Export individual functions for convenience
export const {
  loading,
  loadingWithProgress,
  success,
  error,
  info,
  promise,
  promiseAdvanced,
  updateProgress,
  dismiss,
  dismissAll
} = toastLoader;

export default toastLoader;