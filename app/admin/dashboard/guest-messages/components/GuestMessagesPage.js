// app/admin/dashboard/guest-messages/components/GuestMessagesPage.js

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../../components/AdminLayout";
import GuestContactMessageStats from "../../../components/GuestContactMessageStats";
import MessageList from "./MessageList";
import MessageDetail from "./MessageDetail";
import { useGuestMessages } from "../hooks/useGuestMessages";

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
    addSampleData,
  } = useGuestMessages();

  const handleMessageClick = async (message) => {
    // Mark as read if unread
    if (message.status === "unread") {
      const success = await markAsRead(message.id);
      if (success) {
        // Update selected message with new status
        setSelectedMessage({ ...message, status: "read" });
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
        ...result,
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
        ...result,
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
        assigned_to: adminName,
      });
    }

    return adminName;
  };

  // Count messages by status
  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount = messages.filter((m) => m.status === "read").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;
  const closedCount = messages.filter((m) => m.status === "closed").length;

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gray-100 shadow-lg rounded-xl p-6 border border-gray-200"
        style={{ color: "#111827" }}
      >
        {/* Header with gradient */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-7 h-7 text-[#1e3a8a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            ข้อความติดต่อจากบุคคลทั่วไป
          </h1>
          <p className="text-sm text-gray-900 mt-1">
            จัดการและติดตามข้อความติดต่อจากผู้เยี่ยมชมเว็บไซต์
          </p>
        </div>

        {/* Status Cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unread Messages */}
          <div className="p-5 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-md transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  ยังไม่อ่าน
                </div>
                <div className="text-3xl font-bold text-gray-900">{unreadCount}</div>
              </div>
              <div className="p-3 rounded-full bg-red-400">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Read Messages */}
          <div className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  อ่านแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{readCount}</div>
              </div>
              <div className="p-3 rounded-full bg-blue-400">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Replied Messages */}
          <div className="p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  ตอบกลับแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{repliedCount}</div>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Closed Messages */}
          <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:shadow-md transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ปิดการติดต่อ
                </div>
                <div className="text-3xl font-bold text-gray-900">{closedCount}</div>
              </div>
              <div className="p-3 rounded-full bg-gray-400">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
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
      </motion.div>
    </AdminLayout>
  );
}
