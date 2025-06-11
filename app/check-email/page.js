'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CheckEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [isMobile, setIsMobile] = useState(false);
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error, password_reset
  const [errorMessage, setErrorMessage] = useState('');useEffect(() => {
    // เพิ่มการตรวจสอบ email parameter
    const email = searchParams.get('email');
    
    // ถ้ามี email แต่ไม่มี token = มาจากหน้าลงทะเบียน
    if (email && !token) {
      setVerificationStatus('registration_success');
      setNewEmail(email); // เก็บ email ไว้แสดงในหน้า
      return;
    }
    
    // โค้ดเดิมสำหรับกรณีมี token
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('ไม่พบโทเคนยืนยัน กรุณาตรวจสอบลิงก์ในอีเมลของคุณอีกครั้ง');
      return;
    }
    
    // โค้ดเดิมสำหรับการตรวจสอบ token...
    const verifyNewEmail = async () => {
      // ...
    };
  
    verifyNewEmail();
  }, [token, searchParams]);{verificationStatus === 'registration_success' && (
    <motion.div 
      className="space-y-6"
      key="registration_success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">
        ลงทะเบียนสำเร็จ!
      </h3>
      <p className="text-gray-600">
        เราได้ส่งอีเมลยืนยันไปยัง <span className="font-semibold">{email}</span> แล้ว
      </p>
      <p className="text-gray-600">
        กรุณาตรวจสอบกล่องจดหมายของคุณและคลิกที่ลิงก์ยืนยันเพื่อเปิดใช้งานบัญชีของคุณ
      </p>
      <div className="pt-4">
        <Link 
          href="/login" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors text-lg"
        >
          กลับไปยังหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </motion.div>
  )}
  const [userId, setUserId] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // กรณีมาจากหน้าลงทะเบียน (มี email แต่ไม่มี token)
    if (email && !token) {
      setVerificationStatus('registration_success');
      setNewEmail(email);
      return;
    }
    
    // กรณีเข้าหน้านี้โดยตรงโดยไม่มี token
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
          // เมื่อยืนยันอีเมลสำเร็จ ให้แสดงฟอร์มตั้งรหัสผ่านใหม่
          setVerificationStatus('password_reset');
          setUserId(data.userId);
          setNewEmail(data.newEmail);
          toast.success('ยืนยันอีเมลใหม่สำเร็จ กรุณาตั้งรหัสผ่านใหม่');
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
  }, [token, email]);

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password reset form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password requirements
    if (passwordData.password.length < 8) {
      toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    
    // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    if (!passwordRegex.test(passwordData.password)) {
      toast.error('รหัสผ่านต้องประกอบด้วยตัวอักษรพิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข และอักขระพิเศษ');
      return;
    }
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/user/reset-password-after-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword: passwordData.password,
          token
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationStatus('success');
        toast.success('ตั้งรหัสผ่านใหม่สำเร็จ คุณสามารถเข้าสู่ระบบด้วยอีเมลใหม่และรหัสผ่านใหม่ได้ทันที');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
        {/* Decorative elements - ซ่อนในมือถือ */}
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
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ยืนยันอีเมลใหม่
          </motion.h1>
          <motion.div 
            className="w-24 h-1 bg-white mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.p 
            className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            ยืนยันอีเมลใหม่และตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </motion.p>
        </div>
      </div>

      {/* Verification Content */}
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

          <div className="max-w-md mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/FTI-MasterLogo_RGB_forLightBG.png"
                    alt="FTI Logo"
                    width={180}
                    height={60}
                    priority
                  />
                </div>

                <AnimatePresence mode="wait">
                  {verificationStatus === 'registration_success' && (
                    <motion.div 
                      className="text-center"
                      key="registration_success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-8 w-8 text-green-600" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        ลงทะเบียนสำเร็จ!
                      </h2>
                      <p className="text-gray-600 mb-2">
                        เราได้ส่งอีเมลยืนยันไปยัง <span className="font-semibold">{newEmail || email}</span>
                      </p>
                      <p className="text-gray-600 mb-6">
                        กรุณาตรวจสอบกล่องจดหมายของคุณและคลิกที่ลิงก์ยืนยันเพื่อเปิดใช้งานบัญชีของคุณ
                      </p>
                      <Link 
                        href="/login" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors"
                      >
                        กลับไปยังหน้าเข้าสู่ระบบ
                      </Link>
                    </motion.div>
                  )}
                  {verificationStatus === 'verifying' && (
                    <motion.div 
                      className="text-center"
                      key="verifying"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        ยืนยันอีเมลใหม่
                      </h2>

                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                      <p className="text-gray-600">กำลังยืนยันอีเมลใหม่ของคุณ...</p>
                    </motion.div>
                  )}

                  {verificationStatus === 'password_reset' && (
                    <motion.div
                      key="password_reset"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        ตั้งรหัสผ่านใหม่
                      </h2>

                      <div className="flex justify-center mb-4">
                        <motion.svg
                          className="w-16 h-16 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </motion.svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                        ยืนยันอีเมลใหม่สำเร็จ!
                      </h3>
                      <p className="text-gray-600 mb-6 text-center">
                        อีเมลใหม่ <span className="font-semibold">{newEmail}</span> ได้รับการยืนยันเรียบร้อยแล้ว<br />
                        กรุณาตั้งรหัสผ่านใหม่เพื่อเข้าสู่ระบบ
                      </p>
                      
                      <motion.form 
                        onSubmit={handlePasswordSubmit} 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่านใหม่
                            <span className="text-red-600 text-xs ml-2">(A-Z, a-z, 0-9, อักขระพิเศษ เช่น ** อย่างน้อย 8 ตัว)</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              value={passwordData.password}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            ยืนยันรหัสผ่านใหม่
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="ยืนยันรหัสผ่านใหม่"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังดำเนินการ...
                              </span>
                            ) : 'ตั้งรหัสผ่านใหม่และเข้าสู่ระบบ'}
                          </motion.button>
                        </div>
                      </motion.form>
                    </motion.div>
                  )}

                  {verificationStatus === 'success' && (
                    <motion.div 
                      className="text-center"
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-center mb-4">
                        <motion.svg
                          className="w-16 h-16 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </motion.svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        ตั้งรหัสผ่านใหม่สำเร็จ!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        คุณสามารถเข้าสู่ระบบด้วยอีเมลใหม่และรหัสผ่านใหม่ได้ทันที
                      </p>
                      <p className="text-gray-500 mb-4">
                        กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href="/login"
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                        >
                          เข้าสู่ระบบทันที
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}

                  {verificationStatus === 'error' && (
                    <motion.div 
                      className="text-center"
                      key="error"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-center mb-4">
                        <motion.svg
                          className="w-16 h-16 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </motion.svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        เกิดข้อผิดพลาด
                      </h3>
                      <p className="text-gray-600 mb-6">{errorMessage}</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href="/"
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                        >
                          กลับไปยังหน้าหลัก
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}