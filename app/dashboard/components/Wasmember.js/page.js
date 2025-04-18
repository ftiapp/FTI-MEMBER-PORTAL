'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import MemberInfoForm from './components/MemberInfoForm';
import EditMemberForm from './components/EditMemberForm';
import InfoAlert from './components/InfoAlert';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

export default function WasMember() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    isLoading: true,
    submitted: false,
    approved: false,
    rejected: false,
    rejectReason: null
  });
  const [formData, setFormData] = useState({
    memberSearch: '',
    memberNumber: '',
    memberType: '',
    companyName: '',
    taxId: '',
    documentFile: null
  });
  
  const [formErrors, setFormErrors] = useState({
    memberSearch: false,
    memberNumber: false,
    memberType: false,
    taxId: false,
    documentFile: false
  });
  
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [showTemporaryStatus, setShowTemporaryStatus] = useState(false);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  // Filter and paginate submissions when filters or page changes
  useEffect(() => {
    // Apply filters
    let filteredResults = [...allSubmissions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredResults = filteredResults.filter(item => item.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filteredResults = filteredResults.filter(item => item.memberType === typeFilter);
    }
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(item => 
        item.companyName.toLowerCase().includes(searchLower) ||
        item.memberNumber.toLowerCase().includes(searchLower) ||
        item.taxId.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedResults = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
    
    setSubmissions(paginatedResults);
  }, [allSubmissions, statusFilter, typeFilter, searchTerm, currentPage, itemsPerPage]);

  // Fetch verification status and previous submissions when component mounts
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user || !user.id) return;
      
      try {
        const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }
        
        const data = await response.json();
        setVerificationStatus({
          isLoading: false,
          submitted: data.submitted,
          approved: data.approved,
          rejected: data.rejected,
          rejectReason: data.rejectReason
        });
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };
    
    const fetchPreviousSubmissions = async () => {
      if (!user || !user.id) return;
      
      try {
        console.log('Fetching submissions for user ID:', user.id);
        
        // Directly fetch from companies_Member table instead of using the API endpoint
        // This is a temporary solution until we fix the API endpoint
        const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }
        
        const data = await response.json();
        console.log('Verification status data:', data);
        
        // If there's member data, add it to submissions
        if (data.submitted) {
          // Create a submission object from the verification status
          const submission = {
            id: Date.now(), // Temporary ID
            memberNumber: data.memberData?.MEMBER_CODE || '',
            memberType: data.memberData?.company_type || '',
            companyName: data.memberData?.company_name || '',
            taxId: data.memberData?.tax_id || '',
            status: data.approved ? 'approved' : data.rejected ? 'rejected' : 'pending',
            rejectReason: data.rejectReason
          };
          
          console.log('Created submission from verification status:', submission);
          setSubmissions([submission]);
        }
        
        // Fetch from the submissions API endpoint
        try {
          setIsLoadingSubmissions(true);
          const submissionsResponse = await fetch(`/api/member/submissions?userId=${user.id}`);
          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();
            console.log('Submissions API response:', submissionsData);
            
            if (submissionsData.submissions && submissionsData.submissions.length > 0) {
              // Map the database results to our submission format
              const formattedSubmissions = submissionsData.submissions.map(sub => ({
                id: sub.id,
                memberNumber: sub.MEMBER_CODE,
                memberType: sub.company_type,
                companyName: sub.company_name,
                taxId: sub.tax_id,
                status: sub.Admin_Submit === 0 ? 'pending' : 
                       sub.Admin_Submit === 1 ? 'approved' : 
                       sub.Admin_Submit === 2 ? 'rejected' : 'pending',
                rejectReason: sub.reject_reason,
                documentId: sub.document_id,
                fileName: sub.file_name,
                filePath: sub.file_path,
                documentStatus: sub.document_status
              }));
              
              console.log('Formatted submissions:', formattedSubmissions);
              setAllSubmissions(formattedSubmissions);
              // Initial submissions will be filtered and paginated in useEffect
            } else {
              setAllSubmissions([]);
              setSubmissions([]);
            }
          }
        } catch (submissionsError) {
          console.error('Error fetching from submissions API:', submissionsError);
          toast.error('ไม่สามารถดึงข้อมูลการยืนยันสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
          setIsLoadingSubmissions(false);
        }
      } catch (error) {
        console.error('Error fetching previous submissions:', error);
      }
    };

    fetchVerificationStatus();
    fetchPreviousSubmissions();
  }, [user]);

  const handleSubmit = async (formSubmitData) => {
    // Prevent double submission
    if (isSubmitting) {
      toast.error('กำลังดำเนินการ โปรดรอสักครู่');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create form data for submission
      const data = new FormData();
      data.append('userId', user?.id || '');
      data.append('memberNumber', formSubmitData.memberNumber);
      data.append('memberType', formSubmitData.memberType);
      data.append('companyName', formSubmitData.companyName);
      data.append('taxId', formSubmitData.taxId);
      data.append('documentFile', formSubmitData.documentFile);
      
      // Show loading toast
      const loadingToast = toast.loading('กำลังส่งข้อมูล โปรดรอสักครู่...');
      
      // Submit data to API
      const response = await fetch('/api/member/submit', {
        method: 'POST',
        body: data
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ส่งข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 1-2 วันทำการ');
        
        // Add the current submission to the list
        const newSubmission = {
          id: Date.now(), // Use timestamp as a simple unique ID
          memberNumber: formSubmitData.memberNumber,
          memberType: formSubmitData.memberType,
          companyName: formSubmitData.companyName,
          taxId: formSubmitData.taxId,
          status: 'pending'
        };
        
        // Add to allSubmissions and let the filter useEffect handle the rest
        setAllSubmissions(prev => [...prev, newSubmission]);
        
        // Show temporary status for 10 seconds
        setShowTemporaryStatus(true);
        setTimeout(() => {
          setShowTemporaryStatus(false);
        }, 10000); // 10 seconds
        
        // Reset form after successful submission
        setFormData({
          memberSearch: '',
          memberNumber: '',
          memberType: '',
          companyName: '',
          taxId: '',
          documentFile: null
        });
      } else {
        // Show error message
        toast.error(result.message || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        
        // If it's a duplicate member code, show a more prominent notification
        if (result.message && result.message.includes('รหัสสมาชิก')) {
          // Create a notification that the member code is already registered
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
          notification.innerHTML = `
            <div class="flex items-center">
              <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <p><strong>รหัสสมาชิกนี้ถูกใช้งานแล้ว</strong> กรุณาตรวจสอบอีกครั้ง</p>
            </div>
            <button class="absolute top-0 right-0 mt-2 mr-2 text-red-700" onclick="this.parentElement.remove()">
              &times;
            </button>
          `;
          document.body.appendChild(notification);
          
          // Remove after 5 seconds
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 5000);
        }
        
        // Reset errors
        setFormErrors({
          memberSearch: false,
          memberNumber: false,
          memberType: false,
          taxId: false,
          documentFile: false
        });
        
        // Update verification status but don't hide form
        setVerificationStatus(prev => ({
          ...prev,
          isLoading: false,
          submitted: true,
          approved: false,
          rejected: false,
          rejectReason: null
        }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total pages for pagination
  const calculateTotalPages = () => {
    // Apply filters to get filtered count
    let filteredResults = [...allSubmissions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredResults = filteredResults.filter(item => item.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filteredResults = filteredResults.filter(item => item.memberType === typeFilter);
    }
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(item => 
        item.companyName.toLowerCase().includes(searchLower) ||
        item.memberNumber.toLowerCase().includes(searchLower) ||
        item.taxId.toLowerCase().includes(searchLower)
      );
    }
    
    return Math.ceil(filteredResults.length / itemsPerPage);
  };
  
  // Function to handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Function to render all submissions with their status
  const renderSubmissions = () => {
    if (allSubmissions.length === 0 && !isLoadingSubmissions) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">ข้อมูลการยืนยันสมาชิกเดิม</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">ไม่พบข้อมูลการยืนยันสมาชิก</p>
          </div>
        </div>
      );
    }
    
    if (isLoadingSubmissions) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">ข้อมูลการยืนยันสมาชิกเดิม</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="ml-3 text-blue-700">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      );
    }
    
    const totalPages = calculateTotalPages();
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">ข้อมูลการยืนยันสมาชิกเดิม</h3>
        
        {/* Filter and search controls */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ค้นหาจากชื่อบริษัท รหัสสมาชิก หรือเลขประจำตัวผู้เสียภาษี"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
            <select
              id="statusFilter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ไม่อนุมัติ</option>
            </select>
          </div>
          
          {/* Type filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">ประเภทสมาชิก</label>
            <select
              id="typeFilter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              <option value="สามัญ">สามัญ</option>
              <option value="วิสามัญ">วิสามัญ</option>
              <option value="กิตติมศักดิ์">กิตติมศักดิ์</option>
            </select>
          </div>
        </div>
        
        {/* Submissions list */}
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">ไม่พบข้อมูลที่ตรงกับเงื่อนไขที่ค้นหา</p>
            </div>
          ) : (
            submissions.map(submission => {
              // Determine status styling based on submission status
              let statusStyle = {};
              let statusText = '';
              
              if (submission.status === 'pending') {
                statusStyle = { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
                statusText = 'รอตรวจสอบ';
              } else if (submission.status === 'approved') {
                statusStyle = { bgColor: 'bg-green-100', textColor: 'text-green-800' };
                statusText = 'อนุมัติแล้ว';
              } else if (submission.status === 'rejected') {
                statusStyle = { bgColor: 'bg-red-100', textColor: 'text-red-800' };
                statusText = 'ไม่อนุมัติ';
              }
              
              return (
                <div key={`submission-${submission.id}`} className={`border rounded-lg p-4 ${submission.status === 'rejected' ? 'bg-red-50 border-red-200' : submission.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${submission.status === 'rejected' ? 'bg-red-500' : submission.status === 'approved' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{submission.companyName}</p>
                          <p className="text-sm text-gray-600">รหัสสมาชิก: {submission.memberNumber} | ประเภท: {submission.memberType}</p>
                          {submission.status === 'rejected' && submission.rejectReason && (
                            <p className="mt-2 text-sm text-red-600">เหตุผลที่ไม่อนุมัติ: {submission.rejectReason}</p>
                          )}
                          
                          {/* Add edit and delete buttons for rejected submissions */}
                          {submission.status === 'rejected' && (
                            <div className="mt-3 flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSubmissionToEdit({...submission, userId: user?.id});
                                  setShowEditForm(true);
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                แก้ไขข้อมูล
                              </button>
                              <button 
                                onClick={() => {
                                  setSubmissionToDelete(submission);
                                  setShowDeleteModal(true);
                                }}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                ลบข้อมูล
                              </button>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor} rounded-full`}>{statusText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                ก่อนหน้า
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 border-t border-b ${currentPage === i + 1 ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                ถัดไป
              </button>
            </nav>
          </div>
        )}
      </div>
    );
  };

  // Function to handle submission deletion
  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Call API to delete the submission
      const response = await fetch(`/api/member/delete-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: submissionToDelete.id,
          userId: user?.id,
          memberNumber: submissionToDelete.memberNumber
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove the deleted submission from the list
        setAllSubmissions(prev => prev.filter(item => item.id !== submissionToDelete.id));
        toast.success('ลบข้อมูลเรียบร้อยแล้ว');
      } else {
        toast.error(result.message || 'ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Always show existing submissions */}
      {renderSubmissions()}
      
      {/* Show loading indicator when submitting */}
      {isSubmitting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
            <p className="text-blue-700">กำลังดำเนินการ โปรดรอสักครู่...</p>
          </div>
        </div>
      )}
      
      {/* Always show form */}
      <div className={showTemporaryStatus || isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
        <InfoAlert />
        <MemberInfoForm 
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          selectedResult={selectedResult}
          setSelectedResult={setSelectedResult}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          showSubmitButton={!isSubmitting}
        />
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => {
                setShowDeleteModal(false);
                setSubmissionToDelete(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              
              <h3 className="text-xl font-bold text-gray-900 mt-4">ยืนยันการลบข้อมูล</h3>
              
              <p className="text-gray-600 mt-2">
                คุณต้องการลบข้อมูลการยืนยันสมาชิกสำหรับ <span className="font-medium">{submissionToDelete?.companyName}</span> ใช่หรือไม่?
              </p>
              
              <p className="text-gray-600 mt-1">
                รหัสสมาชิก: <span className="font-medium">{submissionToDelete?.memberNumber}</span>
              </p>
              
              <p className="text-sm text-red-600 mt-2">
                การดำเนินการนี้ไม่สามารถเรียกคืนได้
              </p>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSubmissionToDelete(null);
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  ยกเลิก
                </button>
                
                <button
                  onClick={handleDeleteSubmission}
                  disabled={isDeleting}
                  className="flex-1 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none flex justify-center items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังลบ...
                    </>
                  ) : 'ลบข้อมูล'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Member Form Modal */}
      {showEditForm && submissionToEdit && (
        <EditMemberForm
          submission={submissionToEdit}
          onClose={() => {
            setShowEditForm(false);
            setSubmissionToEdit(null);
          }}
          onSuccess={(updatedSubmission) => {
            // Update the submission in the list
            setAllSubmissions(prev => 
              prev.map(item => 
                item.id === updatedSubmission.id ? {
                  ...item,
                  memberNumber: updatedSubmission.memberNumber,
                  memberType: updatedSubmission.memberType,
                  companyName: updatedSubmission.companyName,
                  taxId: updatedSubmission.taxId,
                  status: 'pending'
                } : item
              )
            );
          }}
        />
      )}
    </div>
  );
}
