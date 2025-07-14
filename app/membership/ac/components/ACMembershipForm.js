'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Import components
import CompanyInfoSection from './CompanyInfoSection';
import RepresentativeSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentsSection from './DocumentUploadSection';
import SummarySection from './SummarySection';

// Import utilities
import { validateACForm } from './ACFormValidation';
import { submitACMembershipForm } from './ACFormSubmission';
import { useACFormNavigation } from './ACFormNavigation';

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
  
  companyRegistration: null,
  companyProfile: null,
  shareholderList: null,
  vatRegistration: null
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

export default function ACMembershipForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  
  const { businessTypes, industrialGroups, provincialChapters, isLoading } = useApiData();
  
  const {
    currentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleNextStep,
    handlePrevStep
  } = useACFormNavigation((formData, step) => validateACForm(formData, step));

  // Check tax ID uniqueness
  const checkTaxIdUniqueness = useCallback(async (taxId) => {
    try {
      // ใช้ API endpoint เดียวกับที่ใช้ใน ACFormSubmission.js
      const response = await fetch('/api/membership/check-tax-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxId, memberType: 'AC' })
      });
      
      const data = await response.json();
      
      // ปรับรูปแบบข้อมูลให้เข้ากับโค้ดที่มีอยู่
      return {
        isUnique: response.status === 200 && data.status === 'available',
        message: data.message
      };
    } catch (error) {
      console.error('Error checking tax ID uniqueness:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี');
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const formErrors = validateACForm(formData, currentStep);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitACMembershipForm(formData);
      
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => router.push('/dashboard?tab=status'), 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentStep, router]);

  // Handle next step
  const handleNext = useCallback(async () => {
    const formErrors = validateACForm(formData, currentStep);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    // Check tax ID uniqueness on step 1
    if (currentStep === 1 && formData.taxId?.length === 13) {
      try {
        const data = await checkTaxIdUniqueness(formData.taxId);
        
        if (!data.isUnique) {
          setErrors(prev => ({ ...prev, taxId: data.message }));
          toast.error(data.message);
          return;
        }
      } catch (error) {
        toast.error(error.message);
        return;
      }
    }
    
    handleNextStep(formData, setErrors);
  }, [formData, currentStep, checkTaxIdUniqueness, handleNextStep]);

  // Render current step component
  const currentStepComponent = useMemo(() => {
    const commonProps = { formData, setFormData, errors };

    const stepComponents = {
      1: <CompanyInfoSection {...commonProps} setErrors={setErrors} />,
      2: <RepresentativeSection {...commonProps} />,
      3: <BusinessInfoSection {...commonProps} businessTypes={businessTypes} industrialGroups={industrialGroups} provincialChapters={provincialChapters} isLoading={isLoading} />,
      4: <DocumentsSection {...commonProps} />,
      5: <SummarySection formData={formData} businessTypes={businessTypes} industrialGroups={industrialGroups} provincialChapters={provincialChapters} />
    };

    return stepComponents[currentStep] || null;
  }, [currentStep, formData, errors, businessTypes, industrialGroups, provincialChapters, isLoading]);

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
                  <li key={index} className="text-base">{errors[key]}</li>
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
              onClick={handlePrevStep}
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
                {isSubmitting ? '⏳ กำลังส่ง...' : '✓ ยืนยันการสมัคร'}
              </button>
            )}
          </div>
        </div>

        {/* Document preparation hint */}
        {currentStep === 1 && (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-base">
              <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> หนังสือรับรองบริษัท และทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)
            </p>
          </div>
        )}
      </form>
    </div>
  );
}