'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { getStatusName } from '../utils/formatters';

// Use React.memo to prevent unnecessary re-renders
export default memo(RequestList, (prevProps, nextProps) => {
  // Only re-render if these props change
  if (
    prevProps.loading !== nextProps.loading ||
    prevProps.status !== nextProps.status ||
    prevProps.selectedId !== nextProps.selectedId ||
    prevProps.requests.length !== nextProps.requests.length
  ) {
    return false; // Re-render
  }
  
  // If the selected ID changed, we need to re-render
  if (prevProps.selectedId !== nextProps.selectedId) {
    return false;
  }
  
  // For requests, we only care about changes to the specific request objects
  // that would affect the UI, not the entire array reference
  return true; // Don't re-render
});

function RequestList({ requests, loading, status, selectedId, onStatusChange, onSelectRequest }) {
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
  
  // Status tabs
  const statusOptions = [
    { value: 'pending', label: 'รอการอนุมัติ' },
    { value: 'approved', label: 'อนุมัติแล้ว' },
    { value: 'rejected', label: 'ปฏิเสธแล้ว' },
    { value: 'all', label: 'ทั้งหมด' }
  ];
  
  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Status filter tabs */}
      <div className="flex overflow-x-auto bg-white rounded-lg shadow-md p-1 mb-4">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap
              ${status === option.value ? 'bg-blue-500 text-white' : 'text-black hover:bg-gray-100'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-black font-medium">ไม่พบคำขอแก้ไขข้อมูลที่มีสถานะ {getStatusName(status)}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                selectedId === request.id ? 'border-l-4 border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onSelectRequest(request)}
              whileHover={{ x: 3, backgroundColor: "#EBF5FF" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }} // Cap the delay at 0.5s
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
      )}
    </div>
  );
}