'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ApplicantInfoSection from './ApplicantInfoSection';
import RepresentativeInfoSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentUploadSection from './DocumentUploadSection';
import SummarySection from './SummarySection';
import { validateCurrentStep } from './ICFormValidation';
import { checkIdCardUniqueness, submitICMembershipForm } from './ICFormSubmission';
import { useICFormNavigation } from './ICFormNavigation';

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
  
  const { businessTypes, industrialGroups, provincialChapters, isLoading } = useApiData();

  // Custom hook for form navigation
  const { StepIndicator, NavigationButtons } = useICFormNavigation({
    currentStep,
    setCurrentStep,
    formData,
    errors,
    totalSteps,
    validateCurrentStep,
    checkIdCardUniqueness
  });

  // Initialize form data with empty values
  useEffect(() => {
    if (Object.keys(formData).length === 0) {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [formData, setFormData]);

  // Check ID card uniqueness
  const checkIdCardUniquenessFn = useCallback(async (idCardNumber) => {
    try {
      return await checkIdCardUniqueness(idCardNumber);
    } catch (error) {
      console.error('Error checking ID card uniqueness:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวประชาชน');
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Validate all steps before submission
      let allErrors = {};
      for (let step = 1; step <= totalSteps - 1; step++) {
        const stepErrors = validateCurrentStep(step, formData);
        allErrors = { ...allErrors, ...stepErrors };
      }

      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้องครบถ้วน');
        // Scroll to the first error field
        scrollToFirstError(allErrors);
        return;
      }

      // Check ID card uniqueness before submission
      const idCardCheckResult = await checkIdCardUniquenessFn(formData.idCardNumber);
      if (!idCardCheckResult.success) {
        toast.error(idCardCheckResult.message);
        return;
      }

      // Submit form data
      const result = await submitICMembershipForm(formData);
      if (result.success) {
        toast.success('ส่งข้อมูลสำเร็จ กรุณารอการติดต่อกลับจากเจ้าหน้าที่');
        // Reset form or redirect to success page
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, totalSteps, checkIdCardUniquenessFn]);

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

  // Handle next step
  const handleNext = useCallback(async () => {
    const formErrors = validateCurrentStep(currentStep, formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      // Scroll to the first error field
      scrollToFirstError(formErrors);
      return;
    }

    // Check ID card uniqueness on step 1
    if (currentStep === 1 && formData.idCardNumber?.length === 13) {
      try {
        const data = await checkIdCardUniquenessFn(formData.idCardNumber);
        
        if (!data.success) {
          setErrors(prev => ({ ...prev, idCardNumber: data.message }));
          toast.error(data.message);
          return;
        }
      } catch (error) {
        toast.error(error.message);
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  }, [formData, currentStep, checkIdCardUniquenessFn, setCurrentStep]);

  // Handle previous step
  const handlePrev = useCallback(() => {
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
        />
      )
    };

    return stepComponents[currentStep] || null;
  }, [currentStep, formData, errors, industrialGroups, provincialChapters, isLoading, isSubmitting, handleSubmit]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
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

        {/* Form Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
          {currentStepComponent}
        </div>

        {/* Navigation Buttons - Fixed positioning */}
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
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
                } text-white`}
              >
                {isSubmitting ? '⏳ กำลังส่ง...' : '✓ ส่งข้อมูล'}
              </button>
            )}
          </div>
        </div>

        {/* Document preparation hint */}
        {currentStep === 1 && (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-base">
              <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> สำเนาบัตรประจำตัวประชาชน และเอกสารอื่นๆ ที่เกี่ยวข้อง
            </p>
          </div>
        )}
      </form>
    </div>
  );
}