// ResendEmailForm.js
import { useState } from 'react';

export default function ResendEmailForm({ onSuccess }) {
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  // ฟังก์ชันนี้ถูกปิดการใช้งานชั่วคราวเนื่องจากเหตุผลด้านความปลอดภัย
  // อาจมีการใช้งานในทางที่ผิดหรือถูกเรียกซ้ำๆ เพื่อโจมตีระบบ
  // มีระบบส่งอีเมลยืนยันอยู่ในส่วนอื่นแล้ว (ในหน้าลงทะเบียน)
  const handleResendVerification = async () => {
    // แจ้งผู้ใช้ว่าฟังก์ชันนี้ถูกปิดการใช้งาน
    alert('ฟังก์ชันนี้ถูกปิดการใช้งานชั่วคราว กรุณาใช้ฟังก์ชันส่งอีเมลยืนยันในหน้าลงทะเบียนแทน');
    return;
    
    /* 
    // โค้ดเดิมถูกคอมเมนต์ไว้
    if (!resendEmail) {
      alert('กรุณากรอกอีเมลของคุณ');
      return;
    }
    
    setIsResending(true);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ');
        if (onSuccess) {
          onSuccess('ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ');
        }
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsResending(false);
    }
    */
  };

  // ซ่อนฟอร์มทั้งหมดและแสดงเฉพาะข้อความแนะนำให้ไปใช้ฟังก์ชันในหน้าลงทะเบียน
  return (
    <div className="mb-6 max-w-md mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 font-medium mb-2">หากยังไม่ได้รับอีเมลยืนยัน กรุณาลงทะเบียนด้วยอีเมลเดิมอีกครั้ง</p>
        
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <h5 className="text-gray-700 font-medium mb-2">ติดต่อเรา</h5>
          <p className="text-gray-600 text-sm mb-1">1453 กด 2</p>
          <p className="text-gray-600 text-sm mb-1">member@fti.or.th</p>
          <p className="text-gray-600 text-sm mb-1">จันทร์-ศุกร์: 08:30 - 17:30 น.</p>
          <p className="text-gray-600 text-sm">เสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์: ปิดทำการ</p>
        </div>
      </div>
    </div>
  );
}