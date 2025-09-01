'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MemberInfoForm from './components/MemberInfoForm';
import EditMemberForm from './components/EditMemberForm';
import InfoAlert from './components/InfoAlert';
import WasMemberStepIndicator from './components/WasMemberStepIndicator';
import CompanyList from './components/CompanyList';
import ReviewStep from './components/ReviewStep';

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
    compPersonCode: '',
    registCode: '',
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
  
  // State for multi-company management
  const [companies, setCompanies] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [editingCompanyIndex, setEditingCompanyIndex] = useState(null);
  const MAX_COMPANIES = 10;
  
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // State to track verified companies (to prevent re-selection)
  const [verifiedCompanies, setVerifiedCompanies] = useState([]);
  const [nonSelectableCompanies, setNonSelectableCompanies] = useState([]);
  
  // For debugging
  useEffect(() => {
    console.log('Current non-selectable companies:', nonSelectableCompanies);
  }, [nonSelectableCompanies]);
  
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
    
    // Extract verified companies for preventing re-selection (trimmed)
    const verified = filteredResults
      .filter(item => item.status === 'approved')
      .map(item => (item.memberNumber || '').trim());
    setVerifiedCompanies(verified);
  }, [allSubmissions, statusFilter, typeFilter, searchTerm, currentPage, itemsPerPage]);

  // Check for edit parameter in URL and other parameters
  useEffect(() => {
    const editId = searchParams.get('edit');
    const tabParam = searchParams.get('tab');
    
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
                adminSubmit: sub.Admin_Submit, // เพิ่มฟิลด์นี้เพื่อใช้ในการตรวจสอบสถานะ
                rejectReason: sub.reject_reason,
                documentId: sub.document_id,
                fileName: sub.file_name,
                filePath: sub.file_path,
                documentStatus: sub.document_status
              }));
              
              console.log('Formatted submissions:', formattedSubmissions);
              setAllSubmissions(formattedSubmissions);
              
              // Extract verified companies to prevent re-selection
              // Group submissions by memberNumber and find the latest submission for each memberNumber
              const latestSubmissionByMemberCode = {};
              formattedSubmissions.forEach(sub => {
                // ใช้ updated_at หรือ created_at เป็นตัวเปรียบเทียบแทน id
                const subDate = sub.updated_at ? new Date(sub.updated_at) : new Date(sub.created_at);
                const code = (sub.memberNumber || '').trim();
                const currentLatest = latestSubmissionByMemberCode[code];
                const currentLatestDate = currentLatest ? 
                  (currentLatest.updated_at ? new Date(currentLatest.updated_at) : new Date(currentLatest.created_at)) : 
                  new Date(0);
                
                // ถ้ายังไม่มีรายการสำหรับรหัสสมาชิกนี้ หรือรายการนี้ใหม่กว่ารายการที่มีอยู่
                if (!currentLatest || subDate > currentLatestDate) {
                  latestSubmissionByMemberCode[code] = sub;
                  console.log(`Found newer submission for ${code}: ${subDate} > ${currentLatestDate}`);
                }
              });
              
              // Create an object with member code as key and status as value (user's own)
              const nonSelectableCompaniesWithStatus = {};
              Object.keys(latestSubmissionByMemberCode).forEach(memberCode => {
                const key = (memberCode || '').trim();
                const latestSubmission = latestSubmissionByMemberCode[key];
                // Check if the latest submission has Admin_Submit = 0 or 1
                if (latestSubmission.adminSubmit === 0 || latestSubmission.adminSubmit === 1) {
                  nonSelectableCompaniesWithStatus[key] = latestSubmission.adminSubmit === 0 ? 'pending' : 'approved';
                }
              });
              
              // Merge with global non-selectable (pending/approved across ALL users)
              try {
                const globalRes = await fetch('/api/member/global-nonselectable');
                let mergedMap = { ...nonSelectableCompaniesWithStatus };
                if (globalRes.ok) {
                  const globalData = await globalRes.json();
                  const globalMap = globalData?.nonSelectable || {};
                  // Merge with priority for 'approved' over 'pending'
                  Object.keys(globalMap).forEach(code => {
                    const status = globalMap[code];
                    if (!mergedMap[code] || mergedMap[code] === 'pending') {
                      mergedMap[code] = status;
                    }
                  });
                }
                const nonSelectableCompanies = Object.keys(mergedMap);
                console.log('Latest submission by member code (trimmed keys):', latestSubmissionByMemberCode);
                console.log('User non-selectable (trimmed keys):', nonSelectableCompaniesWithStatus);
                console.log('Global non-selectable merged:', mergedMap);
                console.log('Non-selectable companies:', nonSelectableCompanies);
                setNonSelectableCompanies(mergedMap);
              } catch (mergeErr) {
                console.warn('Failed to fetch/merge global non-selectable, using user map only', mergeErr);
                const nonSelectableCompanies = Object.keys(nonSelectableCompaniesWithStatus);
                console.log('Non-selectable companies (user only):', nonSelectableCompanies);
                setNonSelectableCompanies(nonSelectableCompaniesWithStatus);
              }
              
              // Initial submissions will be filtered and paginated in useEffect
            } else {
              setAllSubmissions([]);
              setSubmissions([]);
              // No user submissions; still fetch global non-selectable
              try {
                const globalRes = await fetch('/api/member/global-nonselectable');
                if (globalRes.ok) {
                  const globalData = await globalRes.json();
                  const globalMap = globalData?.nonSelectable || {};
                  setNonSelectableCompanies(globalMap);
                } else {
                  setNonSelectableCompanies({});
                }
              } catch (e) {
                console.warn('Failed to fetch global non-selectable when no submissions');
                setNonSelectableCompanies({});
              }
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

  // Function to handle adding a company to the list
  const handleAddCompany = (formSubmitData) => {
    // When editing, we don't need to check for duplicates of the same company
    let isDuplicate = false;
    
    if (editingCompanyIndex === null) {
      // Only check for duplicates when adding a new company, not when editing
      const newCode = (formSubmitData.memberNumber || '').trim();
      isDuplicate = companies.some(company => (company.memberNumber || '').trim() === newCode);
    }
    
    if (isDuplicate) {
      toast.error('บริษัทนี้ถูกเพิ่มในรายการแล้ว');
      return;
    }
    
    // Check if the company is already verified or pending (by trimmed MEMBER_CODE only)
    const checkCode = (formSubmitData.memberNumber || '').trim();
    if (nonSelectableCompanies && nonSelectableCompanies[checkCode]) {
      const status = nonSelectableCompanies[checkCode];
      const statusText = status === 'pending' ? 'รอการอนุมัติ' : 'ยืนยันแล้ว';
      toast.error(`บริษัทนี้มีสถานะ ${statusText} ไม่สามารถเพิ่มซ้ำได้`);
      return;
    }
    
    if (companies.length >= MAX_COMPANIES && editingCompanyIndex === null) {
      toast.error(`สามารถเพิ่มได้สูงสุด ${MAX_COMPANIES} บริษัทเท่านั้น`);
      return;
    }
    
    // Create the company object
    const newCompany = {
      id: editingCompanyIndex !== null ? companies[editingCompanyIndex].id : Date.now(), // Keep same ID when editing
      memberSearch: formSubmitData.memberSearch,
      memberNumber: (formSubmitData.memberNumber || '').trim(),
      compPersonCode: formSubmitData.compPersonCode,
      registCode: formSubmitData.registCode,
      memberType: formSubmitData.memberType,
      companyName: formSubmitData.companyName,
      taxId: formSubmitData.taxId,
      documentFile: formSubmitData.documentFile
    };
    
    if (editingCompanyIndex !== null) {
      // Update existing company
      const updatedCompanies = [...companies];
      updatedCompanies[editingCompanyIndex] = newCompany;
      setCompanies(updatedCompanies);
      setEditingCompanyIndex(null);
      toast.success('แก้ไขข้อมูลบริษัทเรียบร้อยแล้ว');
    } else {
      // Add new company
      setCompanies(prev => [...prev, newCompany]);
      toast.success('เพิ่มบริษัทเรียบร้อยแล้ว');
    }
    
    // Reset form after adding
    setFormData({
      memberSearch: '',
      memberNumber: '',
      compPersonCode: '',
      registCode: '',
      memberType: '',
      companyName: '',
      taxId: '',
      documentFile: null
    });
    
    // Move to next step if this is the first company
    if (companies.length === 0 && editingCompanyIndex === null) {
      setCurrentStep(2);
    }
  };
  
  // Function to handle editing a company
  const handleEditCompany = (index) => {
    const companyToEdit = companies[index];
    console.log('Editing company with document:', companyToEdit.documentFile);
    
    // Set form data with all company details including the document file
    setFormData({
      memberSearch: companyToEdit.memberSearch,
      memberNumber: companyToEdit.memberNumber,
      compPersonCode: companyToEdit.compPersonCode,
      registCode: companyToEdit.registCode,
      memberType: companyToEdit.memberType,
      companyName: companyToEdit.companyName,
      taxId: companyToEdit.taxId,
      documentFile: companyToEdit.documentFile
    });
    
    // Set the editing index and move to step 1
    setEditingCompanyIndex(index);
    setCurrentStep(1);
  };
  
  // Function to handle removing a company
  const handleRemoveCompany = (index) => {
    const updatedCompanies = [...companies];
    updatedCompanies.splice(index, 1);
    setCompanies(updatedCompanies);
    toast.success('ลบบริษัทเรียบร้อยแล้ว');
    
    // If we're editing this company, reset the form
    if (editingCompanyIndex === index) {
      setEditingCompanyIndex(null);
      setFormData({
        memberSearch: '',
        memberNumber: '',
        compPersonCode: '',
        registCode: '',
        memberType: '',
        companyName: '',
        taxId: '',
        documentFile: null
      });
    }
  };
  
  // Function to handle viewing document
  const handleViewDocument = (index) => {
    const company = companies[index];
    if (company && company.documentFile) {
      // ตรวจสอบประเภทของเอกสาร
      const doc = company.documentFile;
      
      // ถ้าเป็น File object ให้สร้าง URL
      if (doc instanceof File) {
        // ตรวจสอบประเภทของไฟล์
        const isPdf = doc.type === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
        
        setSelectedDocument({
          url: URL.createObjectURL(doc),
          isPdf: isPdf,
          name: doc.name
        });
      } else {
        // ถ้าเป็น string (URL หรือ data URL)
        const isPdf = typeof doc === 'string' && 
          (doc.startsWith('data:application/pdf') || doc.toLowerCase().endsWith('.pdf'));
        
        setSelectedDocument({
          url: doc,
          isPdf: isPdf,
          name: 'Document'
        });
      }
      
      setShowDocumentModal(true);
    }
  };
  
  // Function to handle adding more companies
  const handleAddMore = () => {
    setIsAddingMore(true);
    setCurrentStep(1);
    setEditingCompanyIndex(null);
    setFormData({
      memberSearch: '',
      memberNumber: '',
      compPersonCode: '',
      registCode: '',
      memberType: '',
      companyName: '',
      taxId: '',
      documentFile: null
    });
    setTimeout(() => setIsAddingMore(false), 500);
  };
  
  // Function to handle moving to the review step
  const handleGoToReview = () => {
    if (companies.length === 0) {
      toast.error('กรุณาเพิ่มอย่างน้อย 1 บริษัท');
      return;
    }
    
    setCurrentStep(3);
  };
  
  // Function to handle submitting all companies
  const handleSubmitAll = async () => {
    // Prevent double submission
    if (isSubmitting) {
      toast.error('กำลังดำเนินการ โปรดรอสักครู่');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Show loading toast
      const loadingToast = toast.loading('กำลังส่งข้อมูล โปรดรอสักครู่...');
      
      // Create an array of promises for each company submission
      const submissionPromises = companies.map(async (company) => {
        const data = new FormData();
        data.append('userId', user?.id || '');
        data.append('memberNumber', company.memberNumber);
        data.append('compPersonCode', company.compPersonCode);
        data.append('registCode', company.registCode);
        data.append('memberType', company.memberType);
        data.append('companyName', company.companyName);
        data.append('taxId', company.taxId);
        data.append('documentFile', company.documentFile);

        try {
          const response = await fetch('/api/member/submit', {
            method: 'POST',
            body: data
          });

          // Normalize result even on non-OK or non-JSON responses
          let result;
          if (response.headers.get('content-type')?.includes('application/json')) {
            try {
              result = await response.json();
            } catch (e) {
              result = { success: false, message: 'ไม่สามารถอ่านผลลัพธ์จากเซิร์ฟเวอร์ได้' };
            }
          } else {
            result = { success: response.ok, message: `HTTP ${response.status}` };
          }
          return result;
        } catch (err) {
          console.error('Submit request failed:', err);
          return { success: false, message: 'เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว' };
        }
      });
      
      // Wait for all submissions to complete
      const results = await Promise.all(submissionPromises);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Check if all submissions were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast.success('ส่งข้อมูลทั้งหมดเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ');

        // Show green success message bar
        setSuccessMessage('ส่งข้อมูลทั้งหมดเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 6000);

        // Add all submissions to the list
        const newSubmissions = companies.map(company => ({
          id: Date.now() + Math.random(), // Use timestamp + random as a simple unique ID
          memberNumber: company.memberNumber,
          memberType: company.memberType,
          companyName: company.companyName,
          taxId: company.taxId,
          status: 'pending',
          adminSubmit: 0 // เพิ่มฟิลด์นี้เพื่อใช้ในการตรวจสอบสถานะ
        }));
        
        // Add to allSubmissions and let the filter useEffect handle the rest
        setAllSubmissions(prev => [...prev, ...newSubmissions]);
        
        // อัปเดต nonSelectableCompanies ทันทีหลังจากส่งข้อมูล
        const updatedNonSelectableCompanies = { ...nonSelectableCompanies };
        companies.forEach(company => {
          const code = (company.memberNumber || '').trim();
          updatedNonSelectableCompanies[code] = 'pending';
        });
        setNonSelectableCompanies(updatedNonSelectableCompanies);
        
        // Reset state
        setCompanies([]);
        setCurrentStep(4); // Move to success step
      } else {
        // Show specific popup for each failed company
        results.forEach((result, index) => {
          if (!result.success) {
            const code = (companies[index]?.memberNumber || '').trim();
            // Provide a clear message for duplicate/pending/approved cases
            toast.error(`รหัสสมาชิก ${code} อยู่ระหว่างพิจารณา หรือได้รับการยืนยันสมาชิกเดิม`);
          }
        });
      }
    } catch (error) {
      console.error('Error submitting forms:', error);
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
  
  // Function to render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Select company step
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
              onSubmit={handleAddCompany}
              showSubmitButton={!isSubmitting}
              submitButtonText={editingCompanyIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มบริษัท'}
              verifiedCompanies={nonSelectableCompanies}
              selectedCompanies={companies.map(company => company.memberNumber)}
            />
            
            {companies.length > 0 && (
              <div className="mt-6">
                <CompanyList 
                  companies={companies}
                  onRemove={handleRemoveCompany}
                  onEdit={handleEditCompany}
                  maxCompanies={MAX_COMPANIES}
                  onAddMore={handleAddMore}
                  isAddingMore={isAddingMore}
                  onViewDocument={handleViewDocument}
                />
                
                <motion.div className="mt-4">
                  <motion.button
                    type="button"
                    onClick={handleGoToReview}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ตรวจสอบข้อมูลและส่งข้อมูลทั้งหมด
                  </motion.button>
                </motion.div>
              </div>
            )}
          </div>
        );
      
      case 2: // Document upload step (now merged with step 1)
        return (
          <div className="mt-6">
            <CompanyList 
              companies={companies}
              onRemove={handleRemoveCompany}
              onEdit={handleEditCompany}
              maxCompanies={MAX_COMPANIES}
              onAddMore={handleAddMore}
              isAddingMore={isAddingMore}
              onViewDocument={handleViewDocument}
            />
            
            <motion.div className="mt-4">
              <motion.button
                type="button"
                onClick={handleGoToReview}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ตรวจสอบข้อมูลและส่งข้อมูลทั้งหมด
              </motion.button>
            </motion.div>
          </div>
        );
      
      case 3: // Review step
        return (
          <ReviewStep 
            companies={companies}
            onSubmit={handleSubmitAll}
            onBack={() => setCurrentStep(2)}
            isSubmitting={isSubmitting}
            onViewDocument={handleViewDocument}
          />
        );
      
      case 4: // Success step
        return (
          <motion.div 
            className="bg-white shadow-md rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FaCheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">ส่งข้อมูลเรียบร้อยแล้ว</h3>
            <p className="text-gray-600 mb-6">เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลของท่านภายในระยะเวลา 1-2 วันทำการ</p>
            
            <motion.button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setCompanies([]);
              }}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ยืนยันสมาชิกเพิ่มเติม
            </motion.button>
          </motion.div>
        );
      
      default:
        return null;
    }
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
        
        // Update URL to remove submission parameter
        window.history.pushState({}, '', '/dashboard?tab=wasmember');
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
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Yellow Alert: Instruction for existing members */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3"
      >
        <div className="flex items-center">
          <motion.div 
            className="bg-yellow-100 rounded-full p-2 mr-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <div>
            <motion.p 
              className="font-medium text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              หากท่านเป็นสมาชิกเดิมของสภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
            <motion.p 
              className="text-sm text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              กรุณากรอกข้อมูลเพื่อยืนยันตัวตนและเชื่อมโยงบัญชีของคุณ เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลของท่านภายในระยะเวลา 2 วันทำการ
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      {/* Step Indicator */}
      <WasMemberStepIndicator currentStep={currentStep} />
      
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
      {/* Show current step content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {renderStepContent()}
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

      {/* Document Viewing Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedDocument && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">เอกสารแนบ</h3>
                <button
                  onClick={() => {
                    // ถ้าเป็น object URL ให้เคลียร์ URL เพื่อป้องกัน memory leak
                    if (selectedDocument && selectedDocument.url && selectedDocument.url.startsWith('blob:')) {
                      URL.revokeObjectURL(selectedDocument.url);
                    }
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                {selectedDocument && selectedDocument.isPdf ? (
                  <div className="w-full h-full">
                    <iframe 
                      src={selectedDocument.url} 
                      className="w-full" 
                      style={{ height: 'calc(90vh - 120px)' }}
                      title="PDF Document"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={selectedDocument ? selectedDocument.url : ''} 
                      alt={selectedDocument ? selectedDocument.name : 'Document'} 
                      className="max-w-full h-auto mx-auto"
                      onError={(e) => {
                        // หากไม่สามารถแสดงเป็นรูปภาพได้ ให้แสดงข้อความแทน
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.alt = 'ไม่สามารถแสดงเอกสารนี้ได้ กรุณาดาวน์โหลดเพื่อเปิดดู';
                        e.target.style.padding = '20px';
                        e.target.style.textAlign = 'center';
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
