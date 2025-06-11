'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/app/admin/components/AdminLayout';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { RequestList, RequestDetail, RejectReasonModal } from './components';

export default function ProductUpdatesPage() {
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
        const res = await fetch('/api/admin/check-session');
        const data = await res.json();
        if (!data.success) {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        router.push('/admin');
      }
    };
    
    checkAdminSession();
  }, [router]);
  
  useEffect(() => {
    fetchRequests();
  }, [status, pagination.page, searchTerm]);
  
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/product-updates?status=${status}&page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}`);
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.requests);
        setPagination({
          ...pagination,
          total: data.total,
          totalPages: data.totalPages
        });
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (error) {
      console.error('Error fetching product update requests:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
  };
  
  const handleStatusChange = (newStatus) => {
    router.push(`/admin/dashboard/product-updates?status=${newStatus}`);
  };
  
  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({
      ...pagination,
      page: 1
    });
  };
  
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/product-updates/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('อนุมัติคำขอเรียบร้อยแล้ว');
        fetchRequests();
        setSelectedRequest(null);
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
      }
    } catch (error) {
      console.error('Error approving product update request:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/product-updates/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          adminNotes,
          rejectReason 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('ปฏิเสธคำขอเรียบร้อยแล้ว');
        fetchRequests();
        setSelectedRequest(null);
        setShowRejectModal(false);
        setRejectReason('');
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
      }
    } catch (error) {
      console.error('Error rejecting product update request:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-6">จัดการคำขอแก้ไขสินค้า/บริการ</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RequestList 
                requests={requests}
                loading={loading}
                selectedRequest={selectedRequest}
                onSelectRequest={handleSelectRequest}
                status={status}
                onStatusChange={handleStatusChange}
                pagination={pagination}
                onPageChange={handlePageChange}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
              />
            </div>
            
            <div className="lg:col-span-2">
              {selectedRequest ? (
                <RequestDetail 
                  request={selectedRequest}
                  adminNotes={adminNotes}
                  setAdminNotes={setAdminNotes}
                  onApprove={handleApprove}
                  onReject={() => setShowRejectModal(true)}
                  isProcessing={isProcessing}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center">เลือกคำขอจากรายการเพื่อดูรายละเอียด</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
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
