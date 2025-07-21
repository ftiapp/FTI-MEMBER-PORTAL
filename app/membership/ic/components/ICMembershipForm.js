'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ApplicantInfoSection from './ApplicantInfoSection';
import RepresentativeInfoSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentUploadSection from './DocumentUploadSection';
import SummarySection from './SummarySection';
import { validateCurrentStep } from './ICFormValidation';
import { checkIdCardUniqueness, submitICMembershipForm, checkIdCard } from './ICFormSubmission';
// ✅ ลบการ import useICFormNavigation ออกเพราะไม่ใช้แล้ว

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
    phone: ''
  },
  
  // Business info
  businessTypes: {},
  otherBusinessTypeDetail: '',
  products: [{ id: 1, nameTh: '', nameEn: '' }],
  
  // Document
  idCardDocument: null
};

// Custom hook for API data
const useApiData = () => {
  const [data, setData] = useState({
    businessTypes: [],
    industrialGroups: [],
    provincialChapters: [],
    isLoading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessTypesRes, industrialGroupsRes, provincialChaptersRes] = await Promise.all([
          fetch('/api/business-types'),
          fetch('/api/industrial-groups'),
          fetch('/api/provincial-chapters')
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
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();
  }, []);

  return data;
};

export default function ICMembershipForm({ currentStep, setCurrentStep, formData, setFormData, totalSteps }) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle previous step navigation
  const handlePrevStep = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  }, [currentStep, setCurrentStep]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { businessTypes, industrialGroups, provincialChapters, isLoading } = useApiData();

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log('IC Current Step:', currentStep);
  console.log('IC Total Steps:', totalSteps);

  // ✅ ลบการใช้ useICFormNavigation hook ออก เพราะเราจะใช้ navigation ภายในแล้ว

  // Initialize form data with empty values
  useEffect(() => {
    if (Object.keys(formData).length === 0) {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [formData, setFormData]);

  // ✅ ลบ checkIdCardUniquenessFn ออกเพราะใช้ checkIdCard โดยตรง
  
  // ✅ แก้ไขฟังก์ชัน handleSubmit เพื่อให้ทำงานได้ถูกต้อง
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
      const idCardCheckResult = await checkIdCard(formData.idCardNumber); // ✅ ใช้ checkIdCard แทน
      if (!idCardCheckResult.valid) {
        console.log('ID card check failed:', idCardCheckResult);
        toast.dismiss(loadingToastId);
        toast.error(idCardCheckResult.message);
        return;
      }

      // เตรียมข้อมูลสำหรับส่ง
      console.log('Preparing form data for submission...');
      const submissionData = {
        ...formData,
        // แปลงข้อมูล representative จาก object เป็น flat fields
        representativeFirstNameTh: formData.representative?.firstNameThai || '',
        representativeLastNameTh: formData.representative?.lastNameThai || '',
        representativeFirstNameEn: formData.representative?.firstNameEng || '',
        representativeLastNameEn: formData.representative?.lastNameEng || '',
        representativeEmail: formData.representative?.email || '',
        representativePhone: formData.representative?.phone || '',
        
        // แปลงข้อมูล business types
        businessTypes: Object.keys(formData.businessTypes || {}).filter(key => formData.businessTypes[key]),
        
        // แปลงข้อมูลเอกสาร
        idCardFile: formData.idCardDocument,
        
        // แปลงข้อมูลกลุ่มอุตสาหกรรม
        industryGroups: Array.isArray(formData.industrialGroupId) 
          ? formData.industrialGroupId 
          : [formData.industrialGroupId].filter(Boolean),
          
        // แปลงข้อมูลสภาอุตสาหกรรมจังหวัด
        provinceChapters: Array.isArray(formData.provincialChapterId) 
          ? formData.provincialChapterId 
          : [formData.provincialChapterId].filter(Boolean)
      };

      console.log('Submission data prepared:', submissionData);

      // ส่งข้อมูล
      console.log('Submitting form...');
      const result = await submitICMembershipForm(submissionData);
      
      // ปิด loading toast
      toast.dismiss(loadingToastId);
      
      if (result.success) {
        toast.success('ส่งข้อมูลสำเร็จ กรุณารอการติดต่อกลับจากเจ้าหน้าที่', {
          duration: 5000
        });
        
        // รีเซ็ตฟอร์มหรือไปหน้าสำเร็จ
        // setFormData(INITIAL_FORM_DATA);
        // setCurrentStep(1);
        
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
  }, [formData, totalSteps, currentStep, isSubmitting]); // ✅ ลบ checkIdCardUniquenessFn ออกจาก dependencies

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
  const handleNext = useCallback(async (e) => {
    // ✅ ป้องกัน form submission
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
      
      // แสดงข้อผิดพลาดที่เฉพาะเจาะจงสำหรับแต่ละขั้นตอน
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
      
      // Scroll to the first error field
      scrollToFirstError(formErrors);
      return;
    }

    if (currentStep === 1 && formData.idCardNumber) {
      const { valid, message } = await checkIdCard(formData.idCardNumber);
      if (!valid) {
        toast.error(message, { position: 'top-right' });
        return;
      }
    }
    
    setErrorMessage('');
    
    if (currentStep < totalSteps) {
      console.log('Moving to next step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  }, [formData, currentStep, setCurrentStep, totalSteps, scrollToFirstError]);

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
  }, [currentStep, formData, setFormData, errors, industrialGroups, provincialChapters, isLoading, isSubmitting, handleSubmit]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                .map((key, index) => (
                  <li key={index} className="text-base">
                    {typeof errors[key] === 'object' ? JSON.stringify(errors[key]) : String(errors[key])}
                  </li>
                ))}
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

              <button
                type="button"
                onClick={handleNext}
                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
              >
                ถัดไป →
              </button>
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
    </div>
  );
}