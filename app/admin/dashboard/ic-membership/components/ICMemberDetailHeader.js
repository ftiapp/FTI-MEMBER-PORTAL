'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/app/lib/utils';

/**
 * Header component for IC Membership detail page
 * Shows basic information and status controls
 */
export default function ICMemberDetailHeader({ application, onStatusChange, isLoading }) {
  const [reason, setReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 1:
        return 'bg-green-100 text-green-800 border-green-300';
      case 2:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'รอพิจารณา';
      case 1:
        return 'อนุมัติแล้ว';
      case 2:
        return 'ปฏิเสธแล้ว';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };
  
  // Handle approve application
  const handleApprove = async () => {
    if (window.confirm('คุณต้องการอนุมัติการสมัครสมาชิกนี้ใช่หรือไม่?')) {
      await onStatusChange(1);
    }
  };
  
  // Handle reject application
  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    await onStatusChange(2, reason);
    setShowRejectModal(false);
    setReason('');
  };
  
  // Handle print application
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            รายละเอียดการสมัครสมาชิก IC
          </h1>
          <p className="text-gray-600">
            วันที่สมัคร: {formatDate(application?.created_at)}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusBadge(application?.status)}`}>
            {getStatusText(application?.status)}
          </span>
          
          <div className="ml-4 print:hidden">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
            >
              พิมพ์เอกสาร
            </button>
            
            {application?.status === 0 && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2"
                >
                  {isLoading ? 'กำลังดำเนินการ...' : 'อนุมัติสมัครสมาชิก'}
                </button>
                
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  {isLoading ? 'กำลังดำเนินการ...' : 'ปฏิเสธสมัครสมาชิก'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">ข้อมูลผู้สมัคร</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="mb-2">
              <span className="font-medium">คำนำหน้าชื่อ (ไทย):</span> {application?.prename_th || application?.prenameTh || '-'}
            </div>
            <div className="mb-2">
              <span className="font-medium">คำนำหน้าชื่อ (อังกฤษ):</span> {application?.prename_en || application?.prenameEn || '-'}
            </div>
            <div className="mb-2">
              <span className="font-medium">คำนำหน้าชื่อ (อื่นๆ):</span> {application?.prename_other || application?.prenameOther || '-'}
            </div>
            <div className="mb-2">
              <span className="font-medium">ชื่อ-นามสกุล (ไทย):</span> {application?.first_name_thai} {application?.last_name_thai}
            </div>
            <div className="mb-2">
              <span className="font-medium">ชื่อ-นามสกุล (อังกฤษ):</span> {application?.first_name_english} {application?.last_name_english}
            </div>
            <div className="mb-2">
              <span className="font-medium">เลขบัตรประชาชน:</span> {application?.id_card_number}
            </div>
            <div className="mb-2">
              <span className="font-medium">อีเมล:</span> {application?.email}
            </div>
            <div className="mb-2">
              <span className="font-medium">โทรศัพท์:</span> {application?.phone}
            </div>
            <div className="mb-2">
              <span className="font-medium">มือถือ:</span> {application?.mobile}
            </div>
            <div>
              <span className="font-medium">แฟกซ์:</span> {application?.fax || '-'}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">กลุ่มสมาชิก</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="mb-2">
              <span className="font-medium">กลุ่มอุตสาหกรรม:</span> {application?.industryGroup?.name_thai || 'ไม่ได้เลือก'}
            </div>
            <div>
              <span className="font-medium">สภาอุตสาหกรรมจังหวัด:</span> {application?.provinceChapter?.name_thai || 'ไม่ได้เลือก'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">ปฏิเสธการสมัครสมาชิก</h2>
            <p className="mb-4">กรุณาระบุเหตุผลในการปฏิเสธการสมัครสมาชิกนี้</p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลในการปฏิเสธ"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              rows="4"
            />
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
              >
                ยกเลิก
              </button>
              
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
