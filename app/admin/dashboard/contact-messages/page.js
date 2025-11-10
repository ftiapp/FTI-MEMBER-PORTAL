"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import MessageList from "./components/MessageList";
import MessageDetail from "./components/MessageDetail";
import FilterButtons from "./components/FilterButtons";

export default function ContactMessages() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read, replied
  const [unreadCount, setUnreadCount] = useState(0);

  // Reference to previous filter value for animation control
  const prevFilterRef = useRef(filter);

  // Count messages by status
  const messageCounts = {
    all: messages.length,
    unread: messages.filter(m => m.status === "unread").length,
    read: messages.filter(m => m.status === "read").length,
    replied: messages.filter(m => m.status === "replied").length,
  };

  // Fetch contact messages when component mounts
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchMessages();
  }, [user, router, filter]);

  // Poll unread count every 10 minutes
  useEffect(() => {
    let intervalId = null;
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/admin/contact-messages/unread-count");
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
        throw new Error("Failed to fetch contact messages");
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลข้อความติดต่อ");
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}/read`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to mark message as read");
      }

      // Update local state
      setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, status: "read" } : msg)));

      // If this is the selected message, update it
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: "read" });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านแล้ว");
    }
  };

  // Mark message as replied
  const markAsReplied = async (messageId) => {
    try {
      setIsSubmitting(true);

      // ตรวจสอบว่ามีข้อความตอบกลับหรือไม่
      if (!responseText || responseText.trim() === "") {
        toast.error("กรุณาระบุข้อความตอบกลับ");
        return;
      }

      const response = await fetch(`/api/admin/contact-messages/${messageId}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_response: responseText,
        }),
        // เพิ่ม cache: 'no-store' เพื่อป้องกันการใช้ข้อมูลเก่าจาก cache
        cache: "no-store",
      });

      // ตรวจสอบสถานะการตอบกลับ
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark message as replied");
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to mark message as replied");
      }

      // Update local state
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, status: "replied", admin_response: responseText } : msg,
        ),
      );

      // If this is the selected message, update it
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: "replied", admin_response: responseText });
      }

      toast.success("บันทึกการตอบกลับเรียบร้อยแล้ว");
      setResponseText("");
    } catch (error) {
      console.error("Error marking message as replied:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกการตอบกลับ");
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
    window.open(mailtoLink, "_blank");
  };

  // Handle message selection
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    // Ensure we always set a string value
    setResponseText(message.admin_response ? String(message.admin_response) : "");

    // If message is unread, mark it as read
    if (message.status === "unread") {
      markAsRead(message.id);
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      >
        {/* Header with gradient */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-7 h-7 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            ข้อความติดต่อจากสมาชิก
            {unreadCount > 0 && (
              <motion.span
                className="ml-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm px-3 py-1 rounded-full font-semibold shadow-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {unreadCount} ข้อความใหม่
              </motion.span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            จัดการข้อความติดต่อจากสมาชิกและตอบกลับ
          </p>
        </div>

        {/* Status Cards */}
        <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              filter === "all"
                ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => setFilter("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 font-medium mb-1">ทั้งหมด</div>
                <div className="text-2xl font-bold text-gray-900">{messageCounts.all}</div>
              </div>
              <div className={`p-2 rounded-full ${filter === "all" ? "bg-blue-500" : "bg-gray-200"}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              filter === "unread"
                ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => setFilter("unread")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 font-medium mb-1">ยังไม่อ่าน</div>
                <div className="text-2xl font-bold text-gray-900">{messageCounts.unread}</div>
              </div>
              <div className={`p-2 rounded-full ${filter === "unread" ? "bg-yellow-400" : "bg-gray-200"}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              filter === "read"
                ? "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => setFilter("read")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 font-medium mb-1">อ่านแล้ว</div>
                <div className="text-2xl font-bold text-gray-900">{messageCounts.read}</div>
              </div>
              <div className={`p-2 rounded-full ${filter === "read" ? "bg-blue-500" : "bg-gray-200"}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              filter === "replied"
                ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => setFilter("replied")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 font-medium mb-1">ตอบกลับแล้ว</div>
                <div className="text-2xl font-bold text-gray-900">{messageCounts.replied}</div>
              </div>
              <div className={`p-2 rounded-full ${filter === "replied" ? "bg-green-500" : "bg-gray-200"}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switch - Improved design */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-2 rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              ทั้งหมด ({messageCounts.all})
            </div>
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              filter === "unread"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
              ยังไม่อ่าน ({messageCounts.unread})
            </div>
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              filter === "read"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              อ่านแล้ว ({messageCounts.read})
            </div>
          </button>
          <button
            onClick={() => setFilter("replied")}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              filter === "replied"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              ตอบกลับแล้ว ({messageCounts.replied})
            </div>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 border-2 border-dashed border-red-300 rounded-xl bg-gradient-to-br from-red-50 to-rose-50">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium text-lg">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 font-medium text-lg">
              ไม่พบข้อความติดต่อที่มีสถานะ{" "}
              {filter === "all"
                ? "ทั้งหมด"
                : filter === "unread"
                  ? "ยังไม่อ่าน"
                  : filter === "read"
                    ? "อ่านแล้ว"
                    : "ตอบกลับแล้ว"}
            </p>
            <p className="text-gray-500 text-sm mt-1">ลองเลือกสถานะอื่นเพื่อดูข้อความที่มีอยู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}