'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

export default function SuccessMessage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [countdown, setCountdown] = useState(3);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    // นับถอยหลังจาก 3 วินาทีและล็อกเอาท์ผู้ใช้
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      logout();
      router.push('/login');
    }
  }, [countdown, logout, router]);

  return (
    <div className="relative bg-white rounded-lg max-w-md mx-auto text-center py-8 px-6">
      {isLocked && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-lg z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3">กำลังออกจากระบบ</h3>
            <div className="text-3xl font-bold text-blue-600 mb-3">{countdown}</div>
            <p className="text-gray-600">กรุณารอสักครู่...</p>
          </div>
        </div>
      )}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">เปลี่ยนอีเมลสำเร็จ!</h2>
      
      <p className="text-gray-600 mb-6">
        ท่านได้เปลี่ยนอีเมลเรียบร้อยแล้ว กรุณาล็อกอินใหม่อีกครั้งเพื่อเข้าใช้งานระบบ
      </p>
      
      <p className="text-sm text-gray-500 mb-6">
        ระบบจะนำท่านไปยังหน้าล็อกอินโดยอัตโนมัติใน 3 วินาที
      </p>
      
      <Link 
        href="/login" 
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        onClick={logout}
      >
        ไปยังหน้าล็อกอิน
      </Link>
    </div>
  );
}
