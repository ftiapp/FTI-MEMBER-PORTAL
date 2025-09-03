'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import MembershipSuccessModal from '@/app/components/MembershipSuccessModal';

// Import components
import CompanyInfoSection from './CompanyInfoSection';
import RepresentativeSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentsSection from './DocumentUploadSection';
import SummarySection from './SummarySection';
import DraftSavePopup from './DraftSavePopup';

// Import utilities
import { validateACForm } from './ACFormValidation';
import { submitACMembershipForm } from './ACFormSubmission';
import { useACFormNavigation } from './ACFormNavigation';
import { saveDraft } from './ACDraftService';

// Constants
const STEPS = [
  { id: 1, name: 'ข้อมูลบริษัท' },
  { id: 2, name: 'ข้อมูลผู้แทน' },
  { id: 3, name: 'ข้อมูลธุรกิจ' },
  { id: 4, name: 'อัพโหลดเอกสาร' },
  { id: 5, name: 'ยืนยันข้อมูล' }
];

const INITIAL_FORM_DATA = {
  companyName: '',
  companyNameEn: '',
  taxId: '',
  companyEmail: '',
  companyPhone: '',
  companyWebsite: '',
  addressNumber: '',
  street: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  
  representatives: [{
    idCardNumber: '',
    firstNameThai: '',
    lastNameThai: '',
    firstNameEnglish: '',
    lastNameEnglish: '',
    position: '',
    email: '',
    phone: '',
    isPrimary: true
  }],
  
  businessTypes: {},
  otherBusinessTypeDetail: '',
  products: [],
  memberCount: '',
  registeredCapital: '',
  industrialGroups: [],
  provincialChapters: [],
  // Documents
  companyRegistration: null,
  vatRegistration: null,
  idCard: null,
  authorityLetter: null,
  companyStamp: null,
  authorizedSignature: null,

  // Authorized signatory name fields
  authorizedSignatoryFirstNameTh: '',
  authorizedSignatoryLastNameTh: '',
  authorizedSignatoryFirstNameEn: '',
  authorizedSignatoryLastNameEn: ''
};

// Custom hook for API data with better error handling
const useApiData = () => {
  const [data, setData] = useState({
    businessTypes: [],
    industrialGroups: [],
    provincialChapters: [],
    isLoading: true,
    error: null
  });
  
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [businessTypesRes, industrialGroupsRes, provincialChaptersRes] = await Promise.all([
          fetch('/api/business-types', { signal: abortControllerRef.current.signal }),
          fetch('/api/industrial-groups', { signal: abortControllerRef.current.signal }),
          fetch('/api/provincial-chapters', { signal: abortControllerRef.current.signal })
        ]);

        const businessTypes = businessTypesRes.ok ? await businessTypesRes.json() : [];
        
        const industrialGroups = industrialGroupsRes.ok 
          ? (await industrialGroupsRes.json()).data?.map(item => ({
              id: item.MEMBER_GROUP_CODE,
              name_th: item.MEMBER_GROUP_NAME,
              name_en: item.MEMBER_GROUP_NAME
            })) || []
          : [];
        
        const provincialChapters = provincialChaptersRes.ok 
          ? (await provincialChaptersRes.json()).data?.map(item => ({
              id: item.MEMBER_GROUP_CODE,
              name_th: item.MEMBER_GROUP_NAME,
              name_en: item.MEMBER_GROUP_NAME
            })) || []
          : [];

        setData({
          businessTypes,
          industrialGroups,
          provincialChapters,
          isLoading: false,
          error: null
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return; // Request was cancelled, don't update state
        }
        
        console.error('Error fetching data:', error);
        const errorMessage = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
        toast.error(errorMessage);
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));
      }
    };

    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return data;
};

