// Utility for mapping contact message status to icon, text, and class
import { FaEnvelope, FaEnvelopeOpen, FaCheckCircle } from 'react-icons/fa';

export const getContactMessageStatusIcon = (status) => {
  switch (status) {
    case 'unread':
      return <FaEnvelope className="text-yellow-600" size={18} />;
    case 'read':
      return <FaEnvelopeOpen className="text-blue-600" size={18} />;
    case 'replied':
      return <FaCheckCircle className="text-green-600" size={18} />;
    case 'none':
      return <FaEnvelope className="text-gray-400" size={18} />;
    case 'error':
      return <FaEnvelope className="text-red-500" size={18} />;
    default:
      return <FaEnvelope className="text-gray-500" size={18} />;
  }
};

export const getContactMessageStatusText = (status) => {
  switch (status) {
    case 'unread':
      return 'รอดำเนินการ'; // waiting for admin
    case 'read':
      return 'รอดำเนินการ'; // still waiting for admin
    case 'replied':
      return 'ตอบกลับแล้ว';
    case 'none':
      return 'ไม่มีข้อความ';
    case 'error':
      return 'ไม่สามารถโหลดข้อมูล';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

export const getContactMessageStatusClass = (status) => {
  switch (status) {
    case 'unread':
      return 'bg-yellow-100 text-yellow-800';
    case 'read':
      return 'bg-blue-100 text-blue-800';
    case 'replied':
      return 'bg-green-100 text-green-800';
    case 'none':
      return 'bg-gray-100 text-gray-600';
    case 'error':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
