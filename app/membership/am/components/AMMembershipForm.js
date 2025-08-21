'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// นำเข้าคอมโพเนนต์ย่อยสำหรับแต่ละขั้นตอน
import AssociationInfoSection from './AssociationInfoSection';
import RepresentativeSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentsSection from './DocumentUploadSection';
import SummarySection from './SummarySection';
import DraftSavePopup from './DraftSavePopup';

// นำเข้าโมดูลที่สร้างขึ้นใหม่
import { validateAMForm } from './AMFormValidation';
import { submitAMMembershipForm } from './AMFormSubmission';
import { useAMFormNavigation } from './AMFormNavigation';
import { saveDraft } from './AMDraftService';

// ค่าคงที่สำหรับขั้นตอนต่างๆ
const STEPS = [
  { id: 1, name: 'ข้อมูลสมาคม' },
  { id: 2, name: 'ข้อมูลผู้แทน' },
  { id: 3, name: 'ข้อมูลธุรกิจ' },
  { id: 4, name: 'อัพโหลดเอกสาร' },
  { id: 5, name: 'ยืนยันข้อมูล' }
];

// ข้อมูลเริ่มต้นของฟอร์ม
const INITIAL_FORM_DATA = {
  // ข้อมูลสมาคม
  associationName: '',
  associationNameEng: '',
  taxId: '',
  associationEmail: '',
  associationPhone: '',
  addressNumber: '',
  street: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  
  // ข้อมูลผู้แทน
  representatives: [
    {
      idCardNumber: '',
      firstNameThai: '',
      lastNameThai: '',
      firstNameEnglish: '',
      lastNameEnglish: '',
      position: '',
      email: '',
      phone: '',
      isPrimary: true
    }
  ],
  
  // ข้อมูลธุรกิจ
  businessTypes: [],
  otherBusinessType: '',
  products: '',
  memberCount: '', // จำนวนสมาชิกสมาคม
  
  // เอกสาร
  associationRegistration: null,
  associationProfile: null,
  memberList: null,
  vatRegistration: null,
  idCard: null,
  authorityLetter: null,
  
  // เอกสารที่จำเป็น (บังคับทุกกรณี)
  companyStamp: null,
  authorizedSignature: null,
  
  // ข้อมูลชื่อผู้มีอำนาจลงนาม
  authorizedSignatoryFirstNameTh: '',
  authorizedSignatoryLastNameTh: '',
  authorizedSignatoryFirstNameEn: '',
  authorizedSignatoryLastNameEn: ''
};

// Custom hook สำหรับ API data พร้อม error handling
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

