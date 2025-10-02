"use client";

import React from "react";
import { FaHourglassHalf, FaEnvelope, FaEnvelopeOpen, FaCheckCircle } from "react-icons/fa";
import { LoadingOverlay } from "../../shared";

const UserMessages = ({ messages, loading }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status icon based on message status
  const getStatusIcon = (status) => {
    switch (status) {
      case "unread":
        return <FaEnvelope className="text-yellow-600" size={18} />;
      case "read":
        return <FaEnvelopeOpen className="text-blue-600" size={18} />;
      case "replied":
        return <FaCheckCircle className="text-green-600" size={18} />;
      default:
        return <FaEnvelope className="text-gray-500" size={18} />;
    }
  };

  // Get status text based on message status
  const getStatusText = (status) => {
    switch (status) {
      case "unread":
        return "ยังไม่ได้อ่าน";
      case "read":
        return "อ่านแล้ว";
      case "replied":
        return "ตอบกลับแล้ว";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  // Get status badge class based on message status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "unread":
        return "bg-yellow-100 text-yellow-800";
      case "read":
        return "bg-blue-100 text-blue-800";
      case "replied":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (messages.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
      <div className="space-y-4">
        <div className="pb-4 border-b border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800">ข้อความที่เคยส่ง</h3>
          <p className="text-sm text-gray-600 mt-1">ข้อความที่คุณเคยส่งถึงเรา</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <LoadingOverlay isVisible={true} message="กำลังโหลดข้อความ..." inline={true} />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider"
                  >
                    เรื่อง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider"
                  >
                    วันที่ส่ง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider"
                  >
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {message.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(message.status)}`}
                        >
                          {getStatusIcon(message.status)}
                          <span className="ml-1.5">{getStatusText(message.status)}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessages;
