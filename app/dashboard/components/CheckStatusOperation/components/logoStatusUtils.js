import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaImage,
  FaHourglass
} from 'react-icons/fa';

/**
 * Get the appropriate icon for a logo update status
 */
export const getLogoStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return FaCheckCircle;
    case 'rejected':
      return FaTimesCircle;
    case 'pending':
      return FaHourglass;
    case 'none':
      return FaImage;
    case 'error':
      return FaExclamationTriangle;
    default:
      return FaImage;
  }
};

/**
 * Get the appropriate text for a logo update status
 */
export const getLogoStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'อัปเดตแล้ว';
    case 'rejected':
      return 'ปฏิเสธแล้ว';
    case 'pending':
      return 'รอการอนุมัติ';
    case 'none':
      return 'ไม่มีข้อมูล';
    case 'error':
      return 'เกิดข้อผิดพลาด';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

/**
 * Get the appropriate CSS class for a logo update status
 */
export const getLogoStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'none':
      return 'bg-gray-100 text-gray-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
