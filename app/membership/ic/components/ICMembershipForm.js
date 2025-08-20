'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ApplicantInfoSection from './ApplicantInfoSection';
import RepresentativeInfoSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentUploadSection from './DocumentUploadSection';
import SummarySection from './SummarySection';
import DraftSavePopup from './DraftSavePopup';
import MembershipSuccessModal from '../../../components/MembershipSuccessModal';
import { validateCurrentStep } from './ICFormValidation';
import { submitICMembershipForm, saveDraft } from './ICFormSubmission';

// Constants
const STEPS = [
  { id: 1, name: 'ข้อมูลผู้สมัคร' },
  { id: 2, name: 'ข้อมูลผู้แทน' },
  { id: 3, name: 'ข้อมูลธุรกิจ' },
  { id: 4, name: 'อัพโหลดเอกสาร' },
  { id: 5, name: 'ยืนยันข้อมูล' }
];

const INITIAL_FORM_DATA = {
  // Applicant info
  idCardNumber: '',
  firstNameThai: '',
  lastNameThai: '',
  firstNameEng: '',
  lastNameEng: '',
  phone: '',
  email: '',
  
  // Address
  addressNumber: '',
  moo: '',
  soi: '',
  road: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  website: '',
  
  // Industrial group and provincial chapter
  industrialGroupId: '',
  provincialChapterId: '',
  
  // Representative info (only one allowed)
  representative: {
    firstNameThai: '',
    lastNameThai: '',
    firstNameEng: '',
    lastNameEng: '',
    email: '',
    phone: '',
    phoneExtension: ''
  },
  
  // Business info
  businessTypes: {},
  otherBusinessTypeDetail: '',
  products: [{ id: 1, nameTh: '', nameEn: '' }],
  
  // Document
  idCardDocument: null,
  
  // เอกสารที่จำเป็น (บังคับทุกกรณี)
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
          ? await industrialGroupsRes.json()
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

// Check ID card uniqueness
// ในไฟล์ ICMembershipForm.js
// แก้ไข checkIdCard function

const checkIdCard = async (idCardNumber) => {
  if (!idCardNumber || idCardNumber.length !== 13) {
    return { 
      valid: false, 
      exists: null,
      message: 'เลขบัตรประจำตัวประชาชนไม่ถูกต้อง' 
    };
  }

  try {
    const response = await fetch('/api/member/ic-membership/check-id-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCardNumber })
    });
    
    const data = await response.json();
    
    // ✅ ส่งค่าตรงตามที่ API ส่งมา
    return {
      valid: data.valid,         // true = ใช้ได้, false = ใช้ไม่ได้
      exists: data.exists,       // true = มีอยู่แล้ว, false = ไม่มี
      message: data.message,
      status: data.status
    };
  } catch (error) {
    console.error('Error checking ID card:', error);
    return { 
      valid: false,
      exists: null,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประจำตัวประชาชน' 
    };
  }
};

