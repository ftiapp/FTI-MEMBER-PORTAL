'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../../components/AdminLayout';
import DetailView from './components/DetailView';
import ICDetailView from './components/ICDetailView';
import RejectModal from '../../components/modals/RejectModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useApplicationData } from '../../hooks/useApplicationData';
import { getMemberTypeInfo } from '../../ีutils/dataTransformers';
import { formatThaiDate } from '../../ีutils/formatters';
import { STATUS } from '../../ีutils/constants';

export default function MembershipRequestDetail({ params }) {
  const router = useRouter();
  const { type, id } = use(params);
  
  const { 
    application, 
    isLoading, 
    error,
    industrialGroups,
    provincialChapters,
    updateApplication 
  } = useApplicationData(type, id);
  
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Initialize admin note when application loads
  useState(() => {
    if (application?.adminNote) {
      setAdminNote(application.adminNote);
    }
  }, [application]);

  const handleSaveNote = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/save-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('บันทึกหมายเหตุเรียบร้อยแล้ว');
        updateApplication({
          adminNote: adminNote,
          adminNoteAt: new Date().toISOString()
        });
      } else {
        toast.error(data.message || 'ไม่สามารถบันทึกหมายเหตุได้');
      }
    } catch (error) {
      console.error('Error saving admin note:', error);
      toast.error('ไม่สามารถบันทึกหมายเหตุได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('อนุมัติการสมัครสมาชิกเรียบร้อยแล้ว');
        setTimeout(() => {
          router.push('/admin/dashboard/membership-requests');
        }, 1500);
      } else {
        toast.error(data.message || 'ไม่สามารถอนุมัติการสมัครสมาชิกได้');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('ไม่สามารถอนุมัติการสมัครสมาชิกได้');
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (isSubmitting || !rejectionReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote, rejectionReason }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('ปฏิเสธการสมัครสมาชิกเรียบร้อยแล้ว');
        router.push('/admin/dashboard/membership-requests');
      } else {
        toast.error(data.message || 'ไม่สามารถปฏิเสธการสมัครสมาชิกได้');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('ไม่สามารถปฏิเสธการสมัครสมาชิกได้');
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  const handleViewDocument = (filePath) => {
    if (!filePath) return;
    
    if (filePath.startsWith('http')) {
      window.open(filePath, '_blank');
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const fullUrl = `${baseUrl}/${filePath.replace(/^\//, '')}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="กำลังโหลดข้อมูลใบสมัคร..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</p>
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/admin/dashboard/membership-requests')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              กลับไปหน้ารายการ
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const memberType = getMemberTypeInfo(type);
  const ViewComponent = type === 'ic' ? ICDetailView : DetailView;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.push('/admin/dashboard/membership-requests')}
              className="text-blue-600 hover:text-blue-800 print:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              รายละเอียดการสมัครสมาชิก {memberType.code} ({memberType.name})
            </h1>
          </div>
          
          {application && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>วันที่สมัคร: {formatThaiDate(application.createdAt)}</span>
              <StatusBadge status={application.status} />
              {application.memberCode && (
                <span className="font-medium text-blue-600">
                  รหัสสมาชิก: {application.memberCode}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <ViewComponent
          application={application}
          type={type}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          adminNote={adminNote}
          onAdminNoteChange={setAdminNote}
          onSaveNote={handleSaveNote}
          onApprove={handleApprove}
          onReject={() => setShowRejectModal(true)}
          onViewDocument={handleViewDocument}
          isSubmitting={isSubmitting}
          onPrint={handlePrint}
        />

        {/* Reject Modal */}
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleReject}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
}