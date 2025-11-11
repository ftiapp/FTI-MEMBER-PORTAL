// app/admin/dashboard/guest-messages/components/MessageDetail.js

import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  formatDate,
} from "../constants";
import ReplyForm from "./ReplyForm";

const MessageDetail = ({ selectedMessage, onReply, onClose, onAssign }) => {
  if (!selectedMessage) {
    return (
      <div className="lg:col-span-2 bg-gray-100 rounded-lg shadow-md p-4">
        <div className="flex flex-col items-center justify-center h-64 text-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-2"
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
          <p>เลือกข้อความเพื่อดูรายละเอียด</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-gray-100 rounded-lg shadow-md p-4">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
          <div className="flex space-x-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[selectedMessage.status]}`}
            >
              {STATUS_LABELS[selectedMessage.status]}
            </span>
            {selectedMessage.priority && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[selectedMessage.priority]}`}
              >
                {PRIORITY_LABELS[selectedMessage.priority]}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-900">จาก</p>
            <p className="font-medium">{selectedMessage.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">อีเมล</p>
            <p className="font-medium">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="text-blue-600 hover:underline flex items-center"
              >
                {selectedMessage.email}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-900">เบอร์โทรศัพท์</p>
            <p className="font-medium">{selectedMessage.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">วันที่ส่ง</p>
            <p className="font-medium">{formatDate(selectedMessage.created_at)}</p>
          </div>
          {selectedMessage.status !== "unread" && selectedMessage.read_by_admin_name && (
            <div>
              <p className="text-sm text-gray-900">อ่านโดย</p>
              <p className="font-medium">{selectedMessage.read_by_admin_name}</p>
            </div>
          )}
          {selectedMessage.status === "replied" && selectedMessage.replied_by_admin_name && (
            <div>
              <p className="text-sm text-gray-900">ตอบกลับโดย</p>
              <p className="font-medium">{selectedMessage.replied_by_admin_name}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-900 mb-1">ข้อความ</p>
          <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
            {selectedMessage.message}
          </div>
        </div>

        {selectedMessage.assigned_to ? (
          <div className="mb-4">
            <p className="text-sm text-gray-900">ผู้รับผิดชอบ</p>
            <p className="font-medium">{selectedMessage.assigned_to}</p>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={() => onAssign(selectedMessage.id)}
              className="px-4 py-2 bg-blue-600 text-gray-900 rounded-md hover:bg-blue-700"
            >
              รับผิดชอบข้อความนี้
            </button>
          </div>
        )}

        {selectedMessage.reply_message && (
          <div className="mb-6">
            <p className="text-sm text-gray-900 mb-1">
              ข้อความตอบกลับ ({formatDate(selectedMessage.replied_at)})
            </p>
            <div className="p-3 bg-green-50 rounded-md whitespace-pre-wrap">
              {selectedMessage.reply_message}
            </div>
          </div>
        )}

        {selectedMessage.status !== "closed" && (
          <ReplyForm message={selectedMessage} onReply={onReply} onClose={onClose} />
        )}

        {selectedMessage.closed_at && (
          <div className="text-sm text-gray-900">
            ปิดการติดต่อเมื่อ {formatDate(selectedMessage.closed_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDetail;
