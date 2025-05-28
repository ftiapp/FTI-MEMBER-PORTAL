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
  const [passwordStrength, setPasswordStrength] = useState(0); // 0: none, 1: weak, 2: medium, 3: strong
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
    
    // ถ้าผู้ใช้ล็อกอินแล้ว ให้ redirect ไปที่หน้า dashboard
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ถ้าเป็นช่องเบอร์โทรศัพท์ ตรวจสอบว่าเป็นตัวเลขเท่านั้น
    if (name === 'phone') {
      // อนุญาตเฉพาะตัวเลขเท่านั้น
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
      
      // ตรวจสอบความแข็งแกร่งของรหัสผ่าน
      if (name === 'password') {
        checkPasswordStrength(value);
      }
    }
    
    setError('');
  };
  
  // ฟังก์ชันตรวจสอบความแข็งแกร่งของรหัสผ่าน
  const checkPasswordStrength = (password) => {
    // ตรวจสอบเงื่อนไขต่างๆ
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    
    setPasswordCriteria(criteria);
    
    // คำนวณความแข็งแกร่ง - ต้องผ่านทุกเกณฑ์จึงจะถือว่าแข็งแกร่ง
    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const allCriteriaPassed = Object.values(criteria).every(Boolean);
    
    if (passedCriteria === 0) {
      setPasswordStrength(0); // ไม่มีรหัสผ่าน
    } else if (passedCriteria <= 2) {
      setPasswordStrength(1); // อ่อน
    } else if (!allCriteriaPassed) {
      setPasswordStrength(2); // ปานกลาง
    } else {
      setPasswordStrength(3); // แข็งแกร่ง (ผ่านทุกเกณฑ์)
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
    // ตรวจสอบความซับซ้อนของรหัสผ่าน - ต้องแข็งแกร่งที่สุดเท่านั้น (ระดับ 3)
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
      // รวมชื่อและนามสกุล
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

      // เมื่อลงทะเบียนสำเร็จ ให้นำผู้ใช้ไปยังหน้าแจ้งให้ตรวจสอบอีเมล
      router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // สลับการแสดงรหัสผ่าน
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // สลับการแสดงยืนยันรหัสผ่าน
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.main 
      className="min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />

      {/* Hero Section - Consistent with other pages */}
      <motion.div 
        className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-blue-800 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
        
        {/* Register icon */}
        <motion.div 
          className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 8V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 11H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-4 text-center"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          >
            สมัครสมาชิก
          </motion.h1>
          <motion.div 
            className="w-24 h-1 bg-white mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <motion.p 
            className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            เข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
          </motion.p>
        </div>
      </motion.div>

      {/* Registration Form */}
      <motion.section 
        className="py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="container-custom">
          <motion.div 
            className="max-w-xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.form 
              onSubmit={handleSubmit} 
              className="bg-white rounded-xl shadow-lg p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              {/* Toast Notification for Errors */}
              {error && (
                <motion.div 
                  className="fixed top-24 right-5 z-[10000] p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg max-w-md flex items-start gap-3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-red-100 p-2 rounded-full">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">พบข้อผิดพลาด</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError('')} 
                    className="text-gray-500 hover:text-gray-700 ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              <div className="space-y-6">
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
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !formData.consent}
                  className={`w-full px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold transition-all duration-300 ${
                    isSubmitting || !formData.consent ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  สมัครสมาชิก
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </motion.main>
  );
}