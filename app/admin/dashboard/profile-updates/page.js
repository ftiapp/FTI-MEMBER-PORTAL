'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { motion } from 'framer-motion'; // เพิ่ม import framer-motion

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
    } catch (error) {
      console.error('Error rejecting profile update request:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูล');
    } finally {
      setIsProcessing(false);
    }
  };
  
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
            <p className="text-black font-medium">ไม่พบคำขอแก้ไขข้อมูลที่มีสถานะ {
              status === 'pending' ? 'รอการอนุมัติ' : 
              status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'
            }</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Request List */}
            <div className="lg:col-span-1 space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedRequest?.id === request.id ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewRequest(request)}
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
            
            {/* Request Details */}
            <div className="lg:col-span-2">
              {selectedRequest ? (
                <motion.div 
                  className="bg-white rounded-lg shadow-md p-6 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="border-b border-black pb-4">
                    <h2 className="text-xl font-bold text-black">รายละเอียดคำขอแก้ไขข้อมูล</h2>
                    <p className="text-sm text-black font-medium mt-1">
                      คำขอเมื่อ {formatDate(selectedRequest.created_at)}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-black">ข้อมูลเดิม</h3>
                        <div className="mt-2 space-y-2">
                          <p className="text-black font-semibold"><span className="font-bold text-black">ชื่อ:</span> {selectedRequest.firstname || '-'}</p>
                          <p className="text-black font-semibold"><span className="font-bold text-black">นามสกุล:</span> {selectedRequest.lastname || '-'}</p>
                          <p className="text-black font-semibold"><span className="font-bold text-black">อีเมล:</span> {selectedRequest.email || '-'}</p>
                          <p className="text-black font-semibold"><span className="font-bold text-black">เบอร์โทรศัพท์:</span> {selectedRequest.phone || '-'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-black">ข้อมูลใหม่</h3>
                        <div className="mt-2 space-y-2">
                          <p className="text-black font-semibold"><span className="font-bold text-black">ชื่อ:</span> {selectedRequest.new_firstname}</p>
                          <p className="text-black font-semibold"><span className="font-bold text-black">นามสกุล:</span> {selectedRequest.new_lastname}</p>
                          <p className="text-black font-semibold"><span className="font-bold text-black">อีเมล:</span> {selectedRequest.new_email}</p>
                          <p className="text-black font-semibold"><span className="font-bold text-black">เบอร์โทรศัพท์:</span> {selectedRequest.new_phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedRequest.status === 'pending' && (
                      <div className="space-y-4 pt-4 border-t border-black">
                        <div>
                          <label htmlFor="comment" className="block text-sm font-bold text-black mb-1">
                            บันทึกของผู้ดูแลระบบ (ไม่บังคับ)
                          </label>
                          <textarea
                            id="comment"
                            rows="2"
                            className="w-full px-3 py-2 border border-black rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                            placeholder="บันทึกเพิ่มเติมสำหรับผู้ดูแลระบบ"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                        </div>
                        
                        <div className="flex space-x-4">
                          <motion.button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {isProcessing ? 'กำลังดำเนินการ...' : 'อนุมัติคำขอ'}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => {
                              document.getElementById('rejectReasonModal').classList.remove('hidden');
                            }}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            ปฏิเสธคำขอ
                          </motion.button>
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.status === 'approved' && selectedRequest.admin_id && (
                      <div className="pt-4 border-t border-black">
                        <p className="text-sm text-black font-semibold">
                          <span className="font-bold text-black">อนุมัติโดย:</span> Admin ID: {selectedRequest.admin_id}
                        </p>
                        {selectedRequest.admin_comment && (
                          <p className="text-sm text-black font-semibold mt-2">
                            <span className="font-bold text-black">บันทึก:</span> {selectedRequest.admin_comment}
                          </p>
                        )}
                        <p className="text-sm text-black font-semibold mt-2">
                          <span className="font-bold text-black">เมื่อ:</span> {formatDate(selectedRequest.updated_at)}
                        </p>
                      </div>
                    )}
                    
                    {selectedRequest.status === 'rejected' && (
                      <div className="pt-4 border-t border-black">
                        <p className="text-sm text-black font-semibold">
                          <span className="font-bold text-black">ปฏิเสธโดย:</span> Admin ID: {selectedRequest.admin_id}
                        </p>
                        <p className="text-sm text-black font-semibold mt-2">
                          <span className="font-bold text-black">เหตุผล:</span> {selectedRequest.reject_reason}
                        </p>
                        {selectedRequest.admin_comment && (
                          <p className="text-sm text-black font-semibold mt-2">
                            <span className="font-bold text-black">บันทึก:</span> {selectedRequest.admin_comment}
                          </p>
                        )}
                        <p className="text-sm text-black font-semibold mt-2">
                          <span className="font-bold text-black">เมื่อ:</span> {formatDate(selectedRequest.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-lg text-black font-bold">เลือกคำขอแก้ไขข้อมูลเพื่อดูรายละเอียด</p>
                  <p className="text-sm text-black font-semibold mt-2">คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Reject Reason Modal */}
      <div id="rejectReasonModal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-lg font-medium text-navy-800 mb-4">ระบุเหตุผลในการปฏิเสธ</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rejectReason" className="block text-sm font-medium text-navy-700 mb-1">
                เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectReason"
                rows="3"
                className="w-full px-3 py-2 border border-black rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="ระบุเหตุผลในการปฏิเสธคำขอแก้ไขข้อมูล"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <motion.button
                onClick={() => {
                  document.getElementById('rejectReasonModal').classList.add('hidden');
                }}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ยกเลิก
              </motion.button>
              
              <motion.button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
                    return;
                  }
                  document.getElementById('rejectReasonModal').classList.add('hidden');
                  handleReject();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ยืนยันการปฏิเสธ
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}