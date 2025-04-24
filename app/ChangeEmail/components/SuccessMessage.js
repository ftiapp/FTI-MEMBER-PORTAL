'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

export default function SuccessMessage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // ล็อกเอาท์ผู้ใช้หลังจาก 10 วินาที
    const timer = setTimeout(() => {
      logout();
      router.push('/login');
    }, 10000);

    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <div className="bg-white rounded-lg max-w-md mx-auto text-center py-8 px-6">
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
        ระบบจะนำท่านไปยังหน้าล็อกอินโดยอัตโนมัติใน 10 วินาที
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
