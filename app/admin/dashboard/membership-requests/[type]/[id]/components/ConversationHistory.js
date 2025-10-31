"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MessageCircle, User, Shield, Clock } from "lucide-react";

export default function ConversationHistory({ applicationId, membershipType }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [applicationId, membershipType]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/membership-requests/${membershipType}/${applicationId}/conversations`,
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">ประวัติการสื่อสาร</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>ยังไม่มีประวัติการสื่อสาร</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">ประวัติการสื่อสาร</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {conversations.length} ข้อความ
        </span>
      </div>

      <div className="space-y-4">
        {conversations.map((conv, index) => (
          <div
            key={conv.id}
            className={`flex gap-3 p-4 rounded-lg border ${
              conv.sender_type === "admin"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex-shrink-0">
              {conv.sender_type === "admin" ? (
                <div className="p-2 bg-blue-100 rounded-full">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
              ) : (
                <div className="p-2 bg-gray-200 rounded-full">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm text-gray-900">
                  {conv.sender_type === "admin" ? "ผู้ดูแลระบบ" : "ผู้สมัคร"}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {format(new Date(conv.created_at), "d MMM yyyy HH:mm", {
                    locale: th,
                  })}
                </div>
              </div>

              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {conv.message}
              </div>

              {conv.attachments && conv.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {conv.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-blue-600 hover:bg-blue-50"
                    >
                      📎 {attachment.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
