'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import AdminHeader from '@/app/admin/components/AdminHeader';

export default function ContactMessages() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Fetch contact messages when component mounts
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchMessages();
  }, [user, router]);
  
  // Fetch contact messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact-messages');
      
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
  
  // Handle message selection
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader title="ข้อความติดต่อ" />
        
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">ข้อความติดต่อจากสมาชิก</h2>
              <p className="text-sm text-gray-500">ข้อความติดต่อและข้อคิดเห็นจากสมาชิก</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : messages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">ไม่พบข้อความติดต่อ</div>
            ) : (
              <div className="flex flex-col md:flex-row">
                {/* Message List */}
                <div className="w-full md:w-1/3 border-r">
                  <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedMessage && selectedMessage.id === message.id ? 'bg-blue-50' : ''
                        } ${message.status === 'unread' ? 'font-semibold' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium truncate">{message.subject}</h3>
                            <p className="text-sm text-gray-600 truncate">{message.name}</p>
                          </div>
                          {message.status === 'unread' && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">ใหม่</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(message.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Detail */}
                <div className="w-full md:w-2/3 p-6">
                  {selectedMessage ? (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">จาก:</span> {selectedMessage.name}
                          </div>
                          <div>
                            <span className="font-medium">อีเมล:</span> {selectedMessage.email}
                          </div>
                          <div>
                            <span className="font-medium">เบอร์โทร:</span> {selectedMessage.phone || '-'}
                          </div>
                          <div>
                            <span className="font-medium">วันที่:</span> {formatDate(selectedMessage.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                      
                      {/* Admin response section could be added here if needed */}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>เลือกข้อความเพื่อดูรายละเอียด</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