export default function AMMembershipForm(props = {}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);
  
  // Support controlled formData from parent while keeping internal fallback
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [taxIdValidating, setTaxIdValidating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);

  // Determine which form data and setters to use
  const isExternal = props.formData !== undefined;
  const formData = isExternal ? props.formData : internalFormData;
  const setFormData = isExternal ? props.setFormData : setInternalFormData;

  // Sync externalFormData with internal state when it changes
  useEffect(() => {
    if (isExternal && props.formData && Object.keys(props.formData).length > 0) {
      console.log('AM FORM: External form data received, updating internal state.', props.formData);
      // Use the setter for internal state to avoid loops if the parent's setter is passed
      setInternalFormData(prevData => ({ ...prevData, ...props.formData }));
    }
  }, [props.formData, isExternal]);
  
  const { businessTypes, industrialGroups, provincialChapters, isLoading, error: apiError } = useApiData();
  
  const {
    currentStep: hookCurrentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleNextStep,
    handlePrevStep,
    setCurrentStep: setHookCurrentStep // เพิ่มถ้า hook รองรับ
  } = useAMFormNavigation((formData, step) => validateAMForm(formData, step));

  // Effective step control (prefer parent-controlled if provided)
  const currentStep = props.currentStep ?? hookCurrentStep;
  const setCurrentStep = props.setCurrentStep ?? setHookCurrentStep;
  const effectiveTotalSteps = props.totalSteps ?? totalSteps ?? 5;

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log('🎛️ AMMembershipForm Props:', {
    hasFormDataProp: !!props.formData,
    hasSetFormDataProp: !!props.setFormData,
    hasCurrentStepProp: !!props.currentStep,
    hasSetCurrentStepProp: !!props.setCurrentStep,
    formDataKeys: props.formData ? Object.keys(props.formData) : 'none',
    currentStepValue: currentStep,
    totalStepsValue: effectiveTotalSteps
  });
  console.log('📝 Current formData:', formData);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load draft data on mount - ✅ เพิ่มฟังก์ชันนี้
  useEffect(() => {
    const loadDraftData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('draftId');
      
      if (draftId) {
        setIsLoadingDraft(true);
        try {
          const response = await fetch(`/api/membership/get-drafts?type=am`);
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
  }, []); // dependencies อาจต้องเพิ่ม setCurrentStep ถ้ามี

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
      
      const response = await fetch('/api/member/am-membership/check-tax-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taxId }),
        signal: abortControllerRef.current.signal
      });
      
      const data = await response.json();
      console.log('Tax ID validation response:', data);
      
      return {
        isUnique: data.valid === true,
        message: data.message || 'ไม่สามารถตรวจสอบเลขประจำตัวผู้เสียภาษีได้'
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { isUnique: false, message: 'การตรวจสอบถูกยกเลิก' };
      }
      
      console.error('Error checking tax ID uniqueness:', error);
      return { 
        isUnique: false, 
        message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี' 
      };
    } finally {
      setTaxIdValidating(false);
    }
  }, []);

  // Handle form submission - เฉพาะสำหรับขั้นตอนสุดท้าย (step 5)
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // ✅ เพิ่มเงื่อนไข: ต้องอยู่ใน step 5 เท่านั้น
    if (currentStep !== 5) {
      console.log('AM Form submit prevented - not on final step');
      return;
    }

    // Re-validate all fields before final submission
    const formErrors = validateAMForm(formData, STEPS.length);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      toast.error('กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วนทุกขั้นตอน');
      // Optionally, navigate to the first step with an error
      const firstErrorStep = STEPS.find(step => 
        Object.keys(validateAMForm(formData, step.id)).length > 0
      );
      if (firstErrorStep && setCurrentStep) {
        setCurrentStep(firstErrorStep.id);
      }
      return;
    }

    // Show warning toast and set submitting state
    toast.loading('กำลังส่งข้อมูล... กรุณาอย่าปิดหน้าต่างนี้', {
      id: 'submitting',
      duration: Infinity
    });
    setIsSubmitting(true);
    
    try {
      const result = await submitAMMembershipForm(formData);
      
      // Dismiss loading toast
      toast.dismiss('submitting');
      
      if (result.success) {
        toast.success(result.message || 'ส่งข้อมูลการสมัครเรียบร้อยแล้ว');
        
        // ลบ draft หลังจากสมัครสำเร็จ
        await deleteDraft();
        
        setTimeout(() => router.push('/dashboard?tab=status'), 2000);
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.dismiss('submitting');
      toast.error('เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  }, [formData, currentStep, router, setCurrentStep]);

  // Handle next step - ป้องกันการ submit โดยไม่ตั้งใจ
  const handleNext = useCallback(async (e) => {
    // ✅ ป้องกัน form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const formErrors = validateAMForm(formData, currentStep);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    // Special check for Tax ID on step 1
    if (currentStep === 1 && formData.taxId?.length === 13) {
      const taxIdResult = await checkTaxIdUniqueness(formData.taxId);
      if (!taxIdResult.isUnique) {
        setErrors(prev => ({ ...prev, taxId: taxIdResult.message }));
        toast.error(taxIdResult.message);
        return;
      }
    }

    if (props.currentStep !== undefined && typeof setCurrentStep === 'function') {
      setCurrentStep(currentStep + 1);
    } else {
      handleNextStep(formData, setErrors);
    }
  }, [formData, currentStep, checkTaxIdUniqueness, handleNextStep, props.currentStep, setCurrentStep]);

  const handlePrevious = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (props.currentStep !== undefined && typeof setCurrentStep === 'function') {
      setCurrentStep(Math.max(1, currentStep - 1));
    } else {
      handlePrevStep();
    }
  }, [handlePrevStep, props.currentStep, setCurrentStep, currentStep]);

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
          memberType: 'am',
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
  const deleteDraft = useCallback(async () => {
    try {
      // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ tax ID
      const response = await fetch('/api/membership/get-drafts?type=am');

      if (!response.ok) {
        console.error('Failed to fetch drafts for deletion');
        return;
      }

      const data = await response.json();
      const drafts = data?.success ? (data.drafts || []) : [];
      
      const normalize = (v) => String(v ?? '').replace(/\D/g, '');
      const targetTax = normalize(formData.taxId);
      const draftToDelete = drafts.find(draft => normalize(draft.draftData?.taxId) === targetTax);

      if (draftToDelete) {
        const deleteResponse = await fetch('/api/membership/delete-draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memberType: 'am',
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
  }, [formData.taxId]);

  // Render current step component
  const currentStepComponent = useMemo(() => {
    const commonProps = { formData, setFormData, errors };

    const stepComponents = {
      1: <AssociationInfoSection 
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
  }, [currentStep, formData, errors, businessTypes, industrialGroups, provincialChapters, taxIdValidating]);

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
          {currentStepComponent}
        </div>

        {/* Navigation Buttons - Fixed positioning */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
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

            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-lg text-blue-700 font-semibold">
                  ขั้นตอนที่ {currentStep} จาก {effectiveTotalSteps}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Save Draft Button - Show on steps 1-4 */}
              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
                >
                  บันทึกร่าง
                </button>
              )}

              {/* Next Button - Show on steps 1-4 */}
              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
                >
                  ถัดไป →
                </button>
              )}

              {/* Submit Button - Show only on the last step (5) */}
              {currentStep === 5 && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
                  } text-white`}
                >
                  {isSubmitting ? '⏳ กำลังส่ง...' : '✓ ยืนยันการสมัคร'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Document preparation hint */}
        {currentStep === 1 && (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-base">
              <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> หนังสือรับรองสมาคม และทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)
            </p>
          </div>
        )}
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        taxId={formData.taxId}
        associationName={formData.associationName}
      />
    </div>
  );
}