'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';

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
  const [userMessages, setUserMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Create a ref to track if a request is in progress
  const isSubmitting = useRef(false);
  
  // Timeout ref for clearing success message
  const successTimeoutRef = useRef(null);
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
      
      // Fetch user's contact messages
      fetchUserMessages();
    }
    
    // Cleanup function to clear any timeouts when component unmounts
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [user]);
  
  // Fetch user's contact messages
  const fetchUserMessages = async () => {
    if (!user || !user.id) return;
    
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/contact/user-messages?userId=${user.id}`);
      
      if (response.status === 401) {
        console.log('Authentication required to fetch messages');
        setUserMessages([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setUserMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching user messages:', error);
      setUserMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success message when user starts typing again
    if (success) {
      setSuccess(false);
    }
    
    // Clear error when user starts typing again
    if (error) {
      setError('');
    }
  };
  
  // Handle form submission with debounce protection
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting.current || loading) {
      return;
    }
    
    // Validate form data
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // Set loading state and prevent new submissions
    setLoading(true);
    isSubmitting.current = true;
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
      
      // Automatically refresh the messages list
      fetchUserMessages();
      
      // Auto-hide success message after 5 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
      
      // Allow new submissions after a short delay to prevent accidental double-clicks
      setTimeout(() => {
        isSubmitting.current = false;
      }, 300);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status icon based on message status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread':
        return <FaEnvelope className="text-yellow-600" size={18} />;
      case 'read':
        return <FaEnvelopeOpen className="text-blue-600" size={18} />;
      case 'replied':
        return <FaCheckCircle className="text-green-600" size={18} />;
      default:
        return <FaEnvelope className="text-gray-500" size={18} />;
    }
  };
  
  // Get status text based on message status
  const getStatusText = (status) => {
    switch (status) {
      case 'unread':
        return 'ยังไม่ได้อ่าน';
      case 'read':
        return 'อ่านแล้ว';
      case 'replied':
        return 'ตอบกลับแล้ว';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };
  
  // Get status badge class based on message status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <FaEnvelope className="text-blue-700" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-blue-900">ติดต่อเรา</h2>
      </div>
      
      {/* User's previous messages */}
      {userMessages.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <div className="space-y-4">
            <div className="pb-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800">ข้อความที่เคยส่ง</h3>
              <p className="text-sm text-gray-600 mt-1">ข้อความที่คุณเคยส่งถึงเรา</p>
            </div>
            
            <div className="overflow-x-auto">
              {messagesLoading ? (
                <div className="flex justify-center items-center py-6">
                  <FaHourglassHalf className="animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">กำลังโหลดข้อความ...</span>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">เรื่อง</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">วันที่ส่ง</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{message.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(message.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(message.status)}`}>
                              {getStatusIcon(message.status)}
                              <span className="ml-1.5">{getStatusText(message.status)}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
        <div className="space-y-6">
          <div className="pb-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800">ส่งข้อความถึงเรา</h3>
            <p className="text-sm text-gray-600 mt-1">หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณากรอกแบบฟอร์มด้านล่าง</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Info (Read-only) */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-2">
              <h4 className="font-medium text-blue-800 mb-3">ข้อมูลผู้ติดต่อ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    id="phone"
                    value={formData.phone}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">เรื่องที่ติดต่อ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border ${error && !formData.subject ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-gray-700 shadow-sm transition-colors disabled:bg-gray-100 disabled:text-gray-500`}
                  placeholder="ระบุเรื่องที่ต้องการติดต่อ"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">ข้อความ <span className="text-red-500">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border ${error && !formData.message ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-gray-700 shadow-sm transition-colors disabled:bg-gray-100 disabled:text-gray-500`}
                  placeholder="รายละเอียดข้อความที่ต้องการส่งถึงเรา"
                ></textarea>
              </div>
            </div>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center shadow-sm animate-fade-in">
                <FaCheckCircle className="text-green-500 mr-3" size={20} />
                <span>ส่งข้อความเรียบร้อยแล้ว ขอบคุณสำหรับข้อความของท่าน</span>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-center shadow-sm animate-fade-in">
                <FaTimesCircle className="text-red-500 mr-3" size={20} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className={`px-6 py-3 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'} text-white rounded-lg transition-all disabled:opacity-70 font-medium shadow-sm hover:shadow-md transform ${!loading && 'hover:-translate-y-1'} active:translate-y-0 active:shadow-sm`}
                disabled={loading || isSubmitting.current}
                style={{ minWidth: '160px' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FaHourglassHalf className="animate-spin mr-2" />
                    กำลังส่ง...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaEnvelope className="mr-2" />
                    ส่งข้อความ
                  </span>
                )}
              </button>
            </div>
          </form>
          
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4 text-black">ช่องทางการติดต่อ</h3>
            
            {/* Contact information cards with improved styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Contact details */}
              <div className="space-y-4">
                {/* Phone */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-black">โทรศัพท์</h4>
                      <p className="text-black text-lg font-medium mt-1">02-345-1000</p>
                    </div>
                  </div>
                </div>
                
                {/* Email */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-black">อีเมล</h4>
                      <p className="text-black text-lg font-medium mt-1">contact@fti.or.th</p>
                    </div>
                  </div>
                </div>
                
                {/* Operating Hours */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-black">เวลาทำการ</h4>
                      <div className="text-black mt-1">
                        <p className="font-medium">จันทร์ - ศุกร์: <span className="text-blue-700">08:30 - 17:30 น.</span></p>
                        <p>เสาร์ - อาทิตย์: <span className="text-red-600">ปิดทำการ</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Address and Map */}
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-3 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg text-black">ที่อยู่</h4>
                    <div className="text-black mt-2 space-y-1">
                      <p className="font-medium">สภาอุตสาหกรรมแห่งประเทศไทย</p>
                      <p>ชั้น 8 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์</p>
                      <p>เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ</p>
                      <p>เขตสาทร กรุงเทพมหานคร 10120</p>
                    </div>
                    
                    {/* Map placeholder - could be replaced with an actual map component */}
                    <div className="mt-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center border border-gray-200">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p className="text-sm text-gray-600 mt-1">คลิกเพื่อดูแผนที่</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add some global CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}