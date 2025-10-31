"use client";

import { useState } from "react";

/**
 * Conversation Timeline Component
 *
 * Displays conversation history between Admin and User
 * Supports adding new comments
 */

export default function ConversationTimeline({
  conversations = [],
  onAddComment,
  currentUserType = "user", // 'user' or 'admin'
  isLoading = false,
}) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case "rejection":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      case "resubmission":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        );
      case "approval":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "admin_comment":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case "user_comment":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getMessageTypeLabel = (messageType) => {
    const labels = {
      rejection: "ปฏิเสธใบสมัคร",
      resubmission: "ส่งใบสมัครใหม่",
      approval: "อนุมัติใบสมัคร",
      admin_comment: "ความคิดเห็นจากเจ้าหน้าที่",
      user_comment: "ความคิดเห็นจากผู้สมัคร",
      system: "ระบบ",
    };
    return labels[messageType] || messageType;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">ประวัติการสนทนา</h3>
        <span className="text-sm text-gray-500">{conversations.length} ข้อความ</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        {conversations.length > 0 && (
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        )}

        {/* Messages */}
        <div className="space-y-6">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>ยังไม่มีการสนทนา</p>
            </div>
          ) : (
            conversations.map((conv, index) => (
              <div key={conv.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">{getMessageIcon(conv.type)}</div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{conv.authorName}</p>
                        <p className="text-xs text-gray-500">{getMessageTypeLabel(conv.type)}</p>
                      </div>
                      <time className="text-xs text-gray-500">{formatDate(conv.createdAt)}</time>
                    </div>

                    {/* Message */}
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{conv.message}</p>
                    </div>

                    {/* Status change badge */}
                    {conv.statusAfter !== null && conv.statusAfter !== undefined && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            conv.statusAfter === 1
                              ? "bg-green-100 text-green-800"
                              : conv.statusAfter === 2
                                ? "bg-red-100 text-red-800"
                                : conv.statusAfter === 3
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          สถานะ:{" "}
                          {conv.statusAfter === 0
                            ? "รอพิจารณา"
                            : conv.statusAfter === 1
                              ? "อนุมัติ"
                              : conv.statusAfter === 2
                                ? "ปฏิเสธ"
                                : conv.statusAfter === 3
                                  ? "ส่งใหม่แล้ว"
                                  : "อื่นๆ"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      {onAddComment && (
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">เพิ่มความคิดเห็น</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="พิมพ์ข้อความของคุณที่นี่..."
            disabled={isSubmitting}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
