'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('กำลังตรวจสอบโทเค็น...');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (isInitialized) return;

    const initializeComponent = () => {
      try {
        const emailVerified = typeof window !== 'undefined' ? sessionStorage.getItem('emailVerified') : null;
        
        if (emailVerified === 'true') {
          setVerificationStatus('success');
          setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
          sessionStorage.removeItem('emailVerified');
          setIsInitialized(true);
          return;
        }

        const tokenFromUrl = searchParams.get('token');
        
        if (!tokenFromUrl) {
          setVerificationStatus('error');
          setMessage('ไม่พบโทเค็นยืนยัน กรุณาตรวจสอบลิงก์ที่ได้รับทางอีเมล');
          setIsInitialized(true);
          return;
        }

        setToken(tokenFromUrl);
        setVerificationStatus('ready');
        setMessage('กรุณากดปุ่มยืนยันอีเมลด้านล่างเพื่อยืนยันอีเมลของคุณ');
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setVerificationStatus('error');
        setMessage('เกิดข้อผิดพลาดในการโหลดหน้า');
        setIsInitialized(true);
      }
    };

    const timer = setTimeout(initializeComponent, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, isInitialized]);

  const startCountdown = () => {
    setCountdown(10);
  };

  const handleVerify = async () => {
    if (!token || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setVerificationStatus('verifying');
      setMessage('กำลังยืนยันอีเมลของคุณ...');
      
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }
      
      setTimeout(() => {
        setVerificationStatus('success');
        setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('emailVerified', 'true');
        }
        
        startCountdown();
      }, 1000);
      
    } catch (error) {
      console.error('Verification error:', error);
      setTimeout(() => {
        setVerificationStatus('error');
        setMessage(error.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section - ใช้แบบเดียวกับหน้าอื่น */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
        {/* ลด decorative elements ในมือถือ */}
        {!isMobile && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
          </>
        )}
        
        {/* Email verification icon - ซ่อนในมือถือ */}
        {!isMobile && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            ยืนยันอีเมล
          </h1>
          <motion.div 
            className="w-24 h-1 bg-white mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto">
            ยืนยันอีเมลของคุณเพื่อเข้าใช้งานระบบ
          </p>
        </div>
      </div>

      {/* Verification Status */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            สถานะการยืนยัน
            <motion.div 
              className="w-16 h-1 bg-blue-600 mx-auto mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.h2>

          <div className="max-w-xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {verificationStatus === 'ready' && (
                  <motion.div 
                    className="space-y-6"
                    key="ready"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-blue-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      ยืนยันอีเมลของคุณ
                    </h3>
                    <p className="text-gray-600">
                      {message}
                    </p>
                    <div className="pt-4">
                      <button 
                        onClick={handleVerify}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            กำลังยืนยัน...
                          </span>
                        ) : (
                          'ยืนยันอีเมลของฉัน'
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              
                {verificationStatus === 'verifying' && (
                  <motion.div 
                    className="space-y-6"
                    key="verifying"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="animate-spin">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      กำลังยืนยันอีเมลของคุณ...
                    </h3>
                    <p className="text-gray-600">
                      {message}
                    </p>
                  </motion.div>
                )}
              
                {verificationStatus === 'success' && (
                  <motion.div 
                    className="space-y-6"
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-8 w-8 text-green-600" 
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
                    <h3 className="text-2xl font-semibold text-gray-800">
                      ยืนยันอีเมลสำเร็จ!
                    </h3>
                    <p className="text-gray-600 text-lg">
                      ขอบคุณที่ยืนยันอีเมลของคุณ คุณสามารถเข้าสู่ระบบได้แล้ว
                    </p>
                    
                    {countdown > 0 && (
                      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800">
                          คุณสามารถเข้าสู่ระบบได้แล้ว หรือรอ <span className="font-bold">{countdown}</span> วินาที
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown/10) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Link 
                        href="/login" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors text-lg"
                      >
                        ไปที่หน้าเข้าสู่ระบบทันที
                      </Link>
                    </div>
                  </motion.div>
                )}

                {verificationStatus === 'error' && (
                  <motion.div 
                    className="space-y-6"
                    key="error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center">
                      <div className="bg-red-100 p-3 rounded-full">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-12 w-12 text-red-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      เกิดข้อผิดพลาด
                    </h3>
                    <p className="text-gray-600">
                      {message}
                    </p>
                    <div className="pt-4 space-y-4">
                      <p className="text-gray-600">
                        หากคุณต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link 
                          href="/login" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                          เข้าสู่ระบบ
                        </Link>
                        <Link 
                          href="/register" 
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                          ลงทะเบียนใหม่
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}