'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

export default function VerifyMembers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') || '0';
  
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Status labels for display
  const statusLabels = {
    '0': 'รอการอนุมัติ',
    '1': 'อนุมัติแล้ว',
    '2': 'ปฏิเสธแล้ว'
  };

  // Fetch members when the page or status changes
  useEffect(() => {
    fetchMembers();
  }, [pagination.page, statusParam]);

  /**
   * Fetches members based on status filter
   */
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/members?page=${pagination.page}&limit=${pagination.limit}&status=${statusParam}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('กรุณาเข้าสู่ระบบ');
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMembers(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.message || 'ไม่สามารถดึงข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles pagination page changes
   */
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  /**
   * Opens the member details modal
   */
  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleCloseDetails = () => {
    setSelectedMember(null);
  };

  /**
   * Approves a member verification request
   */
  const handleApprove = async (member) => {
    try {
      // Get the first document ID from the documents array
      const documentId = member.documents && member.documents.length > 0 ? member.documents[0].id : null;
      
      if (!documentId) {
        toast.error('ไม่พบเอกสารสำหรับสมาชิกนี้');
        return;
      }

      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: member.id,
          documentId: documentId,
          action: 'approve',
          comment: approveComment
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('อนุมัติสมาชิกเรียบร้อยแล้ว');
        fetchMembers();
        setSelectedMember(null);
        setApproveComment('');
      } else {
        toast.error(result.message || 'ไม่สามารถอนุมัติสมาชิกได้');
      }
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติสมาชิก');
    }
  };

  /**
   * Rejects a member verification request with a reason
   */
  const handleReject = async () => {
    if (!selectedMember) return;
    
    try {
      // Get the first document ID from the documents array
      const documentId = selectedMember.documents && selectedMember.documents.length > 0 ? selectedMember.documents[0].id : null;
      
      if (!documentId) {
        toast.error('ไม่พบเอกสารสำหรับสมาชิกนี้');
        closeRejectModal();
        return;
      }

      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: selectedMember.id,
          documentId: documentId,
          action: 'reject',
          reason: rejectReason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ปฏิเสธสมาชิกเรียบร้อยแล้ว');
        setShowRejectModal(false);
        setRejectReason('');
        fetchMembers();
        setSelectedMember(null);
      } else {
        toast.error(result.message || 'ไม่สามารถปฏิเสธสมาชิกได้');
      }
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธสมาชิก');
    }
  };

  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow-md rounded-lg p-6 border border-[#1e3a8a] border-opacity-20">
        <h2 className="text-xl font-semibold mb-4 text-[#1e3a8a] border-b pb-2 border-[#1e3a8a] border-opacity-20">
          สมาชิก - {statusLabels[statusParam]}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-[#1e3a8a] font-medium">ไม่พบข้อมูลสมาชิก</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#1e3a8a] divide-opacity-10 border border-[#1e3a8a] border-opacity-20 rounded-lg overflow-hidden">
                <thead className="bg-[#1e3a8a] text-white">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      บริษัท
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      วันที่ลงทะเบียน
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-[#1e3a8a] hover:bg-opacity-5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.company_name}</div>
                        <div className="text-sm text-gray-500">{member.MEMBER_CODE || 'ยังไม่มีรหัสสมาชิก'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(member.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${member.Admin_Submit === 0 ? 'bg-yellow-100 text-yellow-800' : 
                            member.Admin_Submit === 1 ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {member.Admin_Submit === 0 ? 'รอการอนุมัติ' : 
                           member.Admin_Submit === 1 ? 'อนุมัติแล้ว' : 
                           'ปฏิเสธแล้ว'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(member)}
                          className="text-white bg-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-90 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="relative z-0 inline-flex rounded-md shadow-md -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-5'
                    }`}
                  >
                    &laquo; ก่อนหน้า
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-[#1e3a8a] border-[#1e3a8a] text-white'
                          : 'text-gray-700 hover:bg-[#1e3a8a] hover:bg-opacity-5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-5'
                    }`}
                  >
                    ถัดไป &raquo;
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-[#1e3a8a] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="px-6 py-4 border-b border-[#1e3a8a] border-opacity-20 flex justify-between items-center bg-[#1e3a8a] text-white">
              <h3 className="text-lg font-semibold">
                รายละเอียดสมาชิก
              </h3>
              <button
                onClick={handleCloseDetails}
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
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">รหัสสมาชิก:</span> {selectedMember.MEMBER_CODE || 'ยังไม่มีรหัสสมาชิก'}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">ชื่อบริษัท:</span> {selectedMember.company_name}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">ประเภทธุรกิจ:</span> {selectedMember.company_type}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">เลขทะเบียนบริษัท:</span> {selectedMember.registration_number}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">เลขประจำตัวผู้เสียภาษี:</span> {selectedMember.tax_id}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">ข้อมูลติดต่อ</h4>
                  <div className="space-y-2">
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">ที่อยู่:</span> {selectedMember.address}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">จังหวัด:</span> {selectedMember.province}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">รหัสไปรษณีย์:</span> {selectedMember.postal_code}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">โทรศัพท์:</span> {selectedMember.phone}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">อีเมล:</span> {selectedMember.email}</p>
                    <p className="text-gray-800"><span className="font-medium text-[#1e3a8a]">เว็บไซต์:</span> {selectedMember.website || '-'}</p>
                  </div>
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">เอกสาร</h4>
                {selectedMember.documents && selectedMember.documents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="bg-blue-50 p-3 mb-3 rounded-md border border-blue-200">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                        <p className="text-blue-700 font-medium">
                          เอกสารทั้งหมดสำหรับรหัสสมาชิก: <span className="font-bold">{selectedMember.MEMBER_CODE || 'ยังไม่มีรหัสสมาชิก'}</span>
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
                        {selectedMember.documents.map((doc, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {doc.file_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className="font-medium">{doc.MEMBER_CODE || selectedMember.MEMBER_CODE || '-'}</span>
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
              {selectedMember.admin_comment && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-md font-semibold mb-2">ความคิดเห็นจากผู้ดูแลระบบ</h4>
                  <p className="text-gray-700">{selectedMember.admin_comment}</p>
                </div>
              )}
              
              {/* Rejection Reason */}
              {selectedMember.reject_reason && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <h4 className="text-md font-semibold mb-2 text-red-700">เหตุผลที่ปฏิเสธ</h4>
                  <p className="text-red-700">{selectedMember.reject_reason}</p>
                </div>
              )}
              
              {/* Action Buttons for Pending Members */}
              {selectedMember.Admin_Submit === 0 && (
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
                      onClick={() => handleApprove(selectedMember)}
                      className="flex-1 justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      อนุมัติ
                    </button>
                    <button
                      onClick={openRejectModal}
                      className="flex-1 justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] transition-colors"
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-[#1e3a8a] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
            <div className="px-6 py-4 border-b border-[#1e3a8a] border-opacity-20 bg-[#1e3a8a] text-white">
              <h3 className="text-lg font-semibold">
                ระบุเหตุผลการปฏิเสธ
              </h3>
            </div>
            
            <div className="p-6">
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผล <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผลที่ปฏิเสธ"
                required
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 bg-white text-[#1e3a8a] border border-[#1e3a8a] border-opacity-20 rounded-md hover:bg-[#1e3a8a] hover:bg-opacity-5 transition-colors font-medium shadow-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    rejectReason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
