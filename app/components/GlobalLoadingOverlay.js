'use client';

import { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Create a context for the loading state
const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
  message: '',
  setMessage: () => {},
});

// Provider component
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('กำลังดำเนินการ...');

  const setLoading = (loading, customMessage = 'กำลังดำเนินการ...') => {
    setIsLoading(loading);
    setMessage(customMessage);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, message, setMessage }}>
      {children}
      <GlobalLoadingOverlay />
    </LoadingContext.Provider>
  );
}

// Hook to use the loading context
export function useLoading() {
  return useContext(LoadingContext);
}

// The actual overlay component
function GlobalLoadingOverlay() {
  const { isLoading, message } = useContext(LoadingContext);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-70 z-[9999] flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">{message}</h3>
            <p className="text-gray-600 mb-2">กรุณารอสักครู่ ระบบกำลังดำเนินการ</p>
            <p className="text-sm text-gray-500 mt-4">โปรดอย่าปิดหน้านี้หรือรีเฟรชเพจ</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
