'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/app/admin/components/AdminLayout';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { RequestList, RequestDetail, RejectReasonModal } from './components';

export default function AddressUpdatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 5,
    page: 1,
    totalPages: 0
  });
  
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

        fetchRequests(status);
      } catch (error) {
        console.error('Error checking admin session:', error);
        router.push('/admin/login');
      }
    };

    checkAdminSession();
  }, [router, status]);
  
  const fetchRequests = async (status, page = 1, search = '') => {
    try {
      setLoading(true);
      
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
      
      const url = `/api/admin/address-update/list?${params.toString()}`;
      
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
        throw new Error(`Failed to fetch address updates: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.success === true) {
        if (Array.isArray(data.updates)) {
          setRequests(data.updates);
          
          // อัปเดตข้อมูลการแบ่งหน้า
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching address updates:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขที่อยู่');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = (newStatus) => {
    router.push(`/admin/address-updates?status=${newStatus}`);
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
  
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setRejectReason('');
  };
  
  const handleApprove = async (editedAddress) => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      // Prepare request body with edited address data if provided
      const requestBody = {
        id: selectedRequest.id,
        admin_notes: adminNotes
      };
      
      // If editedAddress is provided and different from original, include it in the request
      if (editedAddress) {
        requestBody.edited_address = editedAddress;
      }
      
      const response = await fetch('/api/admin/address-update/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve address update request');
      }
      
      toast.success('อนุมัติคำขอแก้ไขที่อยู่สำเร็จ');
      setSelectedRequest(null);
      fetchRequests(status);
    } catch (error) {
      console.error('Error approving address update request:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขที่อยู่');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/address-update/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          reason: rejectReason,
          admin_notes: adminNotes
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject address update request');
      }
      
      toast.success('ปฏิเสธคำขอแก้ไขที่อยู่สำเร็จ');
      setSelectedRequest(null);
      fetchRequests(status);
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting address update request:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขที่อยู่');
    } finally {
      setIsProcessing(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };
  
  // Helper function to get status name
  const getStatusName = (statusValue) => {
    switch (statusValue) {
      case 'pending': return 'รอการอนุมัติ';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธแล้ว';
      default: return statusValue;
    }
  };

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}>
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-black"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            คำขอแก้ไขที่อยู่
          </motion.h1>
          
          <motion.div 
            className="flex space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <button
              onClick={() => handleStatusChange('pending')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                status === 'pending'
                  ? 'bg-blue-600 text-white shadow-md font-medium'
                  : 'bg-white text-black border border-black hover:bg-gray-50 hover:shadow font-medium'
              }`}
            >
              รอการอนุมัติ
            </button>
            <button
              onClick={() => handleStatusChange('approved')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                status === 'approved'
                  ? 'bg-blue-600 text-white shadow-md font-medium'
                  : 'bg-white text-black border border-black hover:bg-gray-50 hover:shadow font-medium'
              }`}
            >
              อนุมัติแล้ว
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                status === 'rejected'
                  ? 'bg-blue-600 text-white shadow-md font-medium'
                  : 'bg-white text-black border border-black hover:bg-gray-50 hover:shadow font-medium'
              }`}
            >
              ปฏิเสธแล้ว
            </button>
          </motion.div>
        </div>
        
        {/* Search Bar */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <form onSubmit={handleSearch} className="flex w-full max-w-md">
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสสมาชิกหรือชื่อบริษัท"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              ค้นหา
            </button>
          </form>
        </motion.div>
        
        {/* Debug Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mb-4"
        >
          <a 
            href="/api/admin/address-update/debug" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ตรวจสอบข้อมูลในฐานข้อมูล
          </a>
        </motion.div>
        
        {loading ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : requests.length === 0 ? (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-black font-medium">ไม่พบคำขอแก้ไขที่อยู่ที่มีสถานะ {getStatusName(status)}</p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Request List */}
              <div className="lg:col-span-1 space-y-4">
                <RequestList 
                  requests={requests} 
                  selectedRequestId={selectedRequest?.id}
                  onViewRequest={handleViewRequest}
                />
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div 
                    className="flex justify-center items-center mt-4 bg-white p-3 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      «
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      ‹
                    </button>
                    
                    <div className="mx-2 text-sm">
                      <span className="font-medium">{pagination.page}</span> / {pagination.totalPages}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      ›
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      »
                    </button>
                  </motion.div>
                )}
                
                {/* Results Summary */}
                <motion.div 
                  className="text-sm text-gray-500 text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  แสดง {requests.length} รายการ จากทั้งหมด {pagination.total} รายการ
                </motion.div>
              </div>
              
              {/* Request Details */}
              <RequestDetail 
                selectedRequest={selectedRequest}
                adminNotes={adminNotes}
                setAdminNotes={setAdminNotes}
                isProcessing={isProcessing}
                handleApprove={handleApprove}
                onRejectClick={() => setShowRejectModal(true)}
              />
            </motion.div>
          </>
        )}
      </motion.div>
      
      {/* Reject Reason Modal */}
      <RejectReasonModal
        isVisible={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
}
