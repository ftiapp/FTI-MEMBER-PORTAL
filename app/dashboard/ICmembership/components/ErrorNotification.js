'use client';

import { useEffect, useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import './animations.css';

export default function ErrorNotification({ errors, onClose }) {
  const [visible, setVisible] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    // Check if there are any errors
    const messages = Object.values(errors).filter(error => error);
    setErrorMessages(messages);
    
    if (messages.length > 0) {
      setVisible(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [errors, onClose]);

  if (!visible || errorMessages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border-l-4 border-red-500 border-t border-r border-b rounded-md shadow-lg p-4 max-w-md animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="text-red-500 mr-3 mt-1">
            <FiAlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-red-800 font-medium mb-2">กรุณาตรวจสอบข้อมูล</h3>
            <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
              {errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
        <button 
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="text-gray-500 hover:text-gray-700 ml-2 p-1 rounded-full hover:bg-gray-100"
          aria-label="ปิด"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
}
