import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';

/**
 * Get the appropriate icon for an address update status
 * @param {string} status - The status of the address update
 * @returns {React.ComponentType} - The icon component constructor to display
 */
export const getAddressUpdateStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return FaClock;
    case 'approved':
      return FaCheckCircle;
    case 'rejected':
      return FaTimesCircle;
    case 'none':
      return FaExclamationTriangle;
    case 'error':
      return FaExclamationTriangle;
    default:
      return FaExclamationTriangle;
  }
};

/**
 * Get the appropriate text for an address update status
 * @param {string} status - The status of the address update
 * @returns {string} - The text to display
 */
export const getAddressUpdateStatusText = (status) => {
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
      return 'เกิดข้อผิดพลาด';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

/**
 * Get the appropriate CSS class for an address update status
 * @param {string} status - The status of the address update
 * @returns {string} - The CSS class to apply
 */
export const getAddressUpdateStatusClass = (status) => {
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
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
