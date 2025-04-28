'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    // ป้องกันการกดปุ่มซ้ำ
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        // ตรวจสอบว่าเป็นกรณีที่ต้องยืนยันอีเมลหรือไม่
        if (response.status === 403 && data.requiresVerification) {
          console.log('Email verification required, redirecting...');
          // ถ้าต้องยืนยันอีเมล ให้ redirect ไปที่หน้า verification-required
          setIsSubmitting(false); // ต้องรีเซ็ตสถานะก่อน redirect
          router.push(`/verification-required?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      // Login successful
      login(data.user);
      // Log login event
      try {
        const sessionId = data.sessionId || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}_${data.user.id}`);
        fetch('/api/auth/log-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: data.user.id,
            event_type: 'login',
            session_id: sessionId,
            user_agent: window.navigator.userAgent
          })
        });
      } catch (e) { /* ignore log errors */ }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const featureVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: i => ({ 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.2 + (i * 0.1),
        type: "spring",
        stiffness: 100
      }
    })
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-white text-lg font-semibold">กำลังเข้าสู่ระบบ...</div>
          </div>
        </div>
      )}
      <motion.main 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar />

      {/* Hero Section with Blue Gradient - Similar to Contact Page */}
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
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
            >
              เข้าสู่ระบบ
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-blue-100"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
            >
              เข้าถึงบริการสำหรับสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
          </div>
        </div>
      </motion.section>

      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Login Form */}
          <motion.div 
            className="w-full md:w-1/2 lg:w-2/5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden"
              variants={itemVariants}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-blue-700 p-6 text-white"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold">ยินดีต้อนรับ</h2>
                <p className="text-blue-100 mt-1">จัดการข้อมูลสมาชิกและบริการต่างๆ ของท่าน</p>
              </motion.div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div 
                      className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="email@example.com"
                      autoComplete="email"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-gray-900"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <motion.button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showPassword ? (
                          <span className="flex items-center justify-center h-5 w-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center h-5 w-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between"
                    variants={itemVariants}
                  >
                    <div className="text-sm">
                      <motion.div whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Link 
                          href="/forgot-password" 
                          className="font-medium text-blue-700 hover:text-blue-600"
                        >
                          ลืมรหัสผ่าน?
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                    disabled={isSubmitting}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    )}
                    {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </motion.button>

                  <motion.div 
                    className="text-center mt-4"
                    variants={itemVariants}
                  >
                    <p className="text-gray-600">
                      ยังไม่มีบัญชี?{' '}
                      <motion.span 
                        whileHover={{ x: 3 }} 
                        transition={{ type: "spring", stiffness: 300 }}
                        className="inline-block"
                      >
                        <Link
                          href="/register"
                          className="text-blue-700 hover:text-blue-600 font-semibold"
                        >
                          สมัครสมาชิก
                        </Link>
                      </motion.span>
                    </p>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div 
            className="w-full md:w-1/2 lg:w-3/5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-md p-6"
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">บริการสำหรับสมาชิก</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <motion.div 
                  className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-all"
                  custom={0}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">อัพเดตสมาชิก</h3>
                  <p className="text-gray-600">อัพเดตข้อมูลสมาชิกและเอกสารต่างๆ ของท่าน</p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                  className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-all"
                  custom={1}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">จัดการเอกสาร</h3>
                  <p className="text-gray-600">จัดการเอกสารและจัดการเอกสารสำคัญของท่าน</p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                  className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-all"
                  custom={2}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">ชำระค่าบริการ</h3>
                  <p className="text-gray-600">ชำระค่าบริการและตรวจสอบสถานะการชำระเงิน</p>
                </motion.div>

                {/* Feature 4 */}
                <motion.div 
                  className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-all"
                  custom={3}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">กิจกรรมล่าสุด</h3>
                  <p className="text-gray-600">ดูกิจกรรมและการอัพเดตล่าสุดของสภาอุตสาหกรรม</p>
                </motion.div>

                {/* Feature 5 */}
                <motion.div 
                  className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-all"
                  custom={4}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">ข้อมูลสมาชิก</h3>
                  <p className="text-gray-600">ดูข้อมูลสมาชิกและสิทธิประโยชน์ต่างๆ</p>
                </motion.div>

                {/* Feature 6 */}
                <motion.div 
                  className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-all"
                  custom={5}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">ติดต่อเรา</h3>
                  <p className="text-gray-600">ติดต่อเจ้าหน้าที่และขอความช่วยเหลือ</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </motion.main>
  </>
);
}