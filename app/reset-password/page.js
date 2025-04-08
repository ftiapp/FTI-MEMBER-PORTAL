'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '../components/Footer';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error', 'invalid-token'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setStatus('invalid-token');
      setMessage('โทเค็นไม่ถูกต้องหรือไม่ได้ระบุ');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.password || !formData.confirmPassword) {
      setStatus('error');
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    if (formData.password.length < 8) {
      setStatus('error');
      setMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setStatus('error');
      setMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setStatus('submitting');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      }

      setStatus('success');
      setMessage(data.message || 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว');
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/FTI-MasterLogo_RGB_forLightBG.png"
              alt="สภาอุตสาหกรรมแห่งประเทศไทย"
              width={150}
              height={60}
              priority
            />
          </Link>
        </div>
      </header>

      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold">ตั้งรหัสผ่านใหม่</h2>
              <p className="text-blue-100 mt-1">กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
            </div>
            
            <div className="p-6">
              {status === 'invalid-token' && (
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Link 
                      href="/forgot-password" 
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
                    >
                      ขอลิงก์รีเซ็ตรหัสผ่านใหม่
                    </Link>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-600">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Link 
                      href="/login" 
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
                    >
                      ไปยังหน้าเข้าสู่ระบบ
                    </Link>
                  </div>
                </div>
              )}

              {(status === 'idle' || status === 'error' || status === 'submitting') && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                      {message}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      disabled={status === 'submitting'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      disabled={status === 'submitting'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className={`w-full px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 ${
                      status === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {status === 'submitting' ? 'กำลังดำเนินการ...' : 'ตั้งรหัสผ่านใหม่'}
                  </button>

                  <div className="text-center mt-4">
                    <Link
                      href="/login"
                      className="text-blue-700 hover:text-blue-600 font-semibold"
                    >
                      กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
