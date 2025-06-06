'use client';

import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import { LoadingProvider } from './components/GlobalLoadingOverlay';
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <LoadingProvider>
        {children}
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </LoadingProvider>
    </AuthProvider>
  );
}
