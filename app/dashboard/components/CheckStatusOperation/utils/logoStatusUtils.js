import { FaImage } from 'react-icons/fa';

/**
 * Get the appropriate icon for a logo status
 * @param {string} status - The status of the logo update
 * @returns {React.Component} - The icon component
 */
export const getLogoStatusIcon = (status) => {
  return FaImage;
};

/**
 * Get the appropriate text for a logo status
 * @param {string} status - The status of the logo update
 * @returns {string} - The status text
 */
export const getLogoStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'pending':
      return 'รอการอนุมัติ';
    case 'rejected':
      return 'ถูกปฏิเสธ';
    case 'error':
      return 'เกิดข้อผิดพลาด';
    case 'none':
      return 'ไม่มีข้อมูล';
    default:
      return 'อนุมัติแล้ว';
  }
};

/**
 * Get the appropriate CSS class for a logo status
 * @param {string} status - The status of the logo update
 * @returns {string} - The CSS class
 */
export const getLogoStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'none':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};
