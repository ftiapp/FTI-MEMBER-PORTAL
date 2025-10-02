import { format } from "date-fns";
import { th } from "date-fns/locale";

// Format date to Thai locale
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy HH:mm:ss", { locale: th });
  } catch (e) {
    return dateString;
  }
};

// Get action type badge color
export const getActionBadgeColor = (actionType) => {
  switch (actionType) {
    case "approve_member":
    case "approve_profile_update":
      return "bg-green-100 text-green-800 border border-green-200";
    case "reject_member":
    case "reject_profile_update":
      return "bg-red-100 text-red-800 border border-red-200";
    case "contact_message_response":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "update_admin":
      return "bg-purple-100 text-purple-800 border border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

// Get date range based on selection
export const getDateRange = (range) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return {
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      };
    case "week":
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        startDate: format(weekAgo, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      };
    case "month":
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        startDate: format(monthAgo, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      };
    default:
      return { startDate: "", endDate: "" };
  }
};

// Format action type for display
export const formatActionType = (actionType) => {
  const actionTypeMap = {
    login: "เข้าสู่ระบบ",
    approve_member: "อนุมัติสมาชิก",
    reject_member: "ปฏิเสธสมาชิก",
    create_admin: "สร้างผู้ดูแลระบบใหม่",
    update_admin: "อัปเดตผู้ดูแลระบบ",
    other: "การกระทำอื่นๆ",
    contact_message_response: "ตอบกลับข้อความติดต่อ",
    approve_profile_update: "อนุมัติการอัปเดตโปรไฟล์",
    reject_profile_update: "ปฏิเสธการอัปเดตโปรไฟล์",
    approve_address_update: "อนุมัติการแก้ไขที่อยู่",
    reject_address_update: "ปฏิเสธการแก้ไขที่อยู่",
    approve_tsic_update: "อนุมัติการอัปเดตรหัส TSIC",
    reject_tsic_update: "ปฏิเสธการอัปเดตรหัส TSIC",
    contact_message_direct_reply: "ตอบกลับข้อความติดต่อโดยตรง",
    contact_message_read: "อ่านข้อความติดต่อ",
    approve_product_update: "อนุมัติการอัปเดตข้อมูลสินค้า",
    reject_product_update: "ปฏิเสธการอัปเดตข้อมูลสินค้า",
  };

  return actionTypeMap[actionType] || actionType;
};

// Validate date range
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return start <= end;
};

// Check if date is today
export const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Get relative time string
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "เมื่อสักครู่";
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} สัปดาห์ที่แล้ว`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} เดือนที่แล้ว`;
};