export default function ICMembershipForm({ 
  currentStep, 
  setCurrentStep, 
  formData: externalFormData, 
  setFormData: setExternalFormData, 
  totalSteps, 
  rejectionId 
}) {
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const abortControllerRef = useRef(null);

  const isExternal = externalFormData !== undefined;
  const formData = isExternal ? externalFormData : internalFormData;
  const setFormData = isExternal ? setExternalFormData : setInternalFormData;

  useEffect(() => {
    if (isExternal && externalFormData && Object.keys(externalFormData).length > 0) {
      console.log('IC FORM: External form data received, updating internal state.', externalFormData);
      setInternalFormData(prevData => ({ ...prevData, ...externalFormData }));
    }
  }, [externalFormData, isExternal]);

  const { businessTypes, industrialGroups, provincialChapters, isLoading, error: apiError } = useApiData();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);


  // ✅ Load draft data on mount - แยกออกจาก useApiData
  useEffect(() => {
    const loadDraftData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('draftId');
      
      if (draftId) {
        setIsLoadingDraft(true);
        try {
          const response = await fetch(`/api/membership/get-drafts?type=ic`);
          const data = await response.json();
          
          if (data.success && data.drafts && data.drafts.length > 0) {
            const draft = data.drafts.find(d => d.id === parseInt(draftId));
            if (draft && draft.draftData) {
              // Merge draft data with initial form data
              setFormData(prev => ({ ...prev, ...draft.draftData }));
              // ตั้งค่า currentStep ถ้ามี
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
  }, []); // dependencies อาจต้องเพิ่ม setCurrentStep, setFormData ถ้าจำเป็น

  // Handle previous step navigation
  const handlePrevStep = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  }, [currentStep, setCurrentStep]);

  // ✅ แก้ไขฟังก์ชัน handleSubmit เพื่อให้ทำงานได้ถูกต้อง
  // ส่วนของ handleSubmit function ใน ICMembershipForm.js ที่ต้องแก้ไข

const handleSubmit = useCallback(async (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  console.log('=== handleSubmit called ===');
  console.log('Current Step:', currentStep);
  console.log('Is Submitting:', isSubmitting);
  
  // ป้องกันการ submit ซ้ำ
  if (isSubmitting) {
    console.log('Already submitting, preventing duplicate submission');
    return;
  }
  
  // แสดง toast loading
  const loadingToastId = toast.loading('กำลังส่งข้อมูล... กรุณาอย่าปิดหน้าต่างนี้', {
    duration: Infinity
  });
  
  setIsSubmitting(true);
  
  try {
    // ตรวจสอบ validation ทุก step
    console.log('Validating all steps...');
    let allErrors = {};
    for (let step = 1; step <= totalSteps - 1; step++) {
      const stepErrors = validateCurrentStep(step, formData);
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      console.log('Validation failed:', allErrors);
      setErrors(allErrors);
      toast.dismiss(loadingToastId);
      toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้องครบถ้วน');
      scrollToFirstError(allErrors);
      return;
    }

    // ตรวจสอบเลขบัตรประชาชนอีกครั้ง
    console.log('Checking ID card uniqueness...');
    const idCardCheckResult = await checkIdCard(formData.idCardNumber);
    if (!idCardCheckResult.valid) {
      console.log('ID card check failed:', idCardCheckResult);
      toast.dismiss(loadingToastId);
      toast.error(idCardCheckResult.message);
      return;
    }

    // ✅ FIX: เตรียมข้อมูลสำหรับส่งให้ครบถ้วนและถูกต้อง
    console.log('Preparing form data for submission...');
    const submissionData = {
      // ข้อมูลหลัก
      ...formData,
      
      // แปลงข้อมูล representative จาก object เป็น flat fields
      representativeFirstNameTh: formData.representative?.firstNameThai || '',
      representativeLastNameTh: formData.representative?.lastNameThai || '',
      representativeFirstNameEn: formData.representative?.firstNameEng || '',
      representativeLastNameEn: formData.representative?.lastNameEng || '',
      representativeEmail: formData.representative?.email || '',
      representativePhone: formData.representative?.phone || '',
      representativePhoneExtension: formData.representative?.phoneExtension || '',
      
      // แปลงข้อมูล business types
      businessTypes: Object.keys(formData.businessTypes || {}).filter(key => formData.businessTypes[key]),
      
      // แปลงข้อมูลเอกสาร
      idCardFile: formData.idCardDocument,
      
      // ✅ FIX: ส่งข้อมูลกลุ่มอุตสาหกรรมในรูปแบบที่ API คาดหวัง
      industryGroups: (() => {
        if (formData.industrialGroupId && Array.isArray(formData.industrialGroupId)) {
          return formData.industrialGroupId.filter(id => id && id.toString().trim());
        } else if (formData.industrialGroupId) {
          return [formData.industrialGroupId].filter(id => id && id.toString().trim());
        }
        return [];
      })(),
      
      // ✅ FIX: ส่งข้อมูลสภาอุตสาหกรรมจังหวัดในรูปแบบที่ API คาดหวัง
      provinceChapters: (() => {
        if (formData.provincialChapterId && Array.isArray(formData.provincialChapterId)) {
          return formData.provincialChapterId.filter(id => id && id.toString().trim());
        } else if (formData.provincialChapterId) {
          return [formData.provincialChapterId].filter(id => id && id.toString().trim());
        }
        return [];
      })()
    };

    // Debug: แสดงข้อมูลที่เตรียมส่ง
    console.log('=== Submission Data Debug ===');
    console.log('Original formData.industrialGroupId:', formData.industrialGroupId);
    console.log('Original formData.provincialChapterId:', formData.provincialChapterId);
    console.log('Processed industryGroups:', submissionData.industryGroups);
    console.log('Processed provinceChapters:', submissionData.provinceChapters);
    console.log('Phone:', submissionData.phone);
    console.log('Email:', submissionData.email);
    console.log('Website:', submissionData.website);

    // ส่งข้อมูล
    console.log('Submitting form...');
    let result;
    if (rejectionId) {
      // Resubmit logic
      console.log(`Resubmitting application for rejection ID: ${rejectionId}`);
      const res = await fetch(`/api/membership/rejected-applications/${rejectionId}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedData: submissionData, memberType: 'ic' })
      });
      result = await res.json();
    } else {
      // New submission logic
      result = await submitICMembershipForm(submissionData);
    }
    
    toast.dismiss(loadingToastId);
    
    if (result.success) {
      if (!rejectionId) {
        await deleteDraft();
      }
      
      // Show success modal instead of toast
      setSubmissionResult(result);
      setShowSuccessModal(true);
    } else {
      console.error('Submission failed:', result);
      toast.error(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
    
  } catch (error) {
    console.error('Error in handleSubmit:', error);
    toast.dismiss(loadingToastId);
    toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
  } finally {
    setIsSubmitting(false);
  }
}, [formData, totalSteps, currentStep, isSubmitting]);

  // Function to scroll to the first error field
  const scrollToFirstError = useCallback((errors) => {
    if (!errors || Object.keys(errors).length === 0) return;
    
    // Get the first error field ID
    const firstErrorField = Object.keys(errors)[0];
    
    // Find the element with that ID or name
    const errorElement = document.getElementById(firstErrorField) || 
                         document.getElementsByName(firstErrorField)[0] ||
                         document.querySelector(`[data-field="${firstErrorField}"]`);
    
    if (errorElement) {
      // Scroll to the element with smooth behavior
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus on the element
      setTimeout(() => {
        errorElement.focus();
      }, 500);
    }
  }, []);

  // Handle next step - ป้องกันการ submit โดยไม่ตั้งใจ
// ในไฟล์ ICMembershipForm.js
// แก้ไข handleNext function

const handleNext = useCallback(async (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  console.log('=== DEBUG handleNext ===');
  console.log('Current Step:', currentStep);
  console.log('Form Data:', formData);
  
  const formErrors = validateCurrentStep(currentStep, formData);
  console.log('Form Errors:', formErrors);
  setErrors(formErrors);
  
  if (Object.keys(formErrors).length > 0) {
    console.log('Validation failed with errors:', formErrors);
    
    if (currentStep === 4 && formErrors.idCardDocument) {
      toast.error('กรุณาอัพโหลดสำเนาบัตรประชาชนก่อนดำเนินการต่อ', {
        position: 'top-right',
        duration: 4000
      });
    } else {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง', {
        position: 'top-right'
      });
    }
    
    scrollToFirstError(formErrors);
    return;
  }

  // ✅ แก้ไขการตรวจสอบ ID Card สำหรับ step 1
  if (currentStep === 1 && formData.idCardNumber) {
    // ตรวจสอบจาก _idCardValidation ก่อน
    const idCardValidation = formData._idCardValidation;
    
    if (idCardValidation?.isChecking) {
      toast.error('กรุณารอให้การตรวจสอบเลขบัตรประชาชนเสร็จสิ้น', {
        position: 'top-right'
      });
      return;
    }
    
    if (idCardValidation?.isValid === false) {
      toast.error(idCardValidation.message || 'เลขบัตรประชาชนไม่สามารถใช้ได้', {
        position: 'top-right'
      });
      return;
    }
    
    // ถ้าไม่มี validation หรือ isValid ไม่ใช่ true ให้เช็คใหม่
    if (!idCardValidation || idCardValidation.isValid !== true) {
      const { valid, message } = await checkIdCard(formData.idCardNumber);
      if (!valid) {
        toast.error(message, { position: 'top-right' });
        return;
      }
    }
  }
  
  setErrorMessage('');
  
  if (currentStep < totalSteps) {
    console.log('Moving to next step:', currentStep + 1);
    setCurrentStep(currentStep + 1);
  }
}, [formData, currentStep, setCurrentStep, totalSteps, scrollToFirstError]);

  const handleSaveDraft = useCallback(async () => {
    try {
      // เตรียมข้อมูลสำหรับบันทึก draft ให้ครบถ้วน
      const draftDataToSave = {
        // ข้อมูลผู้สมัคร - ใช้ชื่อฟิลด์ตาม IC form
        idCardNumber: formData.idCardNumber,
        firstNameThai: formData.firstNameThai,
        lastNameThai: formData.lastNameThai,
        firstNameEng: formData.firstNameEng,
        lastNameEng: formData.lastNameEng,
        phone: formData.phone,
        phoneExtension: formData.phoneExtension,
        email: formData.email,
        
        // ที่อยู่ - ใช้โครงสร้างใหม่ตาม AddressSection (addresses แบบแยกตามประเภท 1/2/3)
        addresses: formData.addresses || {},
        
        // ข้อมูลบริษัท - ใช้ชื่อฟิลด์ตาม IC form
        companyNameThai: formData.companyNameThai,
        companyNameEng: formData.companyNameEng,
        taxId: formData.taxId,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        companyWebsite: formData.companyWebsite,
        // เก็บที่อยู่รูปแบบเดิมของ company ไว้หากมีการใช้งานที่อื่น (ไม่กระทบ AddressSection)
        street: formData.street,
        companySubDistrict: formData.companySubDistrict,
        companyDistrict: formData.companyDistrict,
        companyProvince: formData.companyProvince,
        companyPostalCode: formData.companyPostalCode,
        
        // กลุ่มอุตสาหกรรมและจังหวัด - ใช้ชื่อฟิลด์ตาม IC form
        industrialGroupId: formData.industrialGroupId,
        provincialChapterId: formData.provincialChapterId,
        
        // ข้อมูลผู้แทน
        representative: formData.representative,
        
        // ข้อมูลเพิ่มเติม
        businessTypes: formData.businessTypes,
        otherBusinessTypeDetail: formData.otherBusinessTypeDetail,
        products: formData.products,
        memberCount: formData.memberCount,
        registeredCapital: formData.registeredCapital,
        
        // Authorized signatory name fields
        authorizedSignatoryFirstNameTh: formData.authorizedSignatoryFirstNameTh,
        authorizedSignatoryLastNameTh: formData.authorizedSignatoryLastNameTh,
        authorizedSignatoryFirstNameEn: formData.authorizedSignatoryFirstNameEn,
        authorizedSignatoryLastNameEn: formData.authorizedSignatoryLastNameEn,
        
        // ข้อมูล validation
        _idCardValidation: formData._idCardValidation
      };

      // ตรวจสอบเลขบัตรประชาชนก่อนบันทึก
      if (!formData.idCardNumber || formData.idCardNumber.length !== 13) {
        toast.error('กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลักก่อนบันทึกร่าง');
        return;
      }

      const response = await fetch('/api/membership/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberType: 'ic',
          draftData: draftDataToSave,
          currentStep: currentStep
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // แสดง popup แทน toast
        setShowDraftSavePopup(true);
      } else {
        toast.error(result.message || 'ไม่สามารถบันทึกร่างได้');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกร่าง');
    }
  }, [formData, currentStep]);

  // ฟังก์ชันสำหรับลบ draft หลังจากสมัครสำเร็จ
  const deleteDraft = useCallback(async () => {
    try {
      // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ ID card number
      const response = await fetch('/api/membership/get-drafts?type=ic', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch drafts for deletion');
        return;
      }

      const data = await response.json();
      
      // ตรวจสอบว่า response เป็น array หรือไม่
      const drafts = Array.isArray(data) ? data : (data.drafts || []);
      
      // หา draft ที่ตรงกับ ID card number ของผู้สมัคร
      const draftToDelete = drafts.find(draft => 
        draft.draftData?.idCardNumber === formData.idCardNumber
      );

      if (draftToDelete) {
        const deleteResponse = await fetch('/api/membership/delete-draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberType: 'ic',
            draftId: draftToDelete.id
          })
        });

        const deleteResult = await deleteResponse.json();
        
        if (deleteResult.success) {
          console.log('Draft deleted successfully');
        } else {
          console.error('Failed to delete draft:', deleteResult.message || deleteResult.error || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }, [formData.idCardNumber]);

  // Handle previous step
  const handlePrev = useCallback((e) => {
    // ✅ ป้องกัน form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setCurrentStep(currentStep - 1);
  }, [currentStep, setCurrentStep]);

  // Render current step content
  const currentStepComponent = useMemo(() => {
    const commonProps = { formData, setFormData, errors };

    const stepComponents = {
      1: (
        <ApplicantInfoSection
          {...commonProps}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          isLoading={isLoading}
        />
      ),
      2: <RepresentativeInfoSection {...commonProps} />,
      3: <BusinessInfoSection {...commonProps} />,
      4: <DocumentUploadSection {...commonProps} />,
      5: (
        <SummarySection
          formData={formData}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onBack={handlePrevStep}
        />
      )
    };

    return stepComponents[currentStep] || null;
  }, [currentStep, formData, setFormData, errors, industrialGroups, provincialChapters, isLoading, isSubmitting, handleSubmit, handlePrevStep]);

  // Render error message helper
  const renderErrorMessage = (errorValue, key, index) => {
    if (typeof errorValue === 'object' && errorValue !== null) {
      return <li key={`${key}-${index}`} className="text-base">{JSON.stringify(errorValue)}</li>;
    }
    return <li key={`${key}-${index}`} className="text-base">{String(errorValue)}</li>;
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
      
      {/* ✅ ลบ onSubmit ออกจาก form tag เพื่อป้องกันการ submit ที่ไม่พึงประสงค์ */}
      <div className="space-y-8">
        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl" role="alert">
            <strong className="font-bold text-lg">กรุณาแก้ไขข้อมูลให้ถูกต้อง:</strong>
            <ul className="mt-4 list-disc list-inside space-y-2">
              {Object.keys(errors)
                .filter(key => key !== 'representativeErrors')
                .map((key, index) => renderErrorMessage(errors[key], key, index))}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl" role="alert">
            <strong className="font-bold text-lg">{errorMessage}</strong>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
          {currentStepComponent}
        </div>

        {/* Navigation Buttons - Fixed positioning - แสดงเฉพาะเมื่อไม่ใช่ step สุดท้าย */}
        {currentStep < totalSteps && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrev}
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
                    ขั้นตอนที่ {currentStep} จาก {totalSteps}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {currentStep < 5 && currentStep !== 4 && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
                  >
                    บันทึกร่าง
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
                  >
                    ถัดไป →
                  </button>
                ) : (
                  <button
                    type="button" // Changed to button to prevent form submission
                    onClick={handleSubmit} // Use handleSubmit for final step logic
                    disabled={isSubmitting}
                    className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
                    } text-white`}
                  >
                    {isSubmitting ? '⏳ กำลังส่ง...' : (rejectionId ? '✓ ยืนยันการส่งใบสมัครใหม่' : '✓ ยืนยันการสมัคร')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document preparation hint */}
        {currentStep === 1 && (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-base">
              <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> สำเนาบัตรประจำตัวประชาชน และเอกสารอื่นๆ ที่เกี่ยวข้อง
            </p>
          </div>
        )}
      </div>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        idCard={formData.idCardNumber}
        fullName={`${formData.firstNameTh || ''} ${formData.lastNameTh || ''}`.trim()}
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="ic"
        memberData={submissionResult?.memberData}
        onConfirm={() => {
          setShowSuccessModal(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard?tab=documents';
          }
        }}
      />
    </div>
  );
}