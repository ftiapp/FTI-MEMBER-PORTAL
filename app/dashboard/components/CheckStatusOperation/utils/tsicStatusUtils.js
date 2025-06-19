import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf, 
  FaExclamationTriangle,
  FaQuestionCircle
} from 'react-icons/fa';

/**
 * Get the icon component for a TSIC code update status
 * @param {string} status - The status of the TSIC code update
 * @returns {Component} - The icon component for the status
 */
export const getTsicStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return FaCheckCircle;
    case 'rejected':
      return FaTimesCircle;
    case 'pending':
      return FaHourglassHalf;
    case 'error':
      return FaExclamationTriangle;
    case 'none':
    default:
      return FaQuestionCircle;
  }
};

/**
 * Get the text for a TSIC code update status
 * @param {string} status - The status of the TSIC code update
 * @returns {string} - The text for the status
 */
export const getTsicStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'rejected':
      return 'ปฏิเสธแล้ว';
    case 'pending':
      return 'รอการอนุมัติ';
    case 'error':
      return 'เกิดข้อผิดพลาด';
    case 'none':
    default:
      return 'ไม่มีข้อมูล';
  }
};

/**
 * Get the CSS class for a TSIC code update status
 * @param {string} status - The status of the TSIC code update
 * @returns {string} - The CSS class for the status
 */
export const getTsicStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'none':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
