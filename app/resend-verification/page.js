'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ResendVerification() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('กรุณากรอกอีเมล');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        // Clear the form
        setEmail('');
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1e3a8a]">
          ส่งอีเมลยืนยันใหม่
        </h2>
        <p className="mt-2 text-center text-sm text-[#1e3a8a] text-opacity-70">
          หากคุณไม่ได้รับอีเมลยืนยัน หรืออีเมลยืนยันหมดอายุแล้ว
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10 border border-[#1e3a8a] border-opacity-20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1e3a8a]">
                อีเมล
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'กำลังส่ง...' : 'ส่งอีเมลยืนยันใหม่'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">หรือ</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm text-sm font-medium text-[#1e3a8a] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a]"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
              <div>
                <Link
                  href="/register"
                  className="w-full flex justify-center py-2 px-4 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm text-sm font-medium text-[#1e3a8a] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a]"
                >
                  ลงทะเบียนใหม่
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
