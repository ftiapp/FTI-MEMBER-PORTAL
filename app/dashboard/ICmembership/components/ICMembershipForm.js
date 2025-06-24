'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useICMembershipForm } from '../hooks/useICMembershipForm';
import { validateFile, formatFileSize } from '../utils/fileUtils';
import { 
  validateThaiID, 
  validateEmail, 
  validateMobile, 
  validatePostalCode, 
  validateThaiText, 
  validateEnglishText 
} from '../utils/validationUtils';
import ApplicantInfoSection from './ApplicantInfoSection';
import RepresentativeInfoSection from './RepresentativeInfoSection';
import AddressSection from './AddressSection';
import BusinessInfoSection from './BusinessInfoSection';
import FileUploadSection from './FileUploadSection';
import ErrorNotification from './ErrorNotification';

// Constants
const TOTAL_STEPS = 4;
const STEP_LABELS = [
  'ข้อมูลสมาชิก',
  'นามผู้แทนใช้สิทธิ', 
  'ที่อยู่ในการจัดส่งเอกสาร',
  'รายละเอียดอื่นๆ'
];

// Step validation schemas
const STEP_VALIDATIONS = {
  1: [
    { field: 'idCardNumber', required: true, validator: validateThaiID, 
      messages: { required: 'กรุณากรอกเลขบัตรประชาชน', invalid: 'เลขบัตรประชาชนไม่ถูกต้อง กรุณากรอกเป็นตัวเลข 13 หลัก' }},
    { field: 'firstNameThai', required: true, validator: validateThaiText,
      messages: { required: 'กรุณากรอกชื่อ (ภาษาไทย)', invalid: 'กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น' }},
    { field: 'lastNameThai', required: true, validator: validateThaiText,
      messages: { required: 'กรุณากรอกนามสกุล (ภาษาไทย)', invalid: 'กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น' }},
    { field: 'firstNameEnglish', required: false, validator: validateEnglishText,
      messages: { invalid: 'กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น' }},
    { field: 'lastNameEnglish', required: false, validator: validateEnglishText,
      messages: { invalid: 'กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น' }},
    { field: 'selectedIndustryGroups', required: false },
    { field: 'selectedProvinceChapters', required: false }
  ],
  2: [
    { field: 'representativeFirstNameThai', required: true, validator: validateThaiText,
      messages: { required: 'กรุณากรอกชื่อผู้แทน (ภาษาไทย)', invalid: 'กรุณากรอกชื่อผู้แทนเป็นภาษาไทยเท่านั้น' }},
    { field: 'representativeLastNameThai', required: true, validator: validateThaiText,
      messages: { required: 'กรุณากรอกนามสกุลผู้แทน (ภาษาไทย)', invalid: 'กรุณากรอกนามสกุลผู้แทนเป็นภาษาไทยเท่านั้น' }},
    { field: 'representativeEmail', required: true, validator: validateEmail,
      messages: { required: 'กรุณากรอกอีเมลผู้แทน', invalid: 'รูปแบบอีเมลไม่ถูกต้อง' }},
    { field: 'representativeMobile', required: true, validator: validateMobile,
      messages: { required: 'กรุณากรอกเบอร์มือถือผู้แทน', invalid: 'รูปแบบเบอร์มือถือไม่ถูกต้อง' }}
  ],
  3: [
    { field: 'addressNumber', required: true,
      messages: { required: 'กรุณากรอกเลขที่' }},
    { field: 'addressSubdistrict', required: true,
      messages: { required: 'กรุณากรอกตำบล/แขวง' }},
    { field: 'addressDistrict', required: true,
      messages: { required: 'กรุณากรอกอำเภอ/เขต' }},
    { field: 'addressProvince', required: true,
      messages: { required: 'กรุณากรอกจังหวัด' }},
    { field: 'addressPostalCode', required: true, validator: validatePostalCode,
      messages: { required: 'กรุณากรอกรหัสไปรษณีย์', invalid: 'รหัสไปรษณีย์ไม่ถูกต้อง' }},
    { field: 'contactEmail', required: true, validator: validateEmail,
      messages: { required: 'กรุณากรอกอีเมล', invalid: 'รูปแบบอีเมลไม่ถูกต้อง' }},
    { field: 'contactMobile', required: true, validator: validateMobile,
      messages: { required: 'กรุณากรอกเบอร์มือถือ', invalid: 'รูปแบบเบอร์มือถือไม่ถูกต้อง' }}
  ],
  4: [
    { field: 'businessTypes', required: true, validator: (value) => Array.isArray(value) && value.length > 0,
      messages: { required: 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท' }},
    { field: 'businessTypeOther', required: false, conditional: (formData) => formData.businessTypes?.includes('other'),
      messages: { required: 'กรุณาระบุประเภทธุรกิจอื่นๆ' }},
    { field: 'productsThai', required: true,
      messages: { required: 'กรุณากรอกผลิตภัณฑ์/บริการ (ภาษาไทย)' }},
    { field: 'idCardFile', required: true,
      messages: { required: 'กรุณาแนบสำเนาบัตรประชาชนพร้อมเซ็นกำกับ' }}
  ]
};

// Step Icons Component
const StepIcon = React.memo(({ step, currentStep }) => {
  const isCompleted = currentStep > step;
  const isCurrent = currentStep === step;
  
  const iconClass = `w-5 h-5`;
  const containerClass = `w-10 h-10 rounded-full flex items-center justify-center ${
    isCompleted 
      ? 'bg-green-500 text-white' 
      : isCurrent 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-200 text-gray-600'
  }`;

  if (isCompleted) {
    return (
      <div className={containerClass}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  const icons = {
    1: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    2: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    3: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    4: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  return (
    <div className={containerClass}>
      {icons[step]}
    </div>
  );
});

StepIcon.displayName = 'StepIcon';

/**
 * IC Membership Form Component with optimized performance and validation
 */
export default function ICMembershipForm({ onSubmit, isSubmitting }) {
  const {
    formData,
    errors,
    setErrors,
    isLoading,
    industryGroups,
    provinceChapters,
    businessCategories,
    handleChange,
    handleCheckboxChange,
    handleFileChange,
    validateForm,
    resetForm,
  } = useICMembershipForm();

  const [currentStep, setCurrentStep] = useState(1);

  // Optimized validation function using useMemo
  const validateCurrentStep = useCallback((step, data) => {
    const validations = STEP_VALIDATIONS[step];
    if (!validations) return { isValid: true, errors: {} };

    const newErrors = {};
    let isValid = true;

    validations.forEach(({ field, required, validator, messages, conditional }) => {
      const value = data[field];
      const isEmpty = !value || (Array.isArray(value) && value.length === 0);
      
      // Check conditional requirement
      const isConditionallyRequired = conditional ? conditional(data) : required;
      
      if (isConditionallyRequired && isEmpty) {
        isValid = false;
        newErrors[field] = messages.required;
        return;
      }

      if (!isEmpty && validator && !validator(value)) {
        isValid = false;
        newErrors[field] = messages.invalid;
      }
    });

    return { isValid, errors: newErrors };
  }, []);

  // Optimized step navigation
  const nextStep = useCallback(() => {
    const { isValid, errors: validationErrors } = validateCurrentStep(currentStep, formData);
    
    if (!isValid) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      // Clear errors when moving to next step
      setErrors({});
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, formData, validateCurrentStep, setErrors]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, setErrors]);

  // Optimized form submission
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const isValid = validateForm();
      
      if (isValid) {
        const formDataToSubmit = { ...formData };
        await onSubmit(formDataToSubmit);
        resetForm();
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองอีกครั้ง' 
      }));
    }
  }, [formData, validateForm, onSubmit, resetForm, setErrors]);

  // Memoized step content rendering
  const stepContent = useMemo(() => {
    const commonProps = {
      formData,
      errors,
      handleChange,
      isLoading
    };

    switch (currentStep) {
      case 1:
        return (
          <ApplicantInfoSection 
            {...commonProps}
            handleCheckboxChange={handleCheckboxChange}
            industryGroups={industryGroups}
            provinceChapters={provinceChapters}
          />
        );
      case 2:
        return <RepresentativeInfoSection {...commonProps} />;
      case 3:
        return <AddressSection {...commonProps} />;
      case 4:
        return (
          <>
            <BusinessInfoSection
              {...commonProps}
              handleCheckboxChange={handleCheckboxChange}
              businessCategories={businessCategories}
            />
            <FileUploadSection
              formData={formData}
              errors={errors}
              handleFileChange={handleFileChange}
            />
          </>
        );
      default:
        return null;
    }
  }, [
    currentStep, 
    formData, 
    errors, 
    handleChange, 
    handleCheckboxChange, 
    handleFileChange, 
    isLoading,
    industryGroups,
    provinceChapters,
    businessCategories
  ]);

  // Memoized progress calculation
  const progressPercentage = useMemo(() => {
    return (currentStep / TOTAL_STEPS) * 100;
  }, [currentStep]);

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md relative">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <div key={index} className="flex flex-col items-center">
                <StepIcon step={index + 1} currentStep={currentStep} />
                <span className="text-xs mt-1 text-gray-600 text-center max-w-20">
                  {STEP_LABELS[index]}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-1 relative overflow-hidden rounded-full">
            <div 
              className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
              aria-label={`ความคืบหน้า ${progressPercentage.toFixed(0)}%`}
            />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit} noValidate>
          <div className="min-h-96">
            {stepContent}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                disabled={isSubmitting}
                aria-label="ย้อนกลับไปขั้นตอนก่อนหน้า"
              >
                ← ย้อนกลับ
              </button>
            ) : (
              <div />
            )}
            
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isSubmitting}
                aria-label="ไปขั้นตอนถัดไป"
              >
                ถัดไป →
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={isLoading || isSubmitting}
                aria-label="ส่งใบสมัครสมาชิก"
              >
                {isSubmitting ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    กำลังส่งข้อมูล...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                      />
                    </svg>
                    ส่งใบสมัคร
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}