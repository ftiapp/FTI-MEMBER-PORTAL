'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyEmail() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        when: "beforeChildren", 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.95 }
  };
  
  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('ready'); // 'ready', 'verifying', 'success', 'error'
  const [message, setMessage] = useState('กรุณากดปุ่มยืนยันอีเมลด้านล่างเพื่อยืนยันอีเมลของคุณ');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setVerificationStatus('error');
      setMessage('ไม่พบโทเค็นยืนยัน');
      return;
    }
    setToken(tokenFromUrl);
    // ไม่ต้อง auto-verify แล้ว ให้ผู้ใช้กดปุ่มยืนยันเอง
    setVerificationStatus('ready');
    setMessage('กรุณากดปุ่มยืนยันอีเมลด้านล่างเพื่อยืนยันอีเมลของคุณ');
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
      <motion.section 
        className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom">
          <div className="py-16 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ยืนยันอีเมล
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-blue-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              ยืนยันอีเมลของคุณเพื่อเข้าใช้งานระบบ
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Verification Status */}
      <motion.section 
        className="py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              

              <AnimatePresence mode="wait">
                {verificationStatus === 'ready' && (
                  <motion.div 
                    className="space-y-6"
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div 
                      className="flex justify-center"
                      variants={itemVariants}
                    >
                      <motion.div 
                        className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"
                        variants={iconVariants}
                      >
                        <motion.svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-blue-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </motion.svg>
                      </motion.div>
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-semibold text-gray-800"
                      variants={itemVariants}
                    >
                      ยืนยันอีเมลของคุณ
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      variants={itemVariants}
                    >
                      {message}
                    </motion.p>
                    <motion.div 
                      className="pt-4 flex space-x-4 justify-center"
                      variants={itemVariants}
                    >
                      <motion.button 
                        onClick={handleVerify}
                        disabled={isSubmitting}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center"
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {isSubmitting && (
                          <motion.svg 
                            className="animate-spin h-5 w-5 mr-2 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </motion.svg>
                        )}
                        {isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยันอีเมลของฉัน'}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              
                {verificationStatus === 'verifying' && (
                  <motion.div 
                    className="space-y-6"
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div className="flex justify-center" variants={itemVariants}>
                      <motion.div 
                        className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </motion.div>
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-semibold text-gray-800"
                      variants={itemVariants}
                    >
                      กำลังยืนยันอีเมลของคุณ...
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      variants={itemVariants}
                    >
                      {message}
                    </motion.p>
                  </motion.div>
                )}
              
              
              
                {verificationStatus === 'success' && (
                  <motion.div 
                    className="space-y-6"
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div className="flex justify-center" variants={itemVariants}>
                      <motion.div 
                        className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-green-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </motion.svg>
                      </motion.div>
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-semibold text-gray-800"
                      variants={itemVariants}
                    >
                      ยืนยันอีเมลสำเร็จ
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      variants={itemVariants}
                    >
                      {message}
                    </motion.p>
                    <motion.div 
                      className="pt-4 flex space-x-4 justify-center"
                      variants={itemVariants}
                    >
                      <motion.div
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors">
                          เข้าสู่ระบบ
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {verificationStatus === 'error' && (
                  <motion.div 
                    className="space-y-6"
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div className="flex justify-center" variants={itemVariants}>
                      <motion.div 
                        className="bg-red-100 p-3 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <motion.svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-12 w-12 text-red-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          initial={{ rotate: 180, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                      </motion.div>
                    </motion.div>
                    <motion.h2 
                      className="text-2xl font-bold text-gray-800"
                      variants={itemVariants}
                    >
                      เกิดข้อผิดพลาด
                    </motion.h2>
                    <motion.p 
                      className="text-gray-600"
                      variants={itemVariants}
                    >
                      {message}
                    </motion.p>
                    <motion.div 
                      className="pt-4 space-y-3"
                      variants={itemVariants}
                    >
                      <motion.p 
                        className="text-gray-600"
                        variants={itemVariants}
                      >
                        หากคุณต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่
                      </motion.p>
                      <motion.div variants={itemVariants}>
                        <motion.div 
                          className="inline-block mr-3"
                          variants={buttonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Link href="/login" className="inline-block bg-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition duration-300">
                            เข้าสู่ระบบ
                          </Link>
                        </motion.div>
                        <motion.div 
                          className="inline-block"
                          variants={buttonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Link href="/register" className="inline-block bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                            ลงทะเบียนใหม่
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
}