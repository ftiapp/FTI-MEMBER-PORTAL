'use client';

import { useState } from 'react';
import { formatDate, formatStatus, getStatusColor } from '../utils/formatters';
import RequestDetails from './RequestDetails';

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
        className="px-3 py-1 border rounded-md disabled:opacity-50"
      >
        &laquo;
      </button>
    );

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 border rounded-md ${
            pagination.page === i ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
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
        className="px-3 py-1 border rounded-md disabled:opacity-50"
      >
        &raquo;
      </button>
    );

    return pages;
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="pending">รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธแล้ว</option>
              <option value="all">ทั้งหมด</option>
            </select>
            <span className="text-sm text-gray-500">
              แสดง {pagination.total} รายการ
            </span>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหารหัสสมาชิกหรือชื่อบริษัท"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border rounded-md px-3 py-2 w-full md:w-auto"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">รหัสสมาชิก</th>
                <th className="py-2 px-4 border text-left">ชื่อบริษัท</th>
                <th className="py-2 px-4 border text-left">ผู้ขอแก้ไข</th>
                <th className="py-2 px-4 border text-left">วันที่ขอแก้ไข</th>
                <th className="py-2 px-4 border text-left">สถานะ</th>
                <th className="py-2 px-4 border text-left">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{request.member_code}</td>
                  <td className="py-2 px-4 border">{request.company_name}</td>
                  <td className="py-2 px-4 border">{request.user_name || '-'}</td>
                  <td className="py-2 px-4 border">{formatDate(request.created_at)}</td>
                  <td className="py-2 px-4 border">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ไม่พบข้อมูลคำขอแก้ไขข้อมูลสินค้า</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {renderPagination()}
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
