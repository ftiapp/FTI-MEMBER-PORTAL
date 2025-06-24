'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SuccessMessage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard?tab=status');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-green-100 p-3">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">ส่งใบสมัครสำเร็จ</h2>
      
      <p className="text-gray-600 mb-6">
        ขอบคุณสำหรับการสมัครสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย
        <br />
        เจ้าหน้าที่จะตรวจสอบข้อมูลและติดต่อกลับโดยเร็วที่สุด
      </p>
      
      <div className="text-sm text-gray-500 mb-4">
        กำลังนำท่านไปยังหน้าสถานะการสมัครใน {countdown} วินาที
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => router.push('/dashboard?tab=status')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ไปยังหน้าสถานะการสมัคร
        </button>
      </div>
    </div>
  );
}
