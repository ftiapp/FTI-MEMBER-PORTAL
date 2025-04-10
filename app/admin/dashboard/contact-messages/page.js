'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

export default function ContactMessages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const messagesPerPage = 10;
  
  // Fetch contact messages when component mounts or search/page changes
  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const search = searchParams.get('search') || '';
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';
    
    setCurrentPage(page);
    setSearchTerm(search);
    setStartDate(start);
    setEndDate(end);
    
    fetchMessages(page, search, start, end);
  }, [searchParams]);
  
  // Fetch contact messages from API
  const fetchMessages = async (page = 1, search = '', startDate = '', endDate = '') => {
    try {
      setLoading(true);
      let url = `/api/admin/contact-messages?page=${page}&limit=${messagesPerPage}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (startDate) {
        url += `&start=${encodeURIComponent(startDate)}`;
      }
      
      if (endDate) {
        url += `&end=${encodeURIComponent(endDate)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      setTotalMessages(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / messagesPerPage));
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
  
  // Handle search and filter
  const handleSearch = (e) => {
    e.preventDefault();
    let url = `/admin/dashboard/contact-messages?page=1`;
    
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    if (startDate) {
      url += `&start=${encodeURIComponent(startDate)}`;
    }
    
    if (endDate) {
      url += `&end=${encodeURIComponent(endDate)}`;
    }
    
    router.push(url);
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    
    let url = `/admin/dashboard/contact-messages?page=${page}`;
    
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    if (startDate) {
      url += `&start=${encodeURIComponent(startDate)}`;
    }
    
    if (endDate) {
      url += `&end=${encodeURIComponent(endDate)}`;
    }
    
    router.push(url);
  };
  
  // Handle mark as responded
  const handleMarkAsResponded = async (messageId) => {
    // แสดงกล่องยืนยันก่อนที่จะบันทึกการตอบกลับ
    const confirmResponse = window.confirm('คุณต้องการบันทึกการตอบกลับข้อความนี้หรือไม่?');
    
    if (!confirmResponse) {
      return; // ถ้าผู้ใช้กด Cancel ให้ยกเลิกการทำงาน
    }
    
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 1, // ควรใช้ ID ของ admin ที่ login อยู่
          adminName: 'Admin' // ควรใช้ชื่อของ admin ที่ login อยู่
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as responded');
      }
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied', admin_response: true } : msg
      ));
      
      // If this is the selected message, update it
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'replied', admin_response: true });
      }
      
      alert('บันทึกการตอบกลับเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error marking message as responded:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการตอบกลับ');
    }
  };

  // Handle email click to send email
  const handleEmailClick = (email, subject) => {
    if (email) {
      // Create a formatted subject line with the original subject
      const emailSubject = `RE: ${subject || 'ข้อความติดต่อจากสมาชิก'}`;
      
      // Create mailto URL
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}`;
      
      // Open email client
      window.location.href = mailtoUrl;
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold">ข้อความติดต่อจากสมาชิก</h2>
                <p className="text-sm text-gray-500">ข้อความติดต่อและข้อคิดเห็นจากสมาชิก</p>
              </div>
              
              <form onSubmit={handleSearch} className="mt-3 md:mt-0 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหาข้อความ..."
                      className="px-3 py-2 border rounded-l-lg w-full md:w-64 text-black"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                    >
                      ค้นหา
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-black">จากวันที่:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-2 py-2 border rounded text-black text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-black">ถึงวันที่:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-2 py-2 border rounded text-black text-sm"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">ไม่พบข้อความที่ตรงกับการค้นหา</div>
          ) : (
            <div className="flex flex-col md:flex-row">
              {/* Message List */}
              <div className="w-full md:w-1/3 border-r">
                <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
                  {messages.length > 0 ? messages.map((message) => (
                    <div 
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedMessage && selectedMessage.id === message.id ? 'bg-blue-50' : ''
                      } ${message.status === 'unread' ? 'font-semibold' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium truncate text-black">{message.subject}</h3>
                          <p className="text-sm text-black truncate">{message.name}</p>
                        </div>
                        {message.status === 'unread' && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">ใหม่</span>
                        )}
                        {message.status === 'replied' && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">ตอบกลับแล้ว</span>
                        )}
                      </div>
                      <p className="text-xs text-black mt-1">{formatDate(message.created_at)}</p>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-500">ไม่พบข้อความที่ตรงกับการค้นหา</div>
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center p-4 border-t">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 mr-2 disabled:opacity-50"
                    >
                      &laquo; ก่อนหน้า
                    </button>
                    
                    <div className="mx-2 text-sm">
                      หน้า {currentPage} จาก {totalPages}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 ml-2 disabled:opacity-50"
                    >
                      ถัดไป &raquo;
                    </button>
                  </div>
                )}
              </div>
              
              {/* Message Detail */}
              <div className="w-full md:w-2/3 p-6">
                {selectedMessage ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 text-black">{selectedMessage.subject}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-black">
                        <div>
                          <span className="font-medium text-black">จาก:</span> {selectedMessage.name}
                        </div>
                        <div>
                          <span className="font-medium text-black">อีเมล:</span>{' '}
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handleEmailClick(selectedMessage.email, selectedMessage.subject);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedMessage.email}
                          </a>
                        </div>
                        <div>
                          <span className="font-medium text-black">เบอร์โทร:</span> {selectedMessage.phone || '-'}
                        </div>
                        <div>
                          <span className="font-medium text-black">วันที่:</span> {formatDate(selectedMessage.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="whitespace-pre-wrap text-black">{selectedMessage.message}</p>
                    </div>
                    
                    {/* Admin response section */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-green-800 font-medium mr-2">สถานะ:</span>
                        {selectedMessage.status === 'unread' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">ยังไม่อ่าน</span>
                        )}
                        {selectedMessage.status === 'read' && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">อ่านแล้ว</span>
                        )}
                        {selectedMessage.status === 'replied' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">ตอบกลับแล้ว</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {selectedMessage.status !== 'replied' && (
                          <button
                            onClick={() => handleMarkAsResponded(selectedMessage.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            บันทึกการตอบกลับ
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEmailClick(selectedMessage.email, selectedMessage.subject)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          ตอบกลับทางอีเมล
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-black">
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
      </div>
    </AdminLayout>
  );
}