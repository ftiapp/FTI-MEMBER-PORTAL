'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaEnvelope } from 'react-icons/fa';
import ContactStepIndicator from './ContactStepIndicator';

const ContactForm = ({ user, onSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Update step based on form state
  useEffect(() => {
    if (success) {
      setCurrentStep(2); // Message sent, show confirmation step
    } else if (loading) {
      setCurrentStep(1); // Sending message
    } else if (formData.subject && formData.message) {
      setCurrentStep(1); // Form filled but not submitted
    } else {
      setCurrentStep(1); // Initial state
    }
  }, [success, loading, formData]);
  
  // Create a ref to track if a request is in progress
  const isSubmitting = useRef(false);
  
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
      
      // Notify parent component
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
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

  return (
    <div className="space-y-6">
      <ContactStepIndicator currentStep={currentStep} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
    </div>
  );
};

export default ContactForm;