'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('ready'); // 'ready', 'verifying', 'success', 'error'
  const [message, setMessage] = useState('กรุณากดปุ่มยืนยันอีเมลด้านล่างเพื่อยืนยันอีเมลของคุณ');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // เก็บโทเค็นจาก URL แต่ยังไม่ยืนยันทันที
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      setVerificationStatus('error');
      setMessage('ไม่พบโทเค็นยืนยัน');
      return;
    }
    
    // เก็บโทเค็นไว้ใช้เมื่อกดปุ่มยืนยัน
    setToken(tokenFromUrl);
    
    // ตรวจสอบว่าโทเค็นถูกใช้ไปแล้วหรือไม่
    const checkTokenStatus = async () => {
      try {
        const checkResponse = await fetch(`/api/auth/check-verification?token=${tokenFromUrl}`);
        const checkData = await checkResponse.json();
        
        if (checkResponse.ok && checkData.verified) {
          // ถ้าอีเมลได้รับการยืนยันแล้ว
          setVerificationStatus('success');
          setMessage('อีเมลของคุณได้รับการยืนยันแล้ว คุณสามารถเข้าสู่ระบบได้');
          if (checkData.email) {
            setEmail(checkData.email);
          }
        }
      } catch (error) {
        console.error('Check verification error:', error);
      }
    };
    
    checkTokenStatus();
  }, [searchParams]);

  // ฟังก์ชันสำหรับการยืนยันอีเมลเมื่อกดปุ่ม
  const handleVerify = async () => {
    if (!token || isSubmitting) return;
    
    setIsSubmitting(true);
    setVerificationStatus('verifying');
    setMessage('กำลังยืนยันอีเมลของคุณ...');
    
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        setVerificationStatus('error');
        setMessage(data.error || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
        return;
      }
      
      setVerificationStatus('success');
      setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
      
      // ล็อกอินอัตโนมัติหลังจากยืนยันสำเร็จ
      if (data.email && data.password) {
        try {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
          });
          
          const loginData = await loginResponse.json();
          
          if (loginResponse.ok) {
            // เมื่อล็อกอินสำเร็จ ให้นำไปที่หน้า dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        } catch (error) {
          console.error('Auto login error:', error);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage('เกิดข้อผิดพลาดในการยืนยันอีเมล');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="container-custom">
          <div className="py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ยืนยันอีเมล
            </h1>
            <p className="text-lg md:text-xl text-blue-100">
              ยืนยันอีเมลของคุณเพื่อเข้าใช้งานระบบ
            </p>
          </div>
        </div>
      </section>

      {/* Verification Status */}
      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              {verificationStatus === 'verifying' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                  <p className="text-lg">{message}</p>
                </div>
              )}

              {verificationStatus === 'ready' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    ยืนยันอีเมลของท่าน
                  </h3>
                  <p className="text-gray-600">{message}</p>
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={handleVerify}
                      disabled={isSubmitting}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยันอีเมล'}
                    </button>
                  </div>
                </div>
              )}
              
              {verificationStatus === 'verifying' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                  <p className="text-lg">{message}</p>
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    ยืนยันอีเมลสำเร็จ
                  </h3>
                  <p className="text-gray-600">{message}</p>
                  <div className="pt-4 flex space-x-4 justify-center">
                    <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors">
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-red-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">เกิดข้อผิดพลาด</h2>
                  <p className="text-gray-600">{message}</p>
                  <div className="pt-4 space-y-3">
                    <p className="text-gray-600">หากคุณต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่</p>
                    <div>
                      <Link href="/login" className="inline-block bg-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition duration-300 mr-3">
                        เข้าสู่ระบบ
                      </Link>
                      <Link href="/register" className="inline-block bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                        ลงทะเบียนใหม่
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
