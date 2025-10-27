"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function RejectedConversations({ 
  rejectionId,
  conversationCount 
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // TODO: Implement fetch conversations
  // TODO: Implement send message

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ประวัติการสื่อสาร
        </h3>
        <span className="text-sm text-gray-500">
          {conversationCount || 0} ข้อความ
        </span>
      </div>

      {conversationCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">ยังไม่มีการสื่อสาร</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TODO: Map conversations here */}
          <p className="text-sm text-gray-500">กำลังพัฒนา...</p>
        </div>
      )}
    </motion.div>
  );
}
