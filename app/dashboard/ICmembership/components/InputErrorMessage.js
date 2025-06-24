'use client';

import { FiAlertTriangle } from 'react-icons/fi';

/**
 * คอมโพเนนต์สำหรับแสดงข้อความข้อผิดพลาดที่มุมขวาบนของอินพุต
 * @param {string} message - ข้อความข้อผิดพลาด
 * @returns {JSX.Element|null} - คอมโพเนนต์ข้อความข้อผิดพลาด
 */
export default function InputErrorMessage({ message }) {
  if (!message) return null;
  
  return (
    <div className="absolute right-0 top-0 z-10 text-sm text-red-500 bg-white px-2 py-1 rounded shadow-sm border border-red-100 flex items-center">
      <FiAlertTriangle className="mr-1" size={12} />
      <span>{message}</span>
    </div>
  );
}
