'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../../components/AdminLayout';
import DetailView from './components/DetailView';
import ICDetailView from './components/ICDetailView';
import RejectModal from '../../components/modals/RejectModal';
import SuccessModal from '../../components/modals/SuccessModal';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('สำเร็จ');
  const [successMessage, setSuccessMessage] = useState('ดำเนินการสำเร็จ');
  const [recipientEmail, setRecipientEmail] = useState(null);
  const [recipientName, setRecipientName] = useState(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [previewCompanyName, setPreviewCompanyName] = useState(null);
  const [previewTaxId, setPreviewTaxId] = useState(null);

  const handleGoToList = () => {
    setShowSuccessModal(false);
    router.push('/admin/dashboard/membership-requests');
  };

  // แก้ไข: ใช้ useEffect แทน useState
  useEffect(() => {
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
      console.log('Save Note Response:', data); // Debug log
      
      if (data.success) {
        toast.success('บันทึกหมายเหตุเรียบร้อยแล้ว');
        updateApplication({
          adminNote: adminNote,
          adminNoteAt: new Date().toISOString()
        });
      } else {
        console.log('Save Note Error:', data.message); // Debug log
        toast.error(data.message || 'ไม่สามารถบันทึกหมายเหตุได้');
      }
    } catch (error) {
      console.error('Error saving admin note:', error);
      toast.error('ไม่สามารถบันทึกหมายเหตุได้');
    } finally {
      setIsSubmitting(false); // ย้ายมาไว้ใน finally
    }
  };

  const handleApprove = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const loadingToastId = toast.loading('กำลังอนุมัติการสมัครสมาชิก... กรุณารอสักครู่');
    
    try {
      // เพิ่ม timeout 60 วินาที
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('Approve Response:', data); // Debug log
      
      if (data.success) {
        toast.success('อนุมัติการสมัครสมาชิกเรียบร้อยแล้ว');
        updateApplication({ ...application, status: 'approved' });
        setSuccessTitle('อนุมัติสำเร็จ');
        setSuccessMessage('ได้ทำการอนุมัติการสมัครสมาชิกเรียบร้อยแล้ว');
        setShowSuccessModal(true);
      } else {
        console.log('Approve Error:', data.message); // Debug log
        toast.error(data.message || 'ไม่สามารถอนุมัติการสมัครสมาชิกได้');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      if (error.name === 'AbortError') {
        toast.error('การร้องขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      } else {
        toast.error('ไม่สามารถอนุมัติการสมัครสมาชิกได้');
      }
    } finally {
      toast.dismiss(loadingToastId);
      setIsSubmitting(false); // แน่ใจว่าจะ reset เสมอ
    }
  };

  const handleOpenRejectModal = async () => {
    setShowRejectModal(true);
    setRecipientLoading(true);
    setRecipientEmail(null);
    setRecipientName(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`/api/admin/membership-requests/${type}/${id}/reject`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        setRecipientEmail(data.recipientEmail || null);
        setRecipientName(data.recipientName || null);
        setPreviewCompanyName(data.companyName || null);
        setPreviewTaxId(data.taxId || null);
      }
    } catch (e) {
      console.error('Failed to fetch recipient preview:', e);
    } finally {
      setRecipientLoading(false);
    }
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setRecipientEmail(null);
    setRecipientName(null);
    setRecipientLoading(false);
    setPreviewCompanyName(null);
    setPreviewTaxId(null);
  };

  const handleReject = async () => {
    if (isSubmitting || !rejectionReason.trim()) return;
    
    setIsSubmitting(true);
    
    const loadingToastId = toast.loading('กำลังปฏิเสธการสมัครสมาชิกและส่งอีเมลแจ้ง... กรุณารอสักครู่');
    
    try {
      // เพิ่ม timeout 60 วินาที
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote, rejectionReason }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('Reject Response:', data); // Debug log
      
      if (data.success) {
        toast.success('ปฏิเสธการสมัครสมาชิกเรียบร้อยแล้ว');
        updateApplication({ ...application, status: 'rejected', rejectionReason });
        setShowRejectModal(false);
        setRejectionReason('');
        setSuccessTitle('ปฏิเสธสำเร็จ');
        const recipientLine = data.emailSent
          ? `ได้ส่งอีเมลแจ้งไปที่ ${data.recipientEmail || '-'}${data.recipientName ? ` (${data.recipientName})` : ''}`
          : 'ไม่สามารถส่งอีเมลแจ้งได้ในขณะนี้';
        const companyLine = `ชื่อบริษัท/ผู้ยื่น: ${data.companyName || '-'}`;
        const taxLine = `TAX ID/เลขบัตร: ${data.taxId || '-'}`;
        setSuccessMessage(`ได้ทำการปฏิเสธการสมัครสมาชิกเรียบร้อยแล้ว\n${companyLine}\n${taxLine}\n${recipientLine}`);
        setShowSuccessModal(true);
      } else {
        console.log('Reject Error:', data.message); // Debug log
        toast.error(data.message || 'ไม่สามารถปฏิเสธการสมัครสมาชิกได้');
        setShowRejectModal(false);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      if (error.name === 'AbortError') {
        toast.error('การร้องขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      } else {
        toast.error('ไม่สามารถปฏิเสธการสมัครสมาชิกได้');
      }
      setShowRejectModal(false);
    } finally {
      toast.dismiss(loadingToastId);
      setIsSubmitting(false); // แน่ใจว่าจะ reset เสมอ
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
          onReject={handleReject}
          onOpenRejectModal={handleOpenRejectModal}
          onViewDocument={handleViewDocument}
          isSubmitting={isSubmitting}
          onPrint={handlePrint}
        />

        {/* Reject Modal */}
        <RejectModal
          isOpen={showRejectModal}
          onClose={handleCloseRejectModal}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleReject}
          isSubmitting={isSubmitting}
          recipientEmail={recipientEmail}
          recipientName={recipientName}
          recipientLoading={recipientLoading}
          companyName={previewCompanyName}
          taxId={previewTaxId}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          title={successTitle}
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
          onGoList={handleGoToList}
          confirmText="กลับไปหน้ารายการ"
          cancelText="ปิด"
        />
      </div>
    </AdminLayout>
  );
}