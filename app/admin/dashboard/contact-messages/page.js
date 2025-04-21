'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import AdminLayout from '@/app/admin/components/AdminLayout';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ContactMessages() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read, replied
  
  // Fetch contact messages when component mounts
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchMessages();
  }, [user, router, filter]);
  
  // Reference to previous filter value for animation control
  const prevFilterRef = useRef(filter);

  // Fetch contact messages from API
  const fetchMessages = async () => {
    // Store previous filter for animation purposes
    prevFilterRef.current = filter;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/contact-messages?status=${filter}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลข้อความติดต่อ');
    } finally {
      setLoading(false);
    }
  };
  
  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}/read`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      
      // If this is the selected message, update it
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านแล้ว');
    }
  };

  // Mark message as replied
  const markAsReplied = async (messageId) => {
    try {
      setIsSubmitting(true);
      
      // ตรวจสอบว่ามีข้อความตอบกลับหรือไม่
      if (!responseText || responseText.trim() === '') {
        toast.error('กรุณาระบุข้อความตอบกลับ');
        return;
      }
      
      const response = await fetch(`/api/admin/contact-messages/${messageId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          admin_response: responseText 
        }),
        // เพิ่ม cache: 'no-store' เพื่อป้องกันการใช้ข้อมูลเก่าจาก cache
        cache: 'no-store'
      });
      
      // ตรวจสอบสถานะการตอบกลับ
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark message as replied');
      }
      
      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to mark message as replied');
      }
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied', admin_response: responseText } : msg
      ));
      
      // If this is the selected message, update it
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'replied', admin_response: responseText });
      }
      
      toast.success('บันทึกการตอบกลับเรียบร้อยแล้ว');
      setResponseText('');
    } catch (error) {
      console.error('Error marking message as replied:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกการตอบกลับ');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Send email reply
  const sendEmailReply = () => {
    if (!selectedMessage) return;
    
    // Create mailto link with pre-filled subject and recipient
    const subject = `Re: ${selectedMessage.subject}`;
    const body = `\n\n\n----- ข้อความเดิม -----\n${selectedMessage.message}`;
    const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open default email client
    window.open(mailtoLink, '_blank');
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
  
  // Handle message selection
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    // Ensure we always set a string value
    setResponseText(message.admin_response ? String(message.admin_response) : '');
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread':
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">ใหม่</span>;
      case 'read':
        return <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium">อ่านแล้ว</span>;
      case 'replied':
        return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">ตอบกลับแล้ว</span>;
      default:
        return null;
    }
  };
  
  // Count unread messages
  const unreadCount = messages.filter(msg => msg.status === 'unread').length;
  
  // Animation variants for smoother transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Transition settings
  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}>
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-black-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            ข้อความติดต่อจากสมาชิก
            {unreadCount > 0 && (
              <motion.span 
                className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {unreadCount} ข้อความใหม่
              </motion.span>
            )}
          </motion.h1>
          
          <motion.div 
            className="flex space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow'
              }`}
            >
              ยังไม่อ่าน
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                filter === 'read'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow'
              }`}
            >
              อ่านแล้ว
            </button>
            <button
              onClick={() => setFilter('replied')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                filter === 'replied'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow'
              }`}
            >
              ตอบกลับแล้ว
            </button>
          </motion.div>
        </div>
        
                    {loading ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6 text-center text-red-600 font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6 text-center text-black font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ไม่พบข้อความติดต่อที่มีสถานะ {
              filter === 'all' ? 'ทั้งหมด' : 
              filter === 'unread' ? 'ยังไม่อ่าน' : 
              filter === 'read' ? 'อ่านแล้ว' : 'ตอบกลับแล้ว'
            }
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Message List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-bold text-black text-lg">รายการข้อความ</h2>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                {messages.map((message) => (
                  <motion.div 
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage && selectedMessage.id === message.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    } ${message.status === 'unread' ? 'font-semibold' : ''}`}
                    whileHover={{ backgroundColor: "#f9fafb", x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black truncate">{message.subject}</h3>
                        <p className="text-sm text-black truncate font-semibold">{message.name}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {getStatusBadge(message.status)}
                      </div>
                    </div>
                    <p className="text-xs text-black mt-1 font-semibold">{formatDate(message.created_at)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Message Detail */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
              {selectedMessage ? (
                <div className="h-full flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="text-xl font-bold text-black">{selectedMessage.subject}</h3>
                      <div>
                        {getStatusBadge(selectedMessage.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black font-semibold">
                      <div>
                        <span className="font-bold text-black">จาก:</span> {selectedMessage.name}
                      </div>
                      <div>
                        <span className="font-bold text-black">อีเมล:</span> {selectedMessage.email}
                      </div>
                      <div>
                        <span className="font-bold text-black">เบอร์โทร:</span> {selectedMessage.phone || '-'}
                      </div>
                      <div>
                        <span className="font-bold text-black">วันที่:</span> {formatDate(selectedMessage.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white flex-grow overflow-y-auto">
                    <div className="mb-6">
                      <h4 className="font-bold text-black mb-2 text-base">ข้อความ:</h4>
                      <div className="bg-white p-4 rounded-lg border border-black">
                        <p className="whitespace-pre-wrap text-black font-semibold">{selectedMessage.message}</p>
                      </div>
                    </div>
                    
                    {selectedMessage.admin_response && (
                      <div>
                        <h4 className="font-bold text-black mb-2 text-base">การตอบกลับของผู้ดูแลระบบ:</h4>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-500">
                          <p className="whitespace-pre-wrap text-black font-semibold">{selectedMessage.admin_response}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 border-t bg-white">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="responseText" className="block text-sm font-bold text-black mb-1">
                          บันทึกการตอบกลับ:
                        </label>
                        <textarea
                          id="responseText"
                          rows="4"
                          className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                          placeholder="บันทึกรายละเอียดการตอบกลับ เช่น วิธีการตอบกลับ, เนื้อหาโดยย่อ (ข้อความนี้มีไว้เพื่อแจ้งเตือนว่าไดทำการตอบกลับเรียบร้อยแล้วเท่านั้น)"
                          value={responseText}
                          onChange={(e) => setResponseText(String(e.target.value))}
                        ></textarea>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={sendEmailReply}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            เปิดอีเมลเพื่อตอบกลับ
                          </span>
                        </button>
                        
                        <button
                          onClick={() => markAsReplied(selectedMessage.id)}
                          disabled={isSubmitting || !(responseText && typeof responseText === 'string' && responseText.trim())}
                          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium ${
                            isSubmitting || !(responseText && typeof responseText === 'string' && responseText.trim())
                              ? 'bg-black text-white cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกว่าตอบกลับแล้ว'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-lg text-black font-bold">เลือกข้อความเพื่อดูรายละเอียด</p>
                  <p className="text-sm text-black font-semibold mt-2">คลิกที่ข้อความในรายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  );
}