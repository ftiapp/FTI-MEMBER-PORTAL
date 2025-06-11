'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function RequestList({
  requests,
  loading,
  selectedRequest,
  onSelectRequest,
  status,
  onStatusChange,
  pagination,
  onPageChange,
  searchTerm,
  setSearchTerm,
  onSearch
}) {
  const statusOptions = [
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'approved', label: 'อนุมัติแล้ว' },
    { value: 'rejected', label: 'ปฏิเสธแล้ว' }
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">รายการคำขอแก้ไขสินค้า/บริการ</h2>
        
        <div className="mt-4">
          <div className="flex border rounded-md overflow-hidden">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`flex-1 py-2 text-sm font-medium ${status === option.value ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={onSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="ค้นหาตามชื่อหรืออีเมล"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ค้นหา
          </button>
        </form>
      </div>
      
      <div className="divide-y">
        {loading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="p-4">
              <div className="h-5 w-3/4 mb-2 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-1/2 mb-1 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))
        ) : requests.length > 0 ? (
          requests.map(request => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRequest?.id === request.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectRequest(request)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{request.member_name || 'ไม่ระบุชื่อ'}</h3>
                  <p className="text-sm text-gray-500">{request.email || 'ไม่ระบุอีเมล'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {request.created_at ? format(new Date(request.created_at), 'PPp', { locale: th }) : 'ไม่ระบุเวลา'}
                  </p>
                </div>
                
                <div>
                  {request.status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      รอดำเนินการ
                    </span>
                  )}
                  {request.status === 'approved' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      อนุมัติแล้ว
                    </span>
                  )}
                  {request.status === 'rejected' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ปฏิเสธแล้ว
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            ไม่พบรายการคำขอ
          </div>
        )}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t flex justify-center">
          <div className="flex gap-1">
            <button
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const current = pagination.page;
                return page === 1 || 
                       page === pagination.totalPages || 
                       (page >= current - 1 && page <= current + 1);
              })
              .map((page, index, array) => {
                // Add ellipsis
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="flex items-center px-2">
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${pagination.page === page ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                );
              })}
            
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
