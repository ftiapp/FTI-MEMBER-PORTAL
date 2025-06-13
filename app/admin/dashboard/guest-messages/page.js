'use client';

import { useState, useEffect } from 'react';
import { AdminInfo } from '../../../components/AdminSidebar';
import AdminLayout from '../../../components/AdminLayout';
import GuestContactMessageStats from '../../../components/GuestContactMessageStats';
import { toast } from 'react-hot-toast';

export default function GuestMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status labels in Thai
  const statusLabels = {
    unread: 'ยังไม่อ่าน',
    read: 'อ่านแล้ว',
    replied: 'ตอบกลับ',
    closed: 'ปิดการติดต่อ'
  };

  // Status colors
  const statusColors = {
    unread: 'bg-red-100 text-red-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  // Priority labels in Thai
  const priorityLabels = {
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง'
  };

  // Priority colors
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, filterStatus]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log('Fetching guest messages...');
      
      // Encode search term to prevent URL issues
      const encodedSearch = encodeURIComponent(searchTerm || '');
      
      const response = await fetch(
        `/api/admin/guest-messages?page=${currentPage}&status=${filterStatus}&search=${encodedSearch}`,
        {
          cache: 'no-store',
          next: { revalidate: 0 }
        }
      );

      console.log('Response status:', response.status);
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Failed to fetch guest messages: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          // Try to parse the error as JSON
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson && errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (jsonError) {
            // If parsing fails, use the text as is
            if (errorText && errorText.length > 0) {
              errorMessage = errorText;
            }
          }
        } catch (textError) {
          console.error('Error getting response text:', textError);
        }
        
        throw new Error(errorMessage);
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response format from server');
      }

      // Handle successful response
      if (data.success) {
        setMessages(data.messages || []);
        setTotalPages(data.totalPages || 1);
        
        // If no messages found, show a message but not as an error
        if ((data.messages || []).length === 0) {
          setError('ไม่พบข้อความที่ตรงกับเงื่อนไขการค้นหา');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch guest messages');
      }
    } catch (err) {
      console.error('Error fetching guest messages:', err);
      setError(err.message);
      setMessages([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMessages();
  };

  const handleMessageClick = async (message) => {
    try {
      // If message is unread, mark it as read
      if (message.status === 'unread') {
        const response = await fetch(`/api/admin/guest-messages/${message.id}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to mark message as read');
        }

        // Update the message status in the list
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, status: 'read' } : m
        ));
      }

      setSelectedMessage(message);
    } catch (err) {
      console.error('Error marking message as read:', err);
      toast.error('เกิดข้อผิดพลาดในการอ่านข้อความ');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error('กรุณากรอกข้อความ Remark');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/admin/guest-messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remark: replyText })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to save remark');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('บันทึก Remark เรียบร้อยแล้ว');
        
        // Update the message status in the list
        setMessages(messages.map(m => 
          m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
        ));
        
        // Update the selected message
        setSelectedMessage({
          ...selectedMessage,
          status: 'replied',
          reply_message: replyText,
          replied_at: new Date().toISOString()
        });
        
        // Clear the reply text
        setReplyText('');
      } else {
        throw new Error(data.message || 'Failed to save remark');
      }
    } catch (err) {
      console.error('Error saving remark:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก Remark');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseMessage = async () => {
    try {
      const response = await fetch(`/api/admin/guest-messages/${selectedMessage.id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to close message');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('ปิดการติดต่อเรียบร้อยแล้ว');
        
        // Update the message status in the list
        setMessages(messages.map(m => 
          m.id === selectedMessage.id ? { ...m, status: 'closed' } : m
        ));
        
        // Update the selected message
        setSelectedMessage({
          ...selectedMessage,
          status: 'closed',
          closed_at: new Date().toISOString()
        });
      } else {
        throw new Error(data.message || 'Failed to close message');
      }
    } catch (err) {
      console.error('Error closing message:', err);
      toast.error('เกิดข้อผิดพลาดในการปิดการติดต่อ');
    }
  };

  const handleAssignToMe = async () => {
    try {
      const response = await fetch(`/api/admin/guest-messages/${selectedMessage.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to assign message');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('รับผิดชอบข้อความนี้เรียบร้อยแล้ว');
        
        // Update the selected message
        setSelectedMessage({
          ...selectedMessage,
          assigned_to: data.adminName
        });
        
        // Update the message in the list
        setMessages(messages.map(m => 
          m.id === selectedMessage.id ? { ...m, assigned_to: data.adminName } : m
        ));
      } else {
        throw new Error(data.message || 'Failed to assign message');
      }
    } catch (err) {
      console.error('Error assigning message:', err);
      toast.error('เกิดข้อผิดพลาดในการรับผิดชอบข้อความ');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ข้อความติดต่อจากบุคคลทั่วไป</h1>
        
        <div className="mb-8">
          <GuestContactMessageStats title="สถิติข้อความติดต่อจากบุคคลทั่วไป" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">รายการข้อความ</h2>
              
              {/* Search and Filter */}
              <div className="mb-4">
                <form onSubmit={handleSearch} className="flex mb-2">
                  <input
                    type="text"
                    placeholder="ค้นหาโดยชื่อ, อีเมล, หรือหัวข้อ"
                    className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                  >
                    ค้นหา
                  </button>
                </form>
                
                <select
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="unread">ยังไม่อ่าน</option>
                  <option value="read">อ่านแล้ว</option>
                  <option value="replied">ตอบกลับแล้ว</option>
                  <option value="closed">ปิดการติดต่อ</option>
                </select>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-600">
                  <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-600 text-center">
                  <p className="mb-4">ไม่พบข้อความติดต่อ</p>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/sample-guest-messages');
                        const data = await response.json();
                        if (data.success) {
                          toast.success(`เพิ่มข้อมูลตัวอย่างจำนวน ${data.count} รายการ`);
                          fetchMessages();
                        } else {
                          toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง');
                        }
                      } catch (err) {
                        console.error('Error loading sample data:', err);
                        toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    เพิ่มข้อมูลตัวอย่าง
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium truncate">{message.subject}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[message.status]}`}>
                          {statusLabels[message.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                        {message.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[message.priority]}`}>
                            {priorityLabels[message.priority]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <nav className="flex items-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md mr-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ก่อนหน้า
                    </button>
                    <span className="text-sm">
                      หน้า {currentPage} จาก {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md ml-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ถัดไป
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
          
          {/* Message Detail */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
            {selectedMessage ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedMessage.status]}`}>
                      {statusLabels[selectedMessage.status]}
                    </span>
                    {selectedMessage.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[selectedMessage.priority]}`}>
                        {priorityLabels[selectedMessage.priority]}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">จาก</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">อีเมล</p>
                    <p className="font-medium">
                      <a 
                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} 
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {selectedMessage.email}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                    <p className="font-medium">{selectedMessage.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วันที่ส่ง</p>
                    <p className="font-medium">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">ข้อความ</p>
                  <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
                
                {selectedMessage.assigned_to ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">ผู้รับผิดชอบ</p>
                    <p className="font-medium">{selectedMessage.assigned_to}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <button
                      onClick={handleAssignToMe}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      รับผิดชอบข้อความนี้
                    </button>
                  </div>
                )}
                
                {selectedMessage.reply_message && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">ข้อความตอบกลับ ({formatDate(selectedMessage.replied_at)})</p>
                    <div className="p-3 bg-green-50 rounded-md whitespace-pre-wrap">
                      {selectedMessage.reply_message}
                    </div>
                  </div>
                )}
                
                {selectedMessage.status !== 'closed' && (
                  <div>
                    {selectedMessage.status !== 'replied' ? (
                      <form onSubmit={handleReply} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          บันทึก Remark (สำหรับแอดมินเท่านั้น)
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          rows="5"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="พิมพ์บันทึกหรือ remark เกี่ยวกับการจัดการข้อความนี้..."
                          required
                        ></textarea>
                        <div className="flex justify-between items-center">
                          <a 
                            href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            ส่งอีเมลถึงผู้ติดต่อ
                          </a>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting || !replyText.trim()}
                          >
                            {submitting ? 'กำลังบันทึก...' : 'บันทึก Remark'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mb-4 flex space-x-4">
                        <a 
                          href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          ส่งอีเมลถึงผู้ติดต่อ
                        </a>
                        <button
                          onClick={handleCloseMessage}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          ปิดการติดต่อ
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedMessage.closed_at && (
                  <div className="text-sm text-gray-600">
                    ปิดการติดต่อเมื่อ {formatDate(selectedMessage.closed_at)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>เลือกข้อความเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
