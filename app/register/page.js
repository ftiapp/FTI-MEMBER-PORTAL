'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (name === 'password') {
        checkPasswordStrength(value);
      }
    }
    
    setError('');
  };
  
  const checkPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    
    setPasswordCriteria(criteria);
    
    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const allCriteriaPassed = Object.values(criteria).every(Boolean);
    
    if (passedCriteria === 0) {
      setPasswordStrength(0);
    } else if (passedCriteria <= 2) {
      setPasswordStrength(1);
    } else if (!allCriteriaPassed) {
      setPasswordStrength(2);
    } else {
      setPasswordStrength(3);
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }
    if (passwordStrength < 3) {
      setError('รหัสผ่านไม่ปลอดภัยเพียงพอ ต้องผ่านทุกเกณฑ์และมีความแข็งแกร่งเต็มหลอด');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }
    if (!formData.phone.match(/^[0-9]{10}$/)) {
      setError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }

      router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
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
        
        {/* Register icon - ซ่อนในมือถือ */}
        {!isMobile && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 8V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 11H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            สมัครสมาชิก
          </h1>
          <motion.div 
            className="w-24 h-1 bg-white mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto">
            เข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-8 text-center"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              ลงทะเบียน
              <motion.div 
                className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.h2>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              {/* Toast Notification for Errors */}
              {error && (
                <motion.div 
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="bg-red-100 p-2 rounded-full">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-800 mb-1">พบข้อผิดพลาด</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError('')} 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ <span className="text-xs text-red-500">(ไม่ต้องใส่คำนำหน้า)</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="นามสกุล"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0812345678"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-gray-900"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">ความแข็งแกร่งของรหัสผ่าน:</span>
                        <span className="text-xs font-medium">
                          {passwordStrength === 0 && <span className="text-gray-500">ยังไม่ได้กรอก</span>}
                          {passwordStrength === 1 && <span className="text-red-500">อ่อน (ไม่ปลอดภัย)</span>}
                          {passwordStrength === 2 && <span className="text-yellow-500">ปานกลาง (ไม่เพียงพอ)</span>}
                          {passwordStrength === 3 && <span className="text-green-500">แข็งแกร่ง </span>}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${passwordStrength === 1 ? 'bg-red-500' : passwordStrength === 2 ? 'bg-yellow-500' : passwordStrength === 3 ? 'bg-green-500' : 'bg-gray-300'}`}
                          style={{ width: `${(passwordStrength / 3) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="font-medium text-gray-700">รหัสผ่านต้องประกอบด้วย:</p>
                        <ul className="space-y-1 pl-1">
                          <li className="flex items-center">
                            {passwordCriteria.length ? 
                              <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                              <X className="h-4 w-4 text-red-500 mr-2" />}
                            <span className={passwordCriteria.length ? "text-green-700" : "text-gray-600"}>
                              อย่างน้อย 8 ตัวอักษร
                            </span>
                          </li>
                          <li className="flex items-center">
                            {passwordCriteria.uppercase ? 
                              <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                              <X className="h-4 w-4 text-red-500 mr-2" />}
                            <span className={passwordCriteria.uppercase ? "text-green-700" : "text-gray-600"}>
                              ตัวอักษรภาษาอังกฤษตัวใหญ่ (A-Z)
                            </span>
                          </li>
                          <li className="flex items-center">
                            {passwordCriteria.lowercase ? 
                              <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                              <X className="h-4 w-4 text-red-500 mr-2" />}
                            <span className={passwordCriteria.lowercase ? "text-green-700" : "text-gray-600"}>
                              ตัวอักษรภาษาอังกฤษตัวเล็ก (a-z)
                            </span>
                          </li>
                          <li className="flex items-center">
                            {passwordCriteria.number ? 
                              <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                              <X className="h-4 w-4 text-red-500 mr-2" />}
                            <span className={passwordCriteria.number ? "text-green-700" : "text-gray-600"}>
                              ตัวเลข (0-9)
                            </span>
                          </li>
                          <li className="flex items-center">
                            {passwordCriteria.special ? 
                              <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                              <X className="h-4 w-4 text-red-500 mr-2" />}
                            <span className={passwordCriteria.special ? "text-green-700" : "text-gray-600"}>
                              อักขระพิเศษ (เช่น ! @ # $ % ^ & *)
                            </span>
                          </li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">ตัวอย่างรหัสผ่านที่ปลอดภัย: <code>Abc123!@#</code>, <code>P@ssw0rd2023</code></p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-gray-900"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center mb-2">
                    <input
                      id="consent"
                      type="checkbox"
                      checked={formData.consent || false}
                      onChange={e => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="consent" className="text-gray-700 text-sm">
                      ฉันยอมรับ
                      <Link href="/privacy-policy" className="text-blue-600 underline mx-1" target="_blank">นโยบายความเป็นส่วนตัว</Link>
                      และ
                      <Link href="/terms-of-service" className="text-blue-600 underline mx-1" target="_blank">เงื่อนไขการใช้บริการ</Link>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.consent}
                    className={`w-full px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold transition-all duration-300 ${
                      isSubmitting || !formData.consent ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-gray-600">
                      มีบัญชีอยู่แล้ว?{' '}
                      <Link
                        href="/login"
                        className="text-blue-700 hover:text-blue-600 font-semibold"
                      >
                        เข้าสู่ระบบ
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}