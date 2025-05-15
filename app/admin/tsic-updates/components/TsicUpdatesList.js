'use client';

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function TsicUpdatesList({ 
  requests, 
  selectedRequest, 
  setSelectedRequest,
  page,
  setPage,
  totalPages,
  filter
}) {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">รอการอนุมัติ</span>;
      case 'approved':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">อนุมัติแล้ว</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">ปฏิเสธแล้ว</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">รายการคำขอแก้ไข TSIC</h2>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
        {requests.map((request) => (
          <div
            key={request.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedRequest && selectedRequest.id === request.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{request.member_code}</div>
              {getStatusBadge(request.status)}
            </div>
            
            <div className="text-sm text-gray-600 mb-1">
              วันที่ขอ: {formatDate(request.request_date)}
            </div>
            
            {request.processed_date && (
              <div className="text-sm text-gray-600">
                วันที่ดำเนินการ: {formatDate(request.processed_date)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <FaChevronLeft />
          </button>
          
          <div className="text-sm">
            หน้า {page} จาก {totalPages}
          </div>
          
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
