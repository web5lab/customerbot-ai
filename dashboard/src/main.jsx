import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <App />
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Default options for all toasts
              className: '',
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '420px',
              },
              // Specific styles for different types
              success: {
                duration: 4000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: '#f0f9ff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#f0f9ff',
                },
              },
            }}
          />
        </>
      </PersistGate>
    </Provider>
  </StrictMode>
);
