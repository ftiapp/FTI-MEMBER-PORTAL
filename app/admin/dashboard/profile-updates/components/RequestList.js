'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function RequestList({ requests, selectedRequestId, onViewRequest }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm น.', { locale: th });
  };
  
  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">รอการอนุมัติ</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">อนุมัติแล้ว</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">ปฏิเสธแล้ว</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="lg:col-span-1 space-y-4">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
            selectedRequestId === request.id ? 'border-l-4 border-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => onViewRequest(request)}
          whileHover={{ x: 3, backgroundColor: "#EBF5FF" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-black">
                {request.name || `${request.new_firstname} ${request.new_lastname}`}
              </h3>
              <p className="text-sm text-black font-medium">{request.email}</p>
            </div>
            {getStatusBadge(request.status)}
          </div>
          <div className="mt-2 text-xs text-black font-medium">
            {formatDate(request.created_at)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}