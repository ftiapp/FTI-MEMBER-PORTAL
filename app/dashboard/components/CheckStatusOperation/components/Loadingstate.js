import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingState = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="py-16 flex flex-col items-center justify-center text-gray-600">
        <FaSpinner className="animate-spin text-blue-600 mb-3" size={28} />
        <p className="font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
};

export default LoadingState;