// app/admin/dashboard/guest-messages/components/MessageListItem.js

import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  formatDate,
} from "../constants";

const MessageListItem = ({ message, isSelected, onClick }) => {
  return (
    <div
      className={`p-3 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
      }`}
      onClick={() => onClick(message)}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium truncate">{message.subject}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[message.status]}`}>
          {STATUS_LABELS[message.status]}
        </span>
      </div>
      <p className="text-sm text-gray-600 truncate">{message.name}</p>
      {message.status !== "unread" && message.read_by_admin_name && (
        <p className="text-xs text-gray-500 truncate">อ่านโดย: {message.read_by_admin_name}</p>
      )}
      {message.status === "replied" && message.replied_by_admin_name && (
        <p className="text-xs text-gray-500 truncate">ตอบกลับโดย: {message.replied_by_admin_name}</p>
      )}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
        {message.priority && (
          <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[message.priority]}`}>
            {PRIORITY_LABELS[message.priority]}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageListItem;
