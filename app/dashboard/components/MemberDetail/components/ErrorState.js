'use client';

import { FaExclamationCircle } from 'react-icons/fa';

/**
 * ErrorState component for displaying error messages
 * @param {Object} props Component properties
 * @param {string} props.message Error message to display
 * @param {Function} props.onRetry Callback function for retry button
 */
export default function ErrorState({ message = 'เกิดข้อผิดพลาดในการโหลดข้อมูล', onRetry }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
        <FaExclamationCircle className="text-red-500 mb-3" size={28} />
        <p className="font-medium mb-3">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            ลองใหม่อีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
}