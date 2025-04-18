'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">รอการอนุมัติ</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">อนุมัติแล้ว</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">ปฏิเสธแล้ว</span>;
      default:
        return null;
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">คำขอแก้ไขข้อมูลสมาชิก</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('pending')}
              className={`px-4 py-2 text-sm rounded-md ${
                status === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              รอการอนุมัติ
            </button>
            <button
              onClick={() => handleStatusChange('approved')}
              className={`px-4 py-2 text-sm rounded-md ${
                status === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              อนุมัติแล้ว
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`px-4 py-2 text-sm rounded-md ${
                status === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              ปฏิเสธแล้ว
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">ไม่พบคำขอแก้ไขข้อมูลที่มีสถานะ {
              status === 'pending' ? 'รอการอนุมัติ' : 
              status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'
            }</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request List */}
            <div className="lg:col-span-1 space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleViewRequest(request)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.name || `${request.new_firstname} ${request.new_lastname}`}
                      </h3>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(request.created_at)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Request Details */}
            <div className="lg:col-span-2">
              {selectedRequest ? (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">รายละเอียดคำขอแก้ไขข้อมูล</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      คำขอเมื่อ {formatDate(selectedRequest.created_at)}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ข้อมูลเดิม</h3>
                        <div className="mt-2 space-y-2">
                          <p><span className="font-medium">ชื่อ:</span> {selectedRequest.firstname || '-'}</p>
                          <p><span className="font-medium">นามสกุล:</span> {selectedRequest.lastname || '-'}</p>
                          <p><span className="font-medium">อีเมล:</span> {selectedRequest.email || '-'}</p>
                          <p><span className="font-medium">เบอร์โทรศัพท์:</span> {selectedRequest.phone || '-'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ข้อมูลใหม่</h3>
                        <div className="mt-2 space-y-2">
                          <p><span className="font-medium">ชื่อ:</span> {selectedRequest.new_firstname}</p>
                          <p><span className="font-medium">นามสกุล:</span> {selectedRequest.new_lastname}</p>
                          <p><span className="font-medium">อีเมล:</span> {selectedRequest.new_email}</p>
                          <p><span className="font-medium">เบอร์โทรศัพท์:</span> {selectedRequest.new_phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedRequest.status === 'pending' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                            บันทึกของผู้ดูแลระบบ (ไม่บังคับ)
                          </label>
                          <textarea
                            id="comment"
                            rows="2"
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="บันทึกเพิ่มเติมสำหรับผู้ดูแลระบบ"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                        </div>
                        
                        <div className="flex space-x-4">
                          <button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? 'กำลังดำเนินการ...' : 'อนุมัติคำขอ'}
                          </button>
                          
                          <button
                            onClick={() => {
                              document.getElementById('rejectReasonModal').classList.remove('hidden');
                            }}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ปฏิเสธคำขอ
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.status === 'approved' && selectedRequest.admin_id && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">อนุมัติโดย:</span> Admin ID: {selectedRequest.admin_id}
                        </p>
                        {selectedRequest.admin_comment && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">บันทึก:</span> {selectedRequest.admin_comment}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">เมื่อ:</span> {formatDate(selectedRequest.updated_at)}
                        </p>
                      </div>
                    )}
                    
                    {selectedRequest.status === 'rejected' && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">ปฏิเสธโดย:</span> Admin ID: {selectedRequest.admin_id}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">เหตุผล:</span> {selectedRequest.reject_reason}
                        </p>
                        {selectedRequest.admin_comment && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">บันทึก:</span> {selectedRequest.admin_comment}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">เมื่อ:</span> {formatDate(selectedRequest.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
                  <p className="text-gray-500">เลือกคำขอแก้ไขข้อมูลเพื่อดูรายละเอียด</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Reject Reason Modal */}
      <div id="rejectReasonModal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ระบุเหตุผลในการปฏิเสธ</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-1">
                เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectReason"
                rows="3"
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="ระบุเหตุผลในการปฏิเสธคำขอแก้ไขข้อมูล"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  document.getElementById('rejectReasonModal').classList.add('hidden');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                ยกเลิก
              </button>
              
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
                    return;
                  }
                  document.getElementById('rejectReasonModal').classList.add('hidden');
                  handleReject();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
