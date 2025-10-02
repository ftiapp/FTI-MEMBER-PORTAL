import { format } from "date-fns";
import { th } from "date-fns/locale";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaInfoCircle } from "react-icons/fa";

/**
 * Format date to Thai locale format
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "d MMMM yyyy, HH:mm น.", { locale: th });
};

/**
 * Get status icon based on operation status
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return <FaHourglassHalf className="text-yellow-500" size={20} />;
    case "approved":
      return <FaCheckCircle className="text-green-500" size={20} />;
    case "rejected":
      return <FaTimesCircle className="text-red-500" size={20} />;
    default:
      return <FaHourglassHalf className="text-gray-500" size={20} />;
  }
};

/**
 * Get verification status icon based on admin submit status
 */
export const getVerificationStatusIcon = (adminSubmit) => {
  switch (adminSubmit) {
    case 0:
      return <FaHourglassHalf className="text-yellow-500" size={20} />;
    case 1:
      return <FaCheckCircle className="text-green-500" size={20} />;
    case 2:
      return <FaTimesCircle className="text-red-500" size={20} />;
    default:
      return <FaInfoCircle className="text-gray-500" size={20} />;
  }
};

/**
 * Get status text based on operation status
 */
export const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "รอการอนุมัติ";
    case "approved":
      return "อนุมัติแล้ว";
    case "rejected":
      return "ปฏิเสธแล้ว";
    default:
      return "รอดำเนินการ";
  }
};

/**
 * Get verification status text based on admin submit status
 */
export const getVerificationStatusText = (adminSubmit) => {
  switch (adminSubmit) {
    case 0:
      return "รอการตรวจสอบ";
    case 1:
      return "อนุมัติแล้ว";
    case 2:
      return "ปฏิเสธแล้ว";
    default:
      return "ไม่ระบุสถานะ";
  }
};

/**
 * Get status class for styling based on operation status
 */
export const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "approved":
      return "bg-green-100 text-green-800 border border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

/**
 * Get verification status class for styling based on admin submit status
 */
export const getVerificationStatusClass = (adminSubmit) => {
  switch (adminSubmit) {
    case 0:
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case 1:
      return "bg-green-100 text-green-800 border border-green-200";
    case 2:
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};
