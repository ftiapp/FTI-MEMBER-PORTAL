'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function ConfirmNewEmailPage() {
  const router = useRouter();
  const { user, updateUserEmail } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // ตรวจสอบว่ามี token ที่ยืนยัน OTP แล้วหรือไม่
    const checkToken = async () => {
      try {
        const response = await fetch('/api/user/check-email-change-token', {
          method: 'GET',
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.hasValidToken) {
          toast.error('คุณยังไม่ได้ยืนยัน OTP หรือ session หมดอายุ');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
        }
        
        setHasToken(true);
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะ');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    };

    checkToken();
  }, [user, router]);

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

    if (newEmail === user.email) {
      toast.error('อีเมลใหม่ต้องไม่ซ้ำกับอีเมลปัจจุบัน');
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
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('เปลี่ยนอีเมลสำเร็จ');
        
        // อัปเดตอีเมลในระบบ Auth Context
        if (updateUserEmail) {
          updateUserEmail(newEmail);
        }
        
        // Redirect to dashboard after successful email change
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการเปลี่ยนอีเมล');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนอีเมล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" />
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">กรอกอีเมลใหม่</h1>
          <p className="text-gray-600">
            กรุณากรอกอีเมลใหม่ที่ต้องการเปลี่ยน
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-1">อีเมลปัจจุบัน</label>
            <input
              type="email"
              id="currentEmail"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
            />
          </div>
          
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

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการเปลี่ยนอีเมล'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
            กลับไปหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  );
}
