'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function VerifyNewEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('ไม่พบโทเคนยืนยัน กรุณาตรวจสอบลิงก์ในอีเมลของคุณอีกครั้ง');
      return;
    }

    const verifyNewEmail = async () => {
      try {
        const response = await fetch('/api/user/verify-new-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          // เริ่มนับถอยหลังเพื่อเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push('/login');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการยืนยันอีเมลใหม่');
        }
      } catch (error) {
        console.error('Error verifying new email:', error);
        setVerificationStatus('error');
        setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    };

    verifyNewEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.png"
              alt="FTI Logo"
              width={150}
              height={50}
              priority
            />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ยืนยันอีเมลใหม่
          </h2>

          {verificationStatus === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังยืนยันอีเมลใหม่ของคุณ...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ยืนยันอีเมลใหม่สำเร็จ!
              </h3>
              <p className="text-gray-600 mb-4">
                อีเมลใหม่ของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบด้วยอีเมลใหม่ได้ทันที
              </p>
              <p className="text-gray-500 mb-4">
                กำลังนำคุณไปยังหน้าเข้าสู่ระบบใน {countdown} วินาที...
              </p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
              >
                เข้าสู่ระบบทันที
              </Link>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                เกิดข้อผิดพลาด
              </h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
              >
                กลับไปยังหน้าหลัก
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
