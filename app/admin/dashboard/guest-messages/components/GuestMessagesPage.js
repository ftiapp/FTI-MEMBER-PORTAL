// app/admin/dashboard/guest-messages/components/GuestMessagesPage.js

'use client';

import { useState } from 'react';
import AdminLayout from '@/app/admin/components/AdminLayout';
import GuestContactMessageStats from '@/app/admin/components/GuestContactMessageStats';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';
import { useGuestMessages } from '../hooks/useGuestMessages';

export default function GuestMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  const {
    messages,
    loading,
    error,
    currentPage,
    totalPages,
    filterStatus,
    searchTerm,
    setCurrentPage,
    setFilterStatus,
    setSearchTerm,
    fetchMessages,
    markAsRead,
    replyToMessage,
    closeMessage,
    assignToMe,
    addSampleData
  } = useGuestMessages();

  const handleMessageClick = async (message) => {
    // Mark as read if unread
    if (message.status === 'unread') {
      const success = await markAsRead(message.id);
      if (success) {
        // Update selected message with new status
        setSelectedMessage({ ...message, status: 'read' });
      } else {
        setSelectedMessage(message);
      }
    } else {
      setSelectedMessage(message);
    }
  };

  const handleReply = async (messageId, replyText) => {
    const result = await replyToMessage(messageId, replyText);
    
    if (result) {
      // Update selected message
      setSelectedMessage({
        ...selectedMessage,
        ...result
      });
    }
    
    return result;
  };

  const handleClose = async (messageId) => {
    const result = await closeMessage(messageId);
    
    if (result) {
      // Update selected message
      setSelectedMessage({
        ...selectedMessage,
        ...result
      });
    }
    
    return result;
  };

  const handleAssign = async (messageId) => {
    const adminName = await assignToMe(messageId);
    
    if (adminName) {
      // Update selected message
      setSelectedMessage({
        ...selectedMessage,
        assigned_to: adminName
      });
    }
    
    return adminName;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ข้อความติดต่อจากบุคคลทั่วไป</h1>
        
        <div className="mb-8">
          <GuestContactMessageStats title="สถิติข้อความติดต่อจากบุคคลทั่วไป" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MessageList
            messages={messages}
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            selectedMessage={selectedMessage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            setCurrentPage={setCurrentPage}
            onMessageClick={handleMessageClick}
            onSearch={fetchMessages}
            onAddSampleData={addSampleData}
          />
          
          <MessageDetail
            selectedMessage={selectedMessage}
            onReply={handleReply}
            onClose={handleClose}
            onAssign={handleAssign}
          />
        </div>
      </div>
    </AdminLayout>
  );
}