export default function ACMembershipForm({ 
  formData: externalFormData, 
  setFormData: externalSetFormData,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  totalSteps: externalTotalSteps,
  rejectionId, // เพิ่ม rejectionId สำหรับโหมดแก้ไข
  userComment, // เพิ่ม comment จากผู้ใช้
  isSinglePageLayout = false // เพิ่ม prop สำหรับ layout หน้าเดียว
}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);
  const stickyOffsetRef = useRef(120); // Approx header/toolbar height to offset when scrolling

  // Helper: Scroll to a field key with offset and focus
  const scrollToErrorField = useCallback((fieldKey) => {
    if (!fieldKey || typeof document === 'undefined') return;

    const selectors = [
      `[name="${fieldKey}"]`,
      `#${CSS.escape(fieldKey)}`,
      `.${CSS.escape(fieldKey)}`,
      `[data-error-key="${fieldKey}"]`, // optional wrapper hook
    ];

    let target = null;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { target = el; break; }
    }

    if (!target) return;

    const rect = target.getBoundingClientRect();
    const absoluteTop = rect.top + window.pageYOffset;
    const offset = Math.max(0, stickyOffsetRef.current || 0);
    window.scrollTo({ top: absoluteTop - offset, behavior: 'smooth' });

    if (typeof target.focus === 'function') {
      setTimeout(() => target.focus({ preventScroll: true }), 250);
    }
  }, []);
  
  // Use external form data if provided, otherwise use internal state
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [taxIdValidating, setTaxIdValidating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // Determine which form data and setters to use
  const isExternal = externalFormData !== undefined;
  const formData = isExternal ? externalFormData : internalFormData;
  const setFormData = isExternal ? externalSetFormData : setInternalFormData;

  // When external data is provided, ensure the form uses it directly.
  // This is crucial for the 'edit-rejected' feature.
  useEffect(() => {
    if (isExternal && externalFormData && Object.keys(externalFormData).length > 0) {
      console.log('AC FORM: External form data received, using it directly.', externalFormData);
      // Directly use the external data. The `formData` variable is already aliased to `externalFormData`.
      // We might clear errors from previous states if necessary.
      setErrors({});
    } else if (!isExternal) {
        // Logic for non-external data, e.g., loading draft
    }
  }, [externalFormData, isExternal]);
  
  const { businessTypes, industrialGroups, provincialChapters, isLoading, error: apiError } = useApiData();
  
  // Use external navigation if provided, otherwise use internal hook
  const internalNavigation = useACFormNavigation(
    (formData, step) => validateACForm(formData, step),
    externalCurrentStep,
    externalSetCurrentStep,
    externalTotalSteps
  );
  
  const currentStep = externalCurrentStep || internalNavigation.currentStep;
  const setCurrentStep = externalSetCurrentStep || internalNavigation.setCurrentStep;
  const totalSteps = externalTotalSteps || internalNavigation.totalSteps;
  const isSubmitting = internalNavigation.isSubmitting;
  const setIsSubmitting = internalNavigation.setIsSubmitting;
  const handleNextStep = internalNavigation.handleNextStep;
  const handlePrevStep = internalNavigation.handlePrevStep;

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log('AC Current Step:', currentStep);
  console.log('AC Total Steps:', totalSteps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load draft data on mount - only if not using external form data
  useEffect(() => {
    // Skip draft loading if external form data is provided (e.g., from edit-rejected page)
    if (externalFormData) {
      console.log('🔄 AC Form: Using external form data, skipping draft load');
      return;
    }

    const loadDraftData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('draftId');
      
      if (draftId) {
        setIsLoadingDraft(true);
        try {
          const response = await fetch(`/api/membership/get-drafts?type=ac`);
          const data = await response.json();
          
          if (data.success && data.drafts && data.drafts.length > 0) {
            const draft = data.drafts.find(d => d.id === parseInt(draftId));
            if (draft && draft.draftData) {
              // Merge draft data with initial form data
              setFormData(prev => ({ ...prev, ...draft.draftData }));
              // ถ้า navigation hook รองรับการตั้งค่า currentStep
              if (setCurrentStep && draft.currentStep) {
                setCurrentStep(draft.currentStep);
              }
              toast.success('โหลดข้อมูลร่างสำเร็จ');
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          toast.error('ไม่สามารถโหลดข้อมูลร่างได้');
        } finally {
          setIsLoadingDraft(false);
        }
      }
    };

    loadDraftData();
  }, [externalFormData]); // Add externalFormData as dependency

  const handleSaveDraft = useCallback(async () => {
    // ตรวจสอบว่ามี Tax ID หรือไม่
    if (!formData.taxId || formData.taxId.trim() === '') {
      toast.error('กรุณากรอกเลขประจำตัวผู้เสียภาษีก่อนบันทึกร่าง');
      return;
    }

    // ตรวจสอบความถูกต้องของ Tax ID (13 หลัก)
    if (formData.taxId.length !== 13 || !/^\d{13}$/.test(formData.taxId)) {
      toast.error('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
      return;
    }

    try {
      const response = await fetch('/api/membership/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberType: 'ac',
          draftData: formData,
          currentStep: currentStep
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // แสดง popup แทน toast
        setShowDraftSavePopup(true);
      } else {
        toast.error(`ไม่สามารถบันทึกร่างได้: ${result.message || 'กรุณาลองใหม่'}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกร่าง');
    }
  }, [formData, currentStep]);

  // ฟังก์ชันสำหรับลบ draft หลังจากสมัครสำเร็จ
  const deleteDraft = useCallback(async (taxId) => {
    if (!taxId) return;
    try {
      // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ tax ID
      const response = await fetch('/api/membership/get-drafts?type=ac');

      if (!response.ok) {
        console.error('Failed to fetch drafts for deletion');
        return;
      }

      const draftsData = await response.json();
      const drafts = draftsData?.success ? (draftsData.drafts || []) : [];
      
      // หา draft ที่ตรงกับ tax ID ของผู้สมัคร
      const normalize = (v) => String(v ?? '').replace(/\D/g, '');
      const targetTax = normalize(taxId);
      const draftToDelete = drafts.find(draft => normalize(draft.draftData?.taxId) === targetTax);

      if (draftToDelete) {
        const deleteResponse = await fetch('/api/membership/delete-draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memberType: 'ac',
            draftId: draftToDelete.id
          })
        });

        const deleteResult = await deleteResponse.json();
        
        if (deleteResult.success) {
          console.log('Draft deleted successfully');
        } else {
          console.error('Failed to delete draft:', deleteResult.message);
        }
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }, []);

  // Check tax ID uniqueness with better error handling
  const checkTaxIdUniqueness = useCallback(async (taxId) => {
    if (!taxId || taxId.length !== 13) {
      return { isUnique: false, message: 'เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง' };
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setTaxIdValidating(true);
      
      // ตรวจสอบกับ API ที่ถูกต้องของ AC
      const response = await fetch('/api/member/ac-membership/check-tax-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxId }),
        signal: abortControllerRef.current.signal
      });
      const result = await response.json();

      // Map ให้เข้ากับรูปแบบที่ฟอร์มนี้ใช้งาน { isUnique, message }
      if (!response.ok) {
        if (response.status === 409) {
          return { isUnique: false, message: result.error || result.message || 'เลขประจำตัวผู้เสียภาษีซ้ำ' };
        }
        return { isUnique: false, message: result.error || result.message || 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' };
      }

      return {
        isUnique: result.valid === true,
        message: result.message || (result.valid ? 'เลขประจำตัวผู้เสียภาษีสามารถใช้ได้' : 'ไม่สามารถตรวจสอบได้')
      };
    } catch (error) {
      console.error('Error checking tax ID uniqueness:', error);
      return { 
        isUnique: false, 
        message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี' 
      };
    } finally {
      setTaxIdValidating(false);
    }
  }, []);

  // Handle form submission and step navigation
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    console.log('🔄 handleSubmit called:', { 
      currentStep, 
      isSinglePageLayout, 
      rejectionId,
      formDataKeys: Object.keys(formData) 
    });
  
    // --- สำหรับโหมดแก้ไข (Single Page Layout) ---
    if (isSinglePageLayout || rejectionId) {
      console.log('📝 Single page layout or edit mode - proceeding to final submission');
      
      // ข้าม step validation เพราะเป็น single page layout
      const formErrors = validateACForm(formData, STEPS.length);
      setErrors(formErrors);
  
      if (Object.keys(formErrors).length > 0) {
        console.log('❌ Validation errors found:', formErrors);
        toast.error('กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน');
        
        // รองรับ error ที่ซ้อนใน representativeErrors
        if (formErrors.representativeErrors && Array.isArray(formErrors.representativeErrors)) {
          const repIndex = formErrors.representativeErrors.findIndex(e => e && Object.keys(e).length > 0);
          if (repIndex !== -1) {
            const field = Object.keys(formErrors.representativeErrors[repIndex])[0];
            const compositeKey = `rep-${repIndex}-${field}`;
            scrollToErrorField(compositeKey);
            return;
          }
        }

        const firstErrorField = Object.keys(formErrors)[0];
        scrollToErrorField(firstErrorField);
        return;
      }
  
      // ดำเนินการส่งข้อมูล
      console.log('✅ Validation passed, proceeding with submission');
      toast.loading('กำลังส่งข้อมูล...', { id: 'submitting' });
      setIsSubmitting(true);
  
      try {
        let result;
        if (rejectionId) {
          console.log('🔄 Resubmitting rejected application:', rejectionId);
          const res = await fetch(`/api/membership/rejected-applications/${rejectionId}/resubmit`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
              formData: formData,
              memberType: 'ac',
              userComment: userComment, // ส่ง comment ไปด้วย
              apiData: {
                industrialGroups,
                provincialChapters
              }
            })
          });
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          
          result = await res.json();
          console.log('📥 Resubmit response:', result);
        } else {
          console.log('🔄 New submission');
          result = await submitACMembershipForm(formData);
          console.log('📥 New submission response:', result);
        }
  
        toast.dismiss('submitting');
  
        if (result.success) {
          console.log('✅ Submission successful');
          if (!rejectionId) {
            await deleteDraft(formData.taxId);
          }
          // แสดง Success Modal แทนการ redirect ทันที
          setSubmissionResult(result);
          setShowSuccessModal(true);
        } else {
          console.log('❌ Submission failed:', result.message);
          toast.error(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        }
      } catch (error) {
        console.error('💥 Submission error:', error);
        toast.dismiss('submitting');
        
        // แสดง error message ที่ละเอียดขึ้น
        let errorMessage = 'เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง';
        if (error.message) {
          errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
        }
        
        toast.error(errorMessage, { duration: 5000 });
      } finally {
        setIsSubmitting(false);
      }
      
      return; // หยุดการทำงานที่นี่สำหรับ single page layout
    }
  
    // --- Step Navigation Logic สำหรับโหมดปกติ ---
    if (currentStep < 5) {
      console.log('🔄 Step navigation mode, current step:', currentStep);
      
      const formErrors = validateACForm(formData, currentStep);
      setErrors(formErrors);
  
      if (Object.keys(formErrors).length > 0) {
        console.log('❌ Step validation errors:', formErrors);
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
        if (formErrors.representativeErrors && Array.isArray(formErrors.representativeErrors)) {
          const repIndex = formErrors.representativeErrors.findIndex(e => e && Object.keys(e).length > 0);
          if (repIndex !== -1) {
            const field = Object.keys(formErrors.representativeErrors[repIndex])[0];
            scrollToErrorField(`rep-${repIndex}-${field}`);
            return;
          }
        }
        const firstErrorField = Object.keys(formErrors)[0];
        scrollToErrorField(firstErrorField);
        return;
      }
  
      // Special validation for step 1 (Tax ID)
      if (currentStep === 1 && formData.taxId?.length === 13) {
        // Only check uniqueness if not in edit mode
        if (!rejectionId) {
          console.log('🔄 Checking tax ID uniqueness...');
          const taxIdResult = await checkTaxIdUniqueness(formData.taxId);
          if (!taxIdResult.isUnique) {
            setErrors(prev => ({ ...prev, taxId: taxIdResult.message }));
            toast.error(taxIdResult.message);
            return;
          }
        }
      }
  
      console.log('✅ Step validation passed, moving to next step');
      // Increment step directly to avoid re-validating with possibly different internal step in navigation hook
      if (setCurrentStep) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
      return;
    }
  
    // --- Final Submission Logic (currentStep === 5) สำหรับโหมดปกติ ---
    console.log('🔄 Final submission for step-by-step mode');
    
    const formErrors = validateACForm(formData, STEPS.length);
    setErrors(formErrors);
  
    if (Object.keys(formErrors).length > 0) {
      console.log('❌ Final validation errors:', formErrors);
      toast.error('กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วนทุกขั้นตอน');
      
      const firstErrorStep = STEPS.find(step => 
        Object.keys(validateACForm(formData, step.id)).length > 0
      );
      if (firstErrorStep && setCurrentStep) {
        setCurrentStep(firstErrorStep.id);
        // หลังเปลี่ยนสเต็ป ให้เลื่อนและโฟกัสไปยังฟิลด์แรกของสเต็ปนั้น
        const stepErrors = validateACForm(formData, firstErrorStep.id);
        // representativeErrors support
        if (stepErrors.representativeErrors && Array.isArray(stepErrors.representativeErrors)) {
          const repIndex = stepErrors.representativeErrors.findIndex(e => e && Object.keys(e).length > 0);
          if (repIndex !== -1) {
            const field = Object.keys(stepErrors.representativeErrors[repIndex])[0];
            setTimeout(() => scrollToErrorField(`rep-${repIndex}-${field}`), 350);
            return;
          }
        }
        const firstField = Object.keys(stepErrors)[0];
        if (firstField) {
          // รอให้สเต็ป render เสร็จ
          setTimeout(() => {
            scrollToErrorField(firstField);
          }, 350);
        }
      }
      return;
    }
  
    console.log('✅ Final validation passed, proceeding with submission');
    toast.loading('กำลังส่งข้อมูล...', { id: 'submitting' });
    setIsSubmitting(true);
  
    try {
      let result;
      if (rejectionId) {
        console.log('🔄 Resubmitting rejected application (step mode):', rejectionId);
        const res = await fetch(`/api/membership/rejected-applications/${rejectionId}/resubmit`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
              formData: formData,
              memberType: 'ac',
              userComment: userComment, // ส่ง comment ไปด้วย
              apiData: {
                industrialGroups,
                provincialChapters
              }
            })
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        result = await res.json();
      } else {
        console.log('🔄 New submission (step mode)');
        result = await submitACMembershipForm(formData);
      }
  
      toast.dismiss('submitting');
  
      if (result.success) {
        console.log('✅ Final submission successful');
        if (!rejectionId) {
          await deleteDraft(formData.taxId);
        }
        // แสดง Success Modal แทนการ redirect ทันที
        setSubmissionResult(result);
        setShowSuccessModal(true);
      } else {
        console.log('❌ Final submission failed:', result.message);
        toast.error(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (error) {
      console.error('💥 Final submission error:', error);
      toast.dismiss('submitting');
      
      let errorMessage = 'เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง';
      if (error.message) {
        errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentStep, router, setCurrentStep, rejectionId, checkTaxIdUniqueness, handleNextStep, deleteDraft, isSinglePageLayout]);


  const handlePrevious = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    handlePrevStep();
  }, [handlePrevStep]);

  // Render form content based on layout
  const renderFormContent = () => {
    const commonProps = { formData, setFormData, errors };

    if (isSinglePageLayout) {
      return (
        <div className="space-y-12">
          <CompanyInfoSection 
            {...commonProps} 
            setErrors={setErrors} 
            taxIdValidating={taxIdValidating}
          />
          <hr />
          <RepresentativeSection {...commonProps} />
          <hr />
          <BusinessInfoSection 
            {...commonProps} 
            businessTypes={businessTypes} 
            industrialGroups={industrialGroups} 
            provincialChapters={provincialChapters} 
            isLoading={isLoading} 
          />
          <hr />
          <DocumentsSection {...commonProps} />
        </div>
      );
    }

    // Original step-by-step logic
    const stepComponents = {
      1: <CompanyInfoSection 
          {...commonProps} 
          setErrors={setErrors} 
          taxIdValidating={taxIdValidating}
        />,
      2: <RepresentativeSection {...commonProps} />,
      3: <BusinessInfoSection 
          {...commonProps} 
          businessTypes={businessTypes} 
          industrialGroups={industrialGroups} 
          provincialChapters={provincialChapters} 
          isLoading={isLoading} 
        />,
      4: <DocumentsSection {...commonProps} />,
      5: <SummarySection 
          formData={formData} 
          businessTypes={businessTypes} 
          industrialGroups={industrialGroups} 
          provincialChapters={provincialChapters} 
        />
    };

    return stepComponents[currentStep] || null;
  };

  // Render error message helper
  const renderErrorMessage = (errorValue, key, index) => {
    if (typeof errorValue === 'object' && errorValue !== null) {
      // Handle nested error objects
      const firstErrorKey = Object.keys(errorValue)[0];
      const message = firstErrorKey === '_error' 
        ? errorValue._error 
        : `${key}: ${errorValue[firstErrorKey]}`;
      return <li key={`${key}-${index}`} className="text-base">{message}</li>;
    }
    return <li key={`${key}-${index}`} className="text-base">{errorValue}</li>;
  };

  // Show loading state
  if (isLoading || isLoadingDraft) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  // Show API error
  if (apiError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{apiError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-8">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="mt-4 text-white text-xl font-semibold">กำลังดำเนินการส่งข้อมูล...</p>
          <p className="mt-2 text-white text-md">กรุณาอย่าปิดหน้าต่างนี้</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Messages */}
        {Object.keys(errors).filter(key => 
          errors[key] && 
          errors[key] !== '' && 
          key !== 'representativeErrors'
        ).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl" role="alert">
            <strong className="font-bold text-lg">กรุณาแก้ไขข้อมูลให้ถูกต้อง:</strong>
            <ul className="mt-4 list-disc list-inside space-y-2">
              {Object.keys(errors)
                .filter(key => 
                  errors[key] && 
                  errors[key] !== '' && 
                  key !== 'representativeErrors'
                )
                .map((key, index) => renderErrorMessage(errors[key], key, index))}
            </ul>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
          {renderFormContent()}
        </div>

        {/* Navigation Buttons - Fixed positioning */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
          <div className={`max-w-7xl mx-auto flex ${isSinglePageLayout ? 'justify-end' : 'justify-between'} items-center`}>
            {!isSinglePageLayout && (
              <>
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                    currentStep === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md'
                  }`}
                >
                  ← ย้อนกลับ
                </button>

                {/* Step Counter */}
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-lg text-blue-700 font-semibold">
                      ขั้นตอนที่ {currentStep} จาก {totalSteps}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Save Draft Button - Show on steps 1, 2, 3 and not single page */}
              {!isSinglePageLayout && currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
                >
                  บันทึกร่าง
                </button>
              )}

              {/* Next / Submit Button */}
              <button
                type="button" // Use button to prevent default form submission
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 ${
                  (currentStep < 5 && !isSinglePageLayout)
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {(currentStep < 5 && !isSinglePageLayout)
                  ? 'ถัดไป →' 
                  : (isSubmitting ? 'กำลังส่ง...' : (rejectionId ? 'ยืนยันการส่งใบสมัครใหม่' : 'ยืนยันการสมัคร'))}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        taxId={formData.taxId}
        companyName={formData.companyName}
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="ac"
        memberData={{
          taxId: formData.taxId,
          companyNameTh: formData.companyName
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push('/dashboard?tab=documents');
        }}
      />
    </div>
  );
}