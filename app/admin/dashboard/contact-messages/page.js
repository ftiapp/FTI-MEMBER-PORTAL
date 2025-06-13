'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import AdminLayout from '../../../components/AdminLayout';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import MessageList from './components/MessageList';
import MessageDetail from './components/MessageDetail';
import FilterButtons from './components/FilterButtons';

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
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Reference to previous filter value for animation control
  const prevFilterRef = useRef(filter);

  // Fetch contact messages when component mounts
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchMessages();
  }, [user, router, filter]);

  // Poll unread count every 10 minutes
  useEffect(() => {
    let intervalId = null;
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/contact-messages/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread || 0);
        }
      } catch (err) {
        // ignore error
      }
    };
    fetchUnreadCount(); // initial fetch
    intervalId = setInterval(fetchUnreadCount, 10 * 60 * 1000); // 10 min
    return () => intervalId && clearInterval(intervalId);
  }, []);
  
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

  // unreadCount is now fetched from API and polled every 10 minutes
  
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
          
          <FilterButtons filter={filter} setFilter={setFilter} />
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
            <MessageList 
              messages={messages} 
              selectedMessage={selectedMessage} 
              onSelectMessage={handleSelectMessage} 
            />
            
            {/* Message Detail */}
            <MessageDetail 
              selectedMessage={selectedMessage}
              responseText={responseText}
              setResponseText={setResponseText}
              isSubmitting={isSubmitting}
              onMarkAsReplied={markAsReplied}
              onSendEmailReply={sendEmailReply}
            />
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  );
}