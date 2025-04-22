'use client';

export default function StatusBadge({ status }) {
  switch (status) {
    case 'unread':
      return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">ใหม่</span>;
    case 'read':
      return <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium">อ่านแล้ว</span>;
    case 'replied':
      return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">ตอบกลับแล้ว</span>;
    default:
      return null;
  }
}