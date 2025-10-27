"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function RejectionConversationsTable({ rejectionId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rejectionId) {
      fetchConversations();
    }
  }, [rejectionId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/membership/rejected-applications/${rejectionId}/conversations`
      );
      const result = await response.json();

      if (result.success) {
        setConversations(result.data || []);
      } else {
        setError(result.message || "Failed to fetch conversations");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  const getSenderLabel = (senderType) => {
    return senderType === "admin" ? "ฝ่ายทะเบียนสมาชิก" : "ผู้สมัครสมาชิก";
  };

  const getSenderBadgeColor = (senderType) => {
    return senderType === "admin"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: th });
    } catch (e) {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        ไม่มีประวัติการสื่อสาร
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              ผู้ส่ง
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              วันที่ - เวลา
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              ข้อความ
            </th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((conv, idx) => (
            <tr
              key={conv.id || idx}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              {/* Sender */}
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSenderBadgeColor(
                    conv.sender_type
                  )}`}
                >
                  {getSenderLabel(conv.sender_type)}
                </span>
              </td>

              {/* DateTime */}
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formatDateTime(conv.created_at)}
              </td>

              {/* Message */}
              <td className="px-4 py-3 text-sm text-gray-700">
                <div className="max-w-md">
                  <p className="break-words whitespace-pre-wrap">
                    {conv.message || "-"}
                  </p>
                  {conv.attachments && conv.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        ไฟล์แนบ:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {conv.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          >
                            📎 {att.name || `ไฟล์ ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
