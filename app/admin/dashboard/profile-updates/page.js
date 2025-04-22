'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { RequestList, RequestDetail, RejectReasonModal } from './components';
import { getStatusName } from './utils/formatters';

export default function ProfileUpdatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  useEffect(() => {
    fetchRequests(status);
  }, [status]);
  
  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/profile-updates?status=${status}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile update requests');
      }
      
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error fetching profile update requests:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูล');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = (newStatus) => {
    router.push(`/admin/dashboard/profile-updates?status=${newStatus}`);
  };
  
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setComment('');
    setRejectReason('');
  };
  
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/approve-profile-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          comment: comment
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve profile update request');
      }
      
      toast.success('อนุมัติคำขอแก้ไขข้อมูลสำเร็จ');
      setSelectedRequest(null);
      fetchRequests(status);
    } catch (error) {
      console.error('Error approving profile update request:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขข้อมูล');
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
      const response = await fetch('/api/admin/reject-profile-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          reason: rejectReason,
          comment: comment
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject profile update request');
      }
      
      toast.success('ปฏิเสธคำขอแก้ไขข้อมูลสำเร็จ');
      setSelectedRequest(null);
      fetchRequests(status);
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting profile update request:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูล');
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
            คำขอแก้ไขข้อมูลสมาชิก
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
            <p className="text-black font-medium">ไม่พบคำขอแก้ไขข้อมูลที่มีสถานะ {getStatusName(status)}</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Request List */}
            <RequestList 
              requests={requests} 
              selectedRequestId={selectedRequest?.id}
              onViewRequest={handleViewRequest}
            />
            
            {/* Request Details */}
            <RequestDetail 
              selectedRequest={selectedRequest}
              comment={comment}
              setComment={setComment}
              isProcessing={isProcessing}
              handleApprove={handleApprove}
              onRejectClick={() => setShowRejectModal(true)}
            />
          </motion.div>
        )}
      </motion.div>
      
      {/* Reject Reason Modal */}
      <RejectReasonModal
        isVisible={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
}