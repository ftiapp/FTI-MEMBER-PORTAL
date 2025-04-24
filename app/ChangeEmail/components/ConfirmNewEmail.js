'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ConfirmNewEmail({ userId, token, onSuccess, onBack }) {
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(newEmail)) {
      toast.error('กรุณากรอกอีเมลใหม่ให้ถูกต้อง');
      return;
    }

    if (newEmail !== confirmNewEmail) {
      toast.error('อีเมลใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/confirm-new-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail,
          userId,
          token
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('เปลี่ยนอีเมลสำเร็จ');
        
        // ส่งข้อมูลกลับไปยัง parent component เพื่อไปยังขั้นตอนถัดไป
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการเปลี่ยนอีเมล');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">ขั้นตอนที่ 3: กรอกอีเมลใหม่</h2>
        <p className="text-gray-600">
          กรุณากรอกอีเมลใหม่ที่ท่านต้องการใช้งาน
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">อีเมลใหม่</label>
          <input
            type="email"
            id="newEmail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="กรอกอีเมลใหม่"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="confirmNewEmail" className="block text-sm font-medium text-gray-700 mb-1">ยืนยันอีเมลใหม่</label>
          <input
            type="email"
            id="confirmNewEmail"
            value={confirmNewEmail}
            onChange={(e) => setConfirmNewEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="กรอกอีเมลใหม่อีกครั้ง"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            disabled={isSubmitting}
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการเปลี่ยนอีเมล'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>หมายเหตุ: หลังจากเปลี่ยนอีเมลสำเร็จ ท่านจะต้องล็อกอินใหม่ด้วยอีเมลใหม่</p>
      </div>
    </div>
  );
}
