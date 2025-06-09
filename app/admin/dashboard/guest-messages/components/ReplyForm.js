// app/admin/dashboard/guest-messages/components/ReplyForm.js

import { useState } from 'react';

const ReplyForm = ({ message, onReply, onClose }) => {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      alert('กรุณากรอกข้อความ Remark');
      return;
    }

    setSubmitting(true);
    const result = await onReply(message.id, replyText);
    
    if (result) {
      setReplyText('');
    }
    
    setSubmitting(false);
  };

  const emailSubject = `Re: ${message.subject}`;
  const emailUrl = `mailto:${message.email}?subject=${encodeURIComponent(emailSubject)}`;

  if (message.status === 'replied') {
    return (
      <div className="mb-4 flex space-x-4">
        <a 
          href={emailUrl}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          ส่งอีเมลถึงผู้ติดต่อ
        </a>
        <button
          onClick={() => onClose(message.id)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          ปิดการติดต่อ
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        บันทึก Remark (สำหรับแอดมินเท่านั้น)
      </label>
      <textarea
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        rows="5"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="พิมพ์บันทึกหรือ remark เกี่ยวกับการจัดการข้อความนี้..."
        required
      ></textarea>
      <div className="flex justify-between items-center">
        <a 
          href={emailUrl}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          ส่งอีเมลถึงผู้ติดต่อ
        </a>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || !replyText.trim()}
        >
          {submitting ? 'กำลังบันทึก...' : 'บันทึก Remark'}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;