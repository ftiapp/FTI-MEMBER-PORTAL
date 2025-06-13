'use client';

import { useState } from 'react';
import { formatDate, formatStatus, getStatusColor } from '../utils/formatters';
import RequestDetails from './RequestDetails';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';

/**
 * Component for displaying a list of product update requests
 * @param {Object} props - Component props
 * @param {Array} props.requests - List of requests
 * @param {Object} props.pagination - Pagination data
 * @param {Object} props.filters - Filter data
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {Function} props.onFilterChange - Function to call when filter changes
 * @param {Function} props.onApprove - Function to call when request is approved
 * @param {Function} props.onReject - Function to call when request is rejected
 * @returns {JSX.Element} - Requests list component
 */
export default function RequestsList({
  requests,
  pagination,
  filters,
  onPageChange,
  onFilterChange,
  onApprove,
  onReject
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange('search', searchInput);
  };

  // Handle view request details
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
  };

  // Handle close request details
  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxButtons / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        disabled={pagination.page === 1}
        className="flex items-center justify-center w-10 h-10 rounded-full disabled:opacity-50 disabled:text-gray-400 text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
    );

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            pagination.page === i 
              ? 'bg-blue-600 text-white font-medium shadow-sm' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label={`Page ${i}`}
          aria-current={pagination.page === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
        disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
        className="flex items-center justify-center w-10 h-10 rounded-full disabled:opacity-50 disabled:text-gray-400 text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Next page"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    );

    return pages;
  };

  return (
    <>
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 pr-4 py-2.5 appearance-none w-full md:w-48"
                  aria-label="Filter by status"
                >
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธแล้ว</option>
                  <option value="all">ทั้งหมด</option>
                </select>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                แสดง {pagination.total} รายการ
              </span>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหารหัสสมาชิกหรือชื่อบริษัท"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                />
              </div>
              <button
                type="submit"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
              >
                ค้นหา
              </button>
            </form>
          </div>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสสมาชิก</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อบริษัท</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ขอแก้ไข</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ขอแก้ไข</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap font-medium text-gray-900">{request.member_code}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-gray-700">{request.company_name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-gray-700">{request.user_name || '-'}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-gray-700">{formatDate(request.created_at)}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors focus:ring-2 focus:ring-blue-300"
                    >
                      <FiEye className="w-4 h-4" /> ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบข้อมูล</h3>
          <p className="mt-1 text-sm text-gray-500">ไม่พบข้อมูลคำขอแก้ไขข้อมูลสินค้า</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-1">
          <div className="bg-white rounded-full shadow-sm py-2 px-4 flex items-center gap-1">
            {renderPagination()}
          </div>
          <div className="text-sm text-gray-500 ml-2">
            หน้า {pagination.page} จาก {pagination.totalPages}
          </div>
        </div>
      )}

      {selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onApprove={onApprove}
          onReject={onReject}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
}
