'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ContactUs() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Submit the contact form data
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          subject: formData.subject,
          message: formData.message,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการส่งข้อความ');
      }
      
      // Reset form and show success message
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">ติดต่อเรา</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-medium text-black">ส่งข้อความถึงเรา</h3>
            <p className="text-sm text-black mt-1">หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณากรอกแบบฟอร์มด้านล่าง</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* User Info (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">ชื่อ</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-black"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1">อีเมล</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-black"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-black"
                />
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-black mb-1">เรื่องที่ติดต่อ <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="ระบุเรื่องที่ต้องการติดต่อ"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-black mb-1">ข้อความ <span className="text-red-500">*</span></label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="รายละเอียดข้อความที่ต้องการส่งถึงเรา"
              ></textarea>
            </div>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="p-3 bg-green-50 text-green-800 rounded-lg">
                ส่งข้อความเรียบร้อยแล้ว ขอบคุณสำหรับข้อความของท่าน
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
              </button>
            </div>
          </form>
          
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4 text-black">ช่องทางการติดต่อ</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-black">โทรศัพท์</h4>
                  <p className="text-black">02-345-1000</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-black">อีเมล</h4>
                  <p className="text-black">contact@fti.or.th</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-black">ที่อยู่</h4>
                  <p className="text-black">
                    สภาอุตสาหกรรมแห่งประเทศไทย<br />
                    ชั้น 8 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์<br />
                    เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ<br />
                    เขตสาทร กรุงเทพมหานคร 10120
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-black">เวลาทำการ</h4>
                  <p className="text-black">
                    จันทร์ - ศุกร์: 08:30 - 17:30 น.<br />
                    เสาร์ - อาทิตย์: ปิดทำการ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}