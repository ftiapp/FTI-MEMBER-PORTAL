'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

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
    }
    setError('');
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
    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
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
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="container-custom">
          <div className="py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              สมัครสมาชิก
            </h1>
            <p className="text-lg md:text-xl text-blue-100">
              เข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ <span className="text-xs text-gray-500">(ไม่ต้องใส่คำนำหน้า)</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
                </button>
                
                <Link 
                  href="/"
                  className="block w-full text-center px-8 py-3 border-2 border-blue-700 text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300"
                >
                  กลับหน้าหลัก
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}