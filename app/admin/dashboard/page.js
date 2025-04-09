'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingMembers();
  }, [pagination.page]);

  const fetchPendingMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/pending-members?page=${pagination.page}&limit=${pagination.limit}`);
      
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
        setPendingMembers(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.message || 'ไม่สามารถดึงข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching pending members:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleCloseDetails = () => {
    setSelectedMember(null);
  };

  const handleApprove = async (member) => {
    try {
      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: member.id,
          documentId: member.document_id,
          action: 'approve'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('อนุมัติสมาชิกเรียบร้อยแล้ว');
        fetchPendingMembers();
        setSelectedMember(null);
      } else {
        toast.error(result.message || 'ไม่สามารถอนุมัติสมาชิกได้');
      }
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติสมาชิก');
    }
  };

  const handleReject = async () => {
    if (!selectedMember) return;
    
    try {
      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: selectedMember.id,
          documentId: selectedMember.document_id,
          action: 'reject',
          reason: rejectReason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ปฏิเสธสมาชิกเรียบร้อยแล้ว');
        setShowRejectModal(false);
        setRejectReason('');
        fetchPendingMembers();
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            หน้าควบคุมผู้ดูแลระบบ
          </h1>
          <button
            onClick={() => router.push('/admin/logout')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">สมาชิกที่รอการอนุมัติ</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                ไม่มีสมาชิกที่รอการอนุมัติ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        บริษัท
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เลขทะเบียน
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อีเมล
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่ส่ง
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{member.company_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.company_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.registration_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(member.created_at).toLocaleDateString('th-TH')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(member)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && pendingMembers.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  แสดง <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> ถึง <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> จากทั้งหมด <span className="font-medium">{pagination.total}</span> รายการ
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === pagination.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">รายละเอียดสมาชิก</h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ชื่อบริษัท</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.company_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ประเภทสมาชิก</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.company_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">เลขทะเบียนนิติบุคคล</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.registration_number}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">อีเมล</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.phone || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">เว็บไซต์</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.website || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">ที่อยู่</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.address || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">จังหวัด</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.province || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">รหัสไปรษณีย์</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.postal_code || '-'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">เอกสาร</h4>
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedMember.document_type === 'company_registration' ? 'หนังสือรับรองบริษัท' : 
                         selectedMember.document_type === 'tax_registration' ? 'ทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)' : 
                         'เอกสารอื่นๆ'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">อัปโหลดเมื่อ {new Date(selectedMember.created_at).toLocaleString('th-TH')}</p>
                    </div>
                    <a 
                      href={selectedMember.file_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                    >
                      ดูเอกสาร
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={openRejectModal}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                ปฏิเสธ
              </button>
              <button
                onClick={() => handleApprove(selectedMember)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ระบุเหตุผลในการปฏิเสธ</h3>
            </div>
            
            <div className="px-6 py-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="ระบุเหตุผลในการปฏิเสธ..."
              ></textarea>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={!rejectReason.trim()}
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
