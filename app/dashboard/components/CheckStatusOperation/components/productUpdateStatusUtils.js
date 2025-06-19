import { FaBox, FaSpinner, FaCheck, FaTimes, FaQuestion } from 'react-icons/fa';

/**
 * Get the appropriate icon component for a product update status
 * @param {string} status - The status of the product update request
 * @returns {React.Component} - Icon component for the status
 */
export const getProductUpdateStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return FaSpinner;
    case 'approved':
      return FaCheck;
    case 'rejected':
      return FaTimes;
    case 'none':
      return FaBox;
    case 'error':
      return FaQuestion;
    default:
      return FaBox;
  }
};

/**
 * Get the appropriate text for a product update status
 * @param {string} status - The status of the product update request
 * @returns {string} - Status text in Thai
 */
export const getProductUpdateStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'รอการอนุมัติ';
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'rejected':
      return 'ปฏิเสธแล้ว';
    case 'none':
      return 'ไม่มีคำขอ';
    case 'error':
      return 'โหลดผิดพลาด';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

/**
 * Get the appropriate CSS class for a product update status
 * @param {string} status - The status of the product update request
 * @returns {string} - CSS class for the status
 */
export const getProductUpdateStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'none':
      return 'bg-gray-100 text-gray-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
