'use client';

import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/date';

export default function MessageList({ messages, selectedMessage, onSelectMessage }) {
  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-bold text-black text-lg">รายการข้อความ</h2>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
        {messages.map((message) => (
          <motion.div 
            key={message.id}
            onClick={() => onSelectMessage(message)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedMessage && selectedMessage.id === message.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            } ${message.status === 'unread' ? 'font-semibold' : ''}`}
            whileHover={{ backgroundColor: "#f9fafb", x: 3 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-black truncate">{message.subject}</h3>
                <p className="text-sm text-black truncate font-semibold">{message.name}</p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <StatusBadge status={message.status} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-black mt-1 font-semibold">{formatDate(message.created_at)}</p>
              {message.status !== 'unread' && message.read_by_admin_name && (
                <p className="text-xs text-gray-600 mt-1">
                  อ่านโดย: {message.read_by_admin_name}
                </p>
              )}
              {message.status === 'replied' && message.replied_by_admin_name && (
                <p className="text-xs text-gray-600 mt-1">
                  ตอบกลับโดย: {message.replied_by_admin_name}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}