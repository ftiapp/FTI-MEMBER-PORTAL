import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import FormInput from './FormInput';
import PasswordInput from './PasswordInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';

function RegisterForm() {
  const router = useRouter();
  const errorMessageRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(''); // เพิ่ม error state
  const [success, setSuccess] = useState(''); // เพิ่ม success state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // เลื่อนหน้าจอไปยังข้อความแจ้งเตือนเมื่อมีข้อผิดพลาด
  useEffect(() => {
    if (error && errorMessageRef.current) {
      errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // ล้าง error เมื่อมีการเปลี่ยนแปลง
    setError('');
    setSuccess('');
    
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return false;
    }

    // ตรวจสอบให้ชื่อและนามสกุลเป็นภาษาไทยเท่านั้น
    const thaiRegex = /^[\u0E00-\u0E7F\s]+$/;
    if (!thaiRegex.test(formData.firstName) || !thaiRegex.test(formData.lastName)) {
      setError('กรุณากรอกชื่อและนามสกุลเป็นภาษาไทยเท่านั้น');
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
    
    if (!formData.consent) {
      setError('กรุณายอมรับเงื่อนไขการใช้บริการและนโยบายความเป็นส่วนตัว');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
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
      
      if (response.ok) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังนำท่านไปยังหน้าตรวจสอบอีเมล');
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        // แสดง error บนหน้าเว็บ
        const errorMsg = data.error || data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน';
        setError(errorMsg);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      setIsSubmitting(false);
    }
  };

  return (
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
            {/* Error Message */}
            {error && (
              <div ref={errorMessageRef} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="ชื่อ"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
                  autoComplete="given-name"
                  pattern="^[\u0E00-\u0E7F\s]+$"
                  title="กรุณากรอกเป็นภาษาไทยเท่านั้น"
                  required
                  note="(ไม่ต้องใส่คำนำหน้า)"
                />
                <FormInput
                  label="นามสกุล"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="นามสกุล"
                  autoComplete="family-name"
                  pattern="^[\u0E00-\u0E7F\s]+$"
                  title="กรุณากรอกเป็นภาษาไทยเท่านั้น"
                  required
                />
              </div>

              <FormInput
                label="อีเมล"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                autoComplete="email"
                required
              />

              <FormInput
                label="เบอร์โทรศัพท์"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0812345678"
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />

              <div>
                <PasswordInput
                  label="รหัสผ่าน"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                
                <PasswordStrengthMeter 
                  password={formData.password}
                  passwordStrength={passwordStrength}
                  passwordCriteria={passwordCriteria}
                />
              </div>

              <PasswordInput
                label="ยืนยันรหัสผ่าน"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <div className="mt-8 space-y-4">
                <div className="flex items-center mb-2">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="consent" className="text-gray-700 text-sm">
                    ฉันยอมรับ
                    <Link href="/privacy-policy" className="text-blue-600 underline mx-1" target="_blank">
                      นโยบายความเป็นส่วนตัว
                    </Link>
                    และ
                    <Link href="/terms-of-service" className="text-blue-600 underline mx-1" target="_blank">
                      เงื่อนไขการใช้บริการ
                    </Link>
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.consent}
                  className={`w-full px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold transition-all duration-300 ${
                    isSubmitting || !formData.consent ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600">
                    มีบัญชีอยู่แล้ว?{' '}
                    <Link
                      href="/login"
                      className="text-blue-700 hover:text-blue-600 font-semibold transition-colors"
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
  );
}

export default RegisterForm;