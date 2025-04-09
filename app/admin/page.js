'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

/**
 * Admin Login Component
 * 
 * This component provides the login interface for admin users.
 * It authenticates users against the admin_users table and redirects
 * to the appropriate dashboard based on the admin's permission level.
 * 
 * - Regular admins (levels 1-4) are redirected to /admin/dashboard
 * - SuperAdmins (level 5) are redirected to /admin/super
 */

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  /**
   * Handles form input changes
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles the login form submission
   * Validates inputs, authenticates the user, and redirects to the appropriate dashboard
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('เข้าสู่ระบบสำเร็จ');
        
        // Redirect based on admin level
        if (result.adminLevel === 5) {
          router.push('/admin/super');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        toast.error(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1e3a8a]">
          เข้าสู่ระบบผู้ดูแล
        </h2>
        <p className="mt-2 text-center text-sm text-[#1e3a8a] text-opacity-70">
          สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10 border border-[#1e3a8a] border-opacity-20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#1e3a8a]">
                ชื่อผู้ใช้
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1e3a8a]">
                รหัสผ่าน
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#1e3a8a] border-opacity-20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
