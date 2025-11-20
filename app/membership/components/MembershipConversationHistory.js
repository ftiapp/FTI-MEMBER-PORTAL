"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MessageCircle, User, Shield, Clock } from "lucide-react";

export default function MembershipConversationHistory({ membershipType, membershipId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!membershipType || !membershipId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/membership/${membershipType}/${membershipId}/conversations`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          setError(result.message || "ไม่สามารถโหลดประวัติการสื่อสารได้");
          setConversations([]);
          return;
        }

        setConversations(result.data?.conversations || []);
      } catch (e) {
        console.error("Error loading membership conversations:", e);
        setError("เกิดข้อผิดพลาดในการโหลดประวัติการสื่อสาร");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [membershipType, membershipId]);

  const renderHeader = (countLabel) => (
    <div className="flex items-center gap-3 mb-4">
      <MessageCircle className="w-5 h-5 text-blue-600" />
      <h3 className="text-lg font-semibold text-gray-900">ประวัติการสื่อสาร</h3>
      {countLabel && (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {countLabel}
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        {renderHeader(null)}
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6 mb-6">
        {renderHeader(null)}
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        {renderHeader("0 ข้อความ")}
        <div className="text-center text-gray-500 py-6">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">ยังไม่มีประวัติการสื่อสารสำหรับใบสมัครนี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      {renderHeader(`${conversations.length} ข้อความ`)}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {conversations.map((conv) => {
          const isAdmin = conv.authorType === "admin";
          const createdAt = conv.createdAt ? new Date(conv.createdAt) : null;

          return (
            <div
              key={conv.id}
              className={`flex gap-3 p-4 rounded-lg border text-sm ${
                isAdmin ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex-shrink-0">
                {isAdmin ? (
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
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {isAdmin ? "ผู้ดูแลระบบ" : conv.authorName || "ผู้สมัคร"}
                  </span>

                  {createdAt && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                      <Clock className="w-3 h-3" />
                      {format(createdAt, "d MMM yyyy HH:mm", { locale: th })}
                    </span>
                  )}
                </div>

                <div className="text-gray-700 whitespace-pre-wrap break-words">
                  <span className="font-medium">ข้อความ :</span>{" "}
                  {conv.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function mapMessageTypeLabel(type) {
  switch (type) {
    case "rejection":
      return "การปฏิเสธ";
    case "resubmission":
      return "การส่งใหม่";
    case "admin_comment":
      return "ข้อความจากผู้ดูแลระบบ";
    case "user_comment":
      return "ข้อความจากผู้สมัคร";
    case "approval":
      return "การอนุมัติ";
    case "system":
      return "ระบบ";
    default:
      return type;
  }
}
