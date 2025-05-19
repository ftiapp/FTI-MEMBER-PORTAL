'use client';

import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { FaSpinner, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function TsicUpdatesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch TSIC update requests
  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/admin/tsic-update-list?status=${filter}&page=${page}`);
        const data = await response.json();
        
        if (data.success) {
          setRequests(data.requests);
          setTotalPages(data.totalPages);
        } else {
          setError(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
      } catch (error) {
        console.error('Error fetching TSIC update requests:', error);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRequests();
  }, [filter, page, actionSuccess]);
  
  // Handle approve request
  const handleApprove = async (requestId) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const response = await fetch('/api/admin/tsic-update-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          comment: '' // Optional comment for approval
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActionSuccess(data.message || 'อนุมัติคำขอเรียบร้อยแล้ว');
        // Refresh the list after a delay
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      } else {
        setActionError(data.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
      }
    } catch (error) {
      console.error('Error approving TSIC update request:', error);
      setActionError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle reject request
  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      setActionError('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const response = await fetch('/api/admin/tsic-update-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          comment: rejectReason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActionSuccess(data.message || 'ปฏิเสธคำขอเรียบร้อยแล้ว');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedRequest(null);
        
        // Refresh the list after a delay
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      } else {
        setActionError(data.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
      }
    } catch (error) {
      console.error('Error rejecting TSIC update request:', error);
      setActionError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Open reject modal
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setActionError(null);
    setShowRejectModal(true);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">จัดการคำขอแก้ไขรหัส TSIC</h1>
        
        {/* Filter tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium ${filter === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setFilter('pending'); setPage(1); }}
          >
            รออนุมัติ
          </button>
          <button
            className={`px-4 py-2 font-medium ${filter === 'approved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setFilter('approved'); setPage(1); }}
          >
            อนุมัติแล้ว
          </button>
          <button
            className={`px-4 py-2 font-medium ${filter === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setFilter('rejected'); setPage(1); }}
          >
            ปฏิเสธแล้ว
          </button>
          <button
            className={`px-4 py-2 font-medium ${filter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setFilter('all'); setPage(1); }}
          >
            ทั้งหมด
          </button>
        </div>
        
        {/* Success/Error messages */}
        {actionSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <FaCheck className="mr-2" />
            {actionSuccess}
          </div>
        )}
        
        {actionError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {actionError}
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        )}
        
        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-10">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">ไม่พบคำขอแก้ไขรหัส TSIC {filter !== 'all' ? `ที่${filter === 'pending' ? 'รออนุมัติ' : filter === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}` : ''}</p>
          </div>
        )}
        
        {/* Requests list */}
        {!loading && !error && requests.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสสมาชิก</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บริษัท</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส TSIC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ขอ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.member_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.company_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {request.tsic_data.length} รายการ
                        <div className="text-xs text-gray-400 mt-1">
                          {request.tsic_data.slice(0, 3).map((tsic, index) => (
                            <div key={index}>{tsic.tsic_code} - {tsic.description.substring(0, 30)}{tsic.description.length > 30 ? '...' : ''}</div>
                          ))}
                          {request.tsic_data.length > 3 && <div>+ อีก {request.tsic_data.length - 3} รายการ</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.request_date).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {request.status === 'pending' ? 'รออนุมัติ' : 
                            request.status === 'approved' ? 'อนุมัติแล้ว' : 
                            'ปฏิเสธแล้ว'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading}
                            >
                              อนุมัติ
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              onClick={() => openRejectModal(request)}
                              disabled={actionLoading}
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {request.status === 'approved' ? 'อนุมัติเมื่อ ' : 'ปฏิเสธเมื่อ '}
                            {request.processed_date ? new Date(request.processed_date).toLocaleDateString('th-TH') : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-700">
                    หน้า <span className="font-medium">{page}</span> จาก <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || actionLoading}
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages || actionLoading}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Reject modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">ปฏิเสธคำขอแก้ไขรหัส TSIC</h3>
              <p className="text-gray-600 mb-4">กรุณาระบุเหตุผลในการปฏิเสธคำขอนี้</p>
              
              {actionError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {actionError}
                </div>
              )}
              
              <textarea
                className="w-full border rounded-md p-2 mb-4 h-32"
                placeholder="เหตุผลในการปฏิเสธ..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
              
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                >
                  ยกเลิก
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading && <FaSpinner className="animate-spin mr-2" />}
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
