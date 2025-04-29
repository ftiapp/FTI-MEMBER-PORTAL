'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function MemberDetailsModal({ 
  member, 
  onClose, 
  onApprove, 
  onOpenReject,
  showActions = true
}) {
  const [approveComment, setApproveComment] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Handle approve action
  const handleApprove = async () => {
    if (onApprove) {
      setIsApproving(true);
      try {
        await onApprove(member, approveComment);
      } catch (error) {
        console.error('Error approving member:', error);
      } finally {
        setIsApproving(false);
      }
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (onOpenReject) {
      setIsRejecting(true);
      try {
        await onOpenReject(member);
      } catch (error) {
        console.error('Error rejecting member:', error);
      } finally {
        setIsRejecting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e3a8a] bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="px-6 py-4 border-b border-[#1e3a8a] border-opacity-20 flex justify-between items-center bg-[#1e3a8a] text-white">
          <h3 className="text-lg font-semibold">
            รายละเอียดสมาชิก
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">ข้อมูลบริษัท</h4>
              <div className="space-y-2">
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">รหัสสมาชิก:</span> {member.MEMBER_CODE || 'ยังไม่มีรหัสสมาชิก'}</p>
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">ชื่อบริษัท:</span> {member.company_name}</p>
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">ประเภทธุรกิจ:</span> {member.company_type}</p>
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">เลขประจำตัวผู้เสียภาษี:</span> {member.tax_id}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">ข้อมูลผู้ส่งคำขอ</h4>
              <div className="space-y-2">
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">ชื่อ-นามสกุล:</span> {member.firstname} {member.lastname}</p>
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">โทรศัพท์:</span> {member.phone || '-'}</p>
                <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">อีเมล:</span> {member.email ? <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a> : '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">เอกสาร</h4>
            {member.documents && member.documents.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="bg-blue-50 p-3 mb-3 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <p className="text-blue-700 font-medium">
                      เอกสารทั้งหมดสำหรับรหัสสมาชิก: <span className="font-bold">{member.MEMBER_CODE || 'ยังไม่มีรหัสสมาชิก'}</span>
                    </p>
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#1e3a8a] text-white">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        ชื่อเอกสาร
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        รหัสสมาชิก
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        วันที่อัปโหลด
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        ดาวน์โหลด
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {member.documents.map((doc, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {doc.file_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="font-medium">{doc.MEMBER_CODE || member.MEMBER_CODE || '-'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {doc.status === 'pending' ? 'รอการอนุมัติ' : 
                             doc.status === 'approved' ? 'อนุมัติแล้ว' : 
                             'ปฏิเสธแล้ว'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('th-TH') : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <a 
                            href={doc.file_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#1e3a8a] hover:text-white font-medium px-3 py-1 bg-[#1e3a8a] bg-opacity-10 rounded-md hover:bg-[#1e3a8a] transition-colors"
                          >
                            ดาวน์โหลด
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">ไม่พบเอกสาร</p>
            )}
          </div>
          
          {/* Admin Comments */}
          {member.admin_comment && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-md font-semibold mb-2">ความคิดเห็นจากผู้ดูแลระบบ</h4>
              <p className="text-gray-700">{member.admin_comment}</p>
            </div>
          )}
          
          {/* Rejection Reason */}
          {member.reject_reason && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <h4 className="text-md font-semibold mb-2 text-red-700">เหตุผลที่ปฏิเสธ</h4>
              <p className="text-red-700">{member.reject_reason}</p>
            </div>
          )}
          
          {/* Action Buttons for Pending Members */}
          {showActions && member.Admin_Submit === 0 && (
            <div className="mt-6 flex justify-end space-x-3">
              <div className="flex-1">
                <label htmlFor="approveComment" className="block text-sm font-medium text-gray-700 mb-1">
                  ความคิดเห็น (ไม่บังคับ)
                </label>
                <textarea
                  id="approveComment"
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="ใส่ความคิดเห็นเพิ่มเติม (จะแสดงให้สมาชิกเห็น)"
                  rows={2}
                />
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isApproving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังอนุมัติ...
                    </>
                  ) : (
                    'อนุมัติ'
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="flex-1 justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isRejecting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังปฏิเสธ...
                    </>
                  ) : (
                    'ปฏิเสธ'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}