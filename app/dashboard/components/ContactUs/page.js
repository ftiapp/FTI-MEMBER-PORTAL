'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { ContactForm, UserMessages, ContactInfo, ContactHeader } from './components';
import './components/styles.css';

export default function ContactUs() {
  const { user } = useAuth();
  const [userMessages, setUserMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Timeout ref for clearing success message
  const successTimeoutRef = useRef(null);
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
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
  
  return (
    <div className="space-y-6">
      <ContactHeader />
      
      {/* User's previous messages */}
      <UserMessages messages={userMessages} loading={messagesLoading} />
      
      <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
        <div className="space-y-6">
          <div className="pb-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800">ส่งข้อความถึงเรา</h3>
            <p className="text-sm text-gray-600 mt-1">หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณากรอกแบบฟอร์มด้านล่าง</p>
          </div>
          
          <ContactForm user={user} onSuccess={fetchUserMessages} />
          
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}