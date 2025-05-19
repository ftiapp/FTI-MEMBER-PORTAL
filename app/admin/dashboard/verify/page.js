'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import SortableHeader from './SortableHeader';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import ExistingMember from './existing-member';
import MemberDetailsModal from './MemberDetailsModal';
import RejectReasonModal from './RejectReasonModal';

export default function VerifyMembers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') || '0';
  
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showExistingMemberModal, setShowExistingMemberModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // เพิ่ม state สำหรับ search, filter, sort
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Status labels for display
  const statusLabels = {
    '0': 'รอการอนุมัติ',
    '1': 'อนุมัติแล้ว',
    '2': 'ปฏิเสธแล้ว'
  };

  // Fetch members when the page or status changes
  useEffect(() => {
    fetchMembers();
  }, [pagination.page, statusParam, searchTerm, dateRange.from, dateRange.to, sortField, sortOrder]);

  /**
   * Fetches members based on status filter
   */
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      let url = `/api/admin/members?page=${pagination.page}&limit=${pagination.limit}&status=${statusParam}`;
      if (searchTerm.length >= 2) url += `&term=${encodeURIComponent(searchTerm)}`;
      if (dateRange.from) url += `&from=${dateRange.from}`;
      if (dateRange.to) url += `&to=${dateRange.to}`;
      if (sortField) url += `&sortField=${sortField}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;
      const response = await fetch(url);
      
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
  const handleApprove = async (member, approveComment) => {
    try {
      setIsApproving(true);
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
      } else {
        toast.error(result.message || 'ไม่สามารถอนุมัติสมาชิกได้');
      }
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติสมาชิก');
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Rejects a member verification request with a reason and optional comment
   */
  const handleReject = async (reason, comment) => {
    if (!selectedMember) return;
    
    try {
      setIsRejecting(true);
      // Get the first document ID from the documents array
      const documentId = selectedMember.documents && selectedMember.documents.length > 0 ? selectedMember.documents[0].id : null;
      
      if (!documentId) {
        toast.error('ไม่พบเอกสารสำหรับสมาชิกนี้');
        setShowRejectModal(false);
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
          reason: reason,
          comment: comment || null
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ปฏิเสธสมาชิกเรียบร้อยแล้ว');
        setShowRejectModal(false);
        fetchMembers();
        setSelectedMember(null);
      } else {
        toast.error(result.message || 'ไม่สามารถปฏิเสธสมาชิกได้');
      }
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธสมาชิก');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleOpenReject = () => {
    setShowRejectModal(true);
  };

  const handleCloseReject = () => {
    setShowRejectModal(false);
  };

  const handleExistingMemberSuccess = () => {
    setShowExistingMemberModal(false);
    fetchMembers();
  };

  const handleStatusChange = (status) => {
    router.push(`/admin/dashboard/verify?status=${status}`);
  };
  
  /**
   * Delete a member (only shown for rejected members)
   */
  const handleDeleteMember = async (memberId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await fetch('/api/admin/delete-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ลบข้อมูลสมาชิกเรียบร้อยแล้ว');
        fetchMembers();
      } else {
        toast.error(result.message || 'ไม่สามารถลบข้อมูลได้');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white shadow-md rounded-lg p-6 border border-[#1e3a8a] border-opacity-20"
      >
        <h2 className="text-xl font-semibold mb-4 text-[#1e3a8a] border-b pb-2 border-[#1e3a8a] border-opacity-20">
          สมาชิก - {statusLabels[statusParam]}
        </h2>
        {/* Status filter tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => handleStatusChange('0')}
            className={`py-2 px-4 font-medium text-sm border-b-2 mr-4 transition-colors ${
              statusParam === '0' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            รอการอนุมัติ
          </button>
          <button
            onClick={() => handleStatusChange('1')}
            className={`py-2 px-4 font-medium text-sm border-b-2 mr-4 transition-colors ${
              statusParam === '1' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            อนุมัติแล้ว
          </button>
          <button
            onClick={() => handleStatusChange('2')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              statusParam === '2' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ปฏิเสธแล้ว
          </button>
        </div>
        {/* Search & Filter Bar */}
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm}
          dateRange={dateRange}
          onDateChange={setDateRange}
          placeholder="ค้นหาด้วยชื่อบริษัทหรือรหัสสมาชิก"
        />
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
                    <SortableHeader field="company_name" label="บริษัท" sortField={sortField} sortOrder={sortOrder} onSort={(f, o) => { setSortField(f); setSortOrder(o); }} />
                    <SortableHeader field="name" label="ชื่อ-นามสกุล" sortField={sortField} sortOrder={sortOrder} onSort={(f, o) => { setSortField(f); setSortOrder(o); }} />
                    <SortableHeader field="email" label="อีเมล" sortField={sortField} sortOrder={sortOrder} onSort={(f, o) => { setSortField(f); setSortOrder(o); }} />
                    <SortableHeader field="created_at" label="วันที่ลงทะเบียน" sortField={sortField} sortOrder={sortOrder} onSort={(f, o) => { setSortField(f); setSortOrder(o); }} />
                    <SortableHeader field="Admin_Submit" label="สถานะ" sortField={sortField} sortOrder={sortOrder} onSort={(f, o) => { setSortField(f); setSortOrder(o); }} />
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ผู้ดำเนินการ</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">การดำเนินการ</th>
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
                        <div className="text-sm text-gray-900">{member.firstname} {member.lastname}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(member.Admin_Submit === 1 || member.Admin_Submit === 2) && member.admin_name ? 
                            member.admin_name : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewDetails(member)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            ดูรายละเอียด
                          </button>
                          
                          {/* Delete button for rejected members */}
                          {member.Admin_Submit === 2 && (
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              ลบข้อมูล
                            </button>
                          )}
                        </div>
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
      </motion.div>
      
      {/* Member Details Modal */}
      {selectedMember && !showExistingMemberModal && !showRejectModal && (
        <MemberDetailsModal 
          member={selectedMember}
          onClose={handleCloseDetails}
          onApprove={handleApprove}
          onOpenReject={handleOpenReject}
        />
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <RejectReasonModal
          onReject={handleReject}
          onClose={handleCloseReject}
        />
      )}
      
      {/* Existing Member Modal */}
      {showExistingMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-[#1e3a8a] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto border border-gray-200">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">ยืนยันสมาชิกเดิม</h3>
              <button
                onClick={() => setShowExistingMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ExistingMember 
                member={selectedMember} 
                onSuccess={handleExistingMemberSuccess}
                onClose={() => setShowExistingMemberModal(false)}
              />
            </div>
          </div>
        </div>
      )}
      </>
    </AdminLayout>
  );
}