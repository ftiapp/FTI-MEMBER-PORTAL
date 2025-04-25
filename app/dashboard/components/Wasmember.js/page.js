'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MemberInfoForm from './components/MemberInfoForm';
import EditMemberForm from './components/EditMemberForm';
import InfoAlert from './components/InfoAlert';

import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

export default function WasMember() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
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
const [showSuccessMessage, setShowSuccessMessage] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
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

  // Check for edit parameter in URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && user) {
      // Find the submission to edit
      const fetchSubmissionToEdit = async () => {
        try {
          const response = await fetch(`/api/member/get-submission-details?id=${editId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.submission) {
              const submission = {
                id: data.submission.id,
                memberNumber: data.submission.MEMBER_CODE,
                memberType: data.submission.company_type,
                companyName: data.submission.company_name,
                taxId: data.submission.tax_id,
                status: data.submission.Admin_Submit === 0 ? 'pending' : 
                       data.submission.Admin_Submit === 1 ? 'approved' : 
                       data.submission.Admin_Submit === 2 ? 'rejected' : 'pending',
                rejectReason: data.submission.reject_reason,
                documentId: data.submission.document_id,
                fileName: data.submission.file_name,
                filePath: data.submission.file_path,
                documentStatus: data.submission.document_status
              };
              setSubmissionToEdit(submission);
              setShowEditForm(true);
            }
          }
        } catch (error) {
          console.error('Error fetching submission details:', error);
          toast.error('ไม่สามารถดึงข้อมูลการยืนยันสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
        }
      };
      
      fetchSubmissionToEdit();
    }
  }, [searchParams, user]);

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
        toast.success('ส่งข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบภายใน1-2 วันทำการ');

        // Show green success message bar
        setSuccessMessage('ส่งข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 6000);

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
        // Reset form immediately after submit
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
              <p><strong>รหัสสมาชิกนี้ถูกใช้งาน</strong> กรุณาตรวจสอบอีกครั้งง</p>
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
  
  // Function to render the member verification form
  const renderMemberVerificationForm = () => {
    return (
      <div className={showTemporaryStatus || isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <InfoAlert />
      </motion.div>
      
      {/* Success message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg mb-4 shadow flex items-center" 
            role="alert"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FaCheckCircle className="w-6 h-6 mr-2 text-green-600" />
            </motion.div>
            <motion.span 
              className="font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {successMessage}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Show loading indicator when submitting */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <motion.p 
                className="text-blue-700"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                กำลังดำเนินการ โปรดรอสักครู่...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Show member verification form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {renderMemberVerificationForm()}
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowDeleteModal(false);
                setSubmissionToDelete(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            <motion.div className="text-center">
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </motion.svg>
              
              <motion.h3 
                className="text-xl font-bold text-gray-900 mt-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                ยืนยันการลบข้อมูล
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                คุณต้องการลบข้อมูลการยืนยันสมาชิกสำหรับ <span className="font-medium">{submissionToDelete?.companyName}</span> ใช่หรือไม่?
              </motion.p>
              
              <motion.p 
                className="text-gray-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                รหัสสมาชิก: <span className="font-medium">{submissionToDelete?.memberNumber}</span>
              </motion.p>
              
              <motion.p 
                className="text-sm text-red-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                การดำเนินการนี้ไม่สามารถเรียกคืนได้
              </motion.p>
              
              <motion.div 
                className="mt-6 flex space-x-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSubmissionToDelete(null);
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                >
                  ยกเลิก
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteSubmission}
                  disabled={isDeleting}
                  className="flex-1 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none flex justify-center items-center transition-all duration-200"
                >
                  {isDeleting ? (
                    <>
                      <motion.div 
                        className="rounded-full h-4 w-4 border-b-2 border-white mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      ></motion.div>
                      กำลังลบ...
                    </>
                  ) : 'ลบข้อมูล'}
                </motion.button>
              </motion.div>
            </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Member Form Modal */}
      <AnimatePresence>
        {showEditForm && submissionToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
