// app/admin/dashboard/guest-messages/constants.js

export const STATUS_LABELS = {
    unread: 'ยังไม่อ่าน',
    read: 'อ่านแล้ว',
    replied: 'ตอบกลับ',
    closed: 'ปิดการติดต่อ'
  };
  
  export const STATUS_COLORS = {
    unread: 'bg-red-100 text-red-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };
  
  export const PRIORITY_LABELS = {
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง'
  };
  
  export const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  
  export const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };