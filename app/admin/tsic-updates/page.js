'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/app/admin/components/AdminLayout';
import TsicUpdatesList from './components/TsicUpdatesList';
import TsicUpdatesHeader from './components/TsicUpdatesHeader';
import TsicUpdateDetails from './components/TsicUpdateDetails';
import RejectModal from './components/RejectModal';
import { FaSpinner, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function TsicUpdatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    page: 1,
    totalPages: 0
  });
  
  // Check admin session and fetch TSIC update requests
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/check-session', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/admin/login');
          return;
        }

        // เพิ่ม delay เล็กน้อยเพื่อให้แน่ใจว่า session ถูกตรวจสอบเรียบร้อยแล้ว
        setTimeout(() => {
          fetchRequests(status, pagination.page, searchTerm);
        }, 100);
      } catch (error) {
        console.error('Error checking admin session:', error);
        router.push('/admin/login');
      }
    };

    checkAdminSession();
  }, [router, status, actionSuccess]);
  
  const fetchRequests = async (status, page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // สร้าง URL พร้อมพารามิเตอร์
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) {
        params.append('search', search);
      }
      
      const url = `/api/admin/tsic-update-list?${params.toString()}`;
      console.log('Fetching TSIC updates from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch TSIC updates: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data && data.success === true) {
        if (data.requests) {
          console.log('Setting requests:', data.requests);
          // Make sure data.requests is treated as an array
          const requestsArray = Array.isArray(data.requests) ? data.requests : [data.requests];
          
          setRequests(requestsArray.map((request) => {
            // Parse TSIC data from JSON
            console.log('TSIC data type:', typeof request.tsic_data);
            console.log('TSIC data raw:', request.tsic_data);
            
            let tsicData = [];
            try {
              if (typeof request.tsic_data === 'string') {
                tsicData = JSON.parse(request.tsic_data);
              } else if (Array.isArray(request.tsic_data)) {
                tsicData = request.tsic_data;
              } else {
                console.error('Unexpected TSIC data format');
              }
              console.log('Parsed TSIC data:', tsicData);
            } catch (error) {
              console.error('Error parsing TSIC data:', error);
            }
            
            return { ...request, tsic_data: tsicData };
          }));
          
          // อัปเดตข้อมูลการแบ่งหน้า
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          console.log('No requests in response');
          setRequests([]);
        }
      } else {
        console.log('API returned success: false');
        setRequests([]);
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (error) {
      console.error('Error fetching TSIC update requests:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไข TSIC');
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = (newStatus) => {
    router.push(`/admin/tsic-updates?status=${newStatus}`);
  };
  
  const handlePageChange = (newPage) => {
    fetchRequests(status, newPage, searchTerm);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests(status, 1, searchTerm);
  };
  
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
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
        body: JSON.stringify({ requestId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActionSuccess('อนุมัติคำขอเรียบร้อยแล้ว');
        setSelectedRequest(null);
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
    if (!rejectReason.trim()) {
      setActionError('กรุณาระบุเหตุผลในการปฏิเสธคำขอ');
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
          reason: rejectReason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActionSuccess('ปฏิเสธคำขอเรียบร้อยแล้ว');
        setSelectedRequest(null);
        setShowRejectModal(false);
        setRejectReason('');
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

  return (
    <AdminLayout>
      <div className="p-6">
        <TsicUpdatesHeader />
        
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-grow mr-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ค้นหาด้วยรหัสสมาชิก"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
            >
              ค้นหา
            </button>
          </form>
        </div>
        
        {actionSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{actionSuccess}</span>
          </div>
        )}
        
        {actionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{actionError}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-md ${status === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => handleStatusChange('pending')}
          >
            รอการอนุมัติ
          </button>
          <button
            className={`px-4 py-2 rounded-md ${status === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => handleStatusChange('approved')}
          >
            อนุมัติแล้ว
          </button>
          <button
            className={`px-4 py-2 rounded-md ${status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => handleStatusChange('rejected')}
          >
            ปฏิเสธแล้ว
          </button>
          <button
            className={`px-4 py-2 rounded-md ${status === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => handleStatusChange('all')}
          >
            ทั้งหมด
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
            <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded relative mt-4 text-center">
            <p className="text-lg">ไม่พบคำขอที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">รายการคำขอแก้ไข TSIC</h2>
                </div>
                
                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                  {requests.map((request) => {
                    // Format date
                    const formatDate = (dateString) => {
                      if (!dateString) return '';
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
                      <div
                        key={request.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedRequest && selectedRequest.id === request.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => {
                          console.log('Selected request:', request);
                          setSelectedRequest(request);
                        }}
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
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="p-4 border-t flex justify-between items-center">
                    <button
                      className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <FaChevronLeft />
                    </button>
                    
                    <div className="text-sm">
                      หน้า {pagination.page} จาก {pagination.totalPages}
                    </div>
                    
                    <button
                      className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {selectedRequest && (
                <TsicUpdateDetails 
                  request={selectedRequest} 
                  handleApprove={handleApprove}
                  setShowRejectModal={setShowRejectModal}
                  actionLoading={actionLoading}
                />
              )}
            </div>
          </div>
        )}
        
        {showRejectModal && (
          <RejectModal 
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            handleReject={handleReject}
            setShowRejectModal={setShowRejectModal}
            actionLoading={actionLoading}
            actionError={actionError}
          />
        )}
      </div>
    </AdminLayout>
  );
}