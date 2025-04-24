'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function VerifyChangeEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const inputRefs = Array(6).fill(0).map(() => React.createRef());

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Focus on first input when component mounts
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }

    // Timer for OTP expiration
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, router]);

  const handleInputChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if current input is filled
    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // If pasted data is a 6-digit number, fill all inputs
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      if (inputRefs[5].current) {
        inputRefs[5].current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      toast.error('กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    setStatus('verifying');

    try {
      const response = await fetch('/api/user/verify-change-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otpValue,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        toast.success('ยืนยัน OTP สำเร็จ');
        
        // Redirect to confirm-new-email page after successful verification
        setTimeout(() => {
          window.location.href = '/dashboard/confirm-new-email';
        }, 1500);
      } else {
        setStatus('error');
        toast.error(data.error || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
      }
    } catch (error) {
      setStatus('error');
      toast.error('เกิดข้อผิดพลาดในการยืนยัน OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" />
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ยืนยันรหัส OTP</h1>
          <p className="text-gray-600">
            กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยังอีเมล {user?.email}
          </p>
          {timeLeft > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              รหัสจะหมดอายุใน: <span className="font-medium">{formatTime(timeLeft)}</span>
            </p>
          )}
          {timeLeft === 0 && (
            <p className="text-sm text-red-500 mt-2">
              รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting || timeLeft === 0}
              />
            ))}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || timeLeft === 0 || otp.join('').length !== 6}
            >
              {isSubmitting ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}
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
