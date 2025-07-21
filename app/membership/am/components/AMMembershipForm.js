'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// นำเข้าคอมโพเนนต์ย่อยสำหรับแต่ละขั้นตอน
import AssociationInfoSection from './AssociationInfoSection';
import RepresentativeSection from './RepresentativeInfoSection';
import BusinessInfoSection from './BusinessInfoSection';
import DocumentsSection from './DocumentUploadSection';
import SummarySection from './SummarySection';

// นำเข้าโมดูลที่สร้างขึ้นใหม่
import { validateAMForm } from './AMFormValidation';
import { submitAMMembershipForm } from './AMFormSubmission';
import { useAMFormNavigation } from './AMFormNavigation';

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
  authorityLetter: null
};

// Custom hook สำหรับ API data
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

export default function AMMembershipForm() {
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
  } = useAMFormNavigation((formData, step) => validateAMForm(formData, step));

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log('AM Current Step:', currentStep);
  console.log('AM Total Steps:', totalSteps);

  // Check tax ID uniqueness
  const checkTaxIdUniqueness = useCallback(async (taxId) => {
    try {
      const response = await fetch(`/api/am-membership/check-tax-id?taxId=${taxId}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking tax ID uniqueness:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี');
    }
  }, []);

  // Handle form submission - เฉพาะสำหรับขั้นตอนสุดท้าย (step 5)
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // ✅ เพิ่มเงื่อนไข: ต้องอยู่ใน step 5 เท่านั้น
    if (currentStep !== 5) {
      console.log('AM Form submit prevented - not on final step');
      return;
    }
    
    const formErrors = validateAMForm(formData, currentStep);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
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
        toast.success(result.message);
        setTimeout(() => router.push('/dashboard?tab=status'), 2000);
      } else {
        toast.error(result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.dismiss('submitting');
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
      setIsSubmitting(false);
    }
  }, [formData, currentStep, router]);

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
      1: <AssociationInfoSection {...commonProps} setErrors={setErrors} />,
      2: <RepresentativeSection {...commonProps} />,
      3: <BusinessInfoSection {...commonProps} businessTypes={businessTypes} industrialGroups={industrialGroups} provincialChapters={provincialChapters} />,
      4: <DocumentsSection {...commonProps} />,
      5: <SummarySection formData={formData} businessTypes={businessTypes} industrialGroups={industrialGroups} provincialChapters={provincialChapters} />
    };

    return stepComponents[currentStep] || null;
  }, [currentStep, formData, errors, businessTypes, industrialGroups, provincialChapters]);

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

            {/* ✅ แก้ไขเงื่อนไขการแสดงปุ่ม */}
            {currentStep < 5 ? (
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
              <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> หนังสือรับรองสมาคม และทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)
            </p>
          </div>
        )}
      </form>
    </div>
  );
}