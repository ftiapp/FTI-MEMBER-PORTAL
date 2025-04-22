import { format } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * Formats a date string to Thai locale format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'd MMMM yyyy, HH:mm น.', { locale: th });
};

/**
 * Returns a status badge component based on status value
 * @param {string} statusValue - The status value ('pending', 'approved', or 'rejected')
 * @returns {JSX.Element} - Status badge component
 */
export const getStatusBadge = (statusValue) => {
  switch (statusValue) {
    case 'pending':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">รอการอนุมัติ</span>;
    case 'approved':
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">อนุมัติแล้ว</span>;
    case 'rejected':
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">ปฏิเสธแล้ว</span>;
    default:
      return null;
  }
};

/**
 * Returns the Thai status name based on status value
 * @param {string} statusValue - The status value ('pending', 'approved', or 'rejected')
 * @returns {string} - Thai status name
 */
export const getStatusName = (statusValue) => {
  switch (statusValue) {
    case 'pending':
      return 'รอการอนุมัติ';
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'rejected':
      return 'ปฏิเสธแล้ว';
    default:
      return '';
  }
